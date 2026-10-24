import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";
import "./ResourcesAdmin.css";

const API = import.meta.env.VITE_API;
const clone = (value) => structuredClone(value);
const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

function move(items, index, direction) {
  const next = [...items];
  const destination = index + direction;
  if (destination < 0 || destination >= next.length) return items;
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

export default function ResourcesAdmin() {
  const { token } = useAuth();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const dirty = useMemo(() => Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved)), [draft, saved]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/resources`, { signal: controller.signal })
      .then(readResponse)
      .then(data => { setSaved(data.content); setDraft(clone(data.content)); setRevision(data.revision); })
      .catch(error => { if (error.name !== "AbortError") setNotice({ error: true, text: error.message }); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    function warn(event) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateCategory(id, update) {
    setDraft(current => ({ ...current, categories: current.categories.map(group => group.id === id ? update(group) : group) }));
  }
  function updateLink(groupId, id, field, value) {
    updateCategory(groupId, group => ({ ...group, links: group.links.map(link => link.id === id ? { ...link, [field]: value } : link) }));
  }
  function removeCategory(group) {
    if (!window.confirm(`Remove “${group.title || "this category"}” and its ${group.links.length} resources? This takes effect only after Save and publish.`)) return;
    setDraft(current => ({ ...current, categories: current.categories.filter(item => item.id !== group.id) }));
  }
  function removeLink(group, link) {
    if (!window.confirm(`Remove “${link.text || "this resource"}”? This takes effect only after Save and publish.`)) return;
    updateCategory(group.id, current => ({ ...current, links: current.links.filter(item => item.id !== link.id) }));
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const data = await fetch(`${API}/api/resources`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: { ...draft, categories: draft.categories.map(group => ({ ...group, section: "learn" })) }, revision }),
      }).then(readResponse);
      setSaved(data.content); setDraft(clone(data.content)); setRevision(data.revision);
      setNotice({ text: "Resources changes are live." });
    } catch (error) { setNotice({ error: true, text: error.message }); }
    finally { setSaving(false); }
  }
  function discard() {
    if (window.confirm("Discard your unsaved Resources changes?")) {
      setDraft(clone(saved)); setNotice({ text: "Unsaved changes discarded." });
    }
  }

  if (loading) return <main className="faq-admin resources-admin"><p>Loading Resources editor…</p></main>;
  if (!draft) return <main className="faq-admin resources-admin"><p role="alert">{notice?.text || "Resources could not be loaded."}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main>;

  const totalLinks = draft.categories.reduce((sum, group) => sum + group.links.length, 0);
  return <main className="faq-admin resources-admin">
    <header className="faq-admin__header">
      <div><span>Owner tool</span><h1>Edit Resources</h1><p>Manage categories and their resource links. Changes appear on the public Resources page after you save and publish.</p><small className="faq-admin__revision">Saved revision {revision}.</small></div>
      <a href="/resources" target="_blank" rel="noreferrer">Open Resources <ExternalLink size={16} /></a>
    </header>
    {notice && <div className={`faq-admin__notice ${notice.error ? "is-error" : "is-success"}`} role={notice.error ? "alert" : "status"}>{notice.text}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice(null)}>×</button></div>}
    <form onSubmit={save}>
      <fieldset disabled={saving} className="resources-admin__fieldset">
        <section className="faq-admin__section">
          <div className="faq-admin__section-heading"><span>Page introduction</span><h2>Page text</h2></div>
          <div className="faq-admin__fields">
            <label>Small heading<input required maxLength={120} value={draft.hero.kicker} onChange={event => setDraft({ ...draft, hero: { ...draft.hero, kicker: event.target.value } })} /></label>
            <label>Page title<input required maxLength={180} value={draft.hero.title} onChange={event => setDraft({ ...draft, hero: { ...draft.hero, title: event.target.value } })} /></label>
            <label>Introduction<textarea required rows={3} maxLength={800} value={draft.hero.intro} onChange={event => setDraft({ ...draft, hero: { ...draft.hero, intro: event.target.value } })} /></label>
            <label>Learn introduction<textarea required rows={3} maxLength={1200} value={draft.learnIntro} onChange={event => setDraft({ ...draft, learnIntro: event.target.value })} /></label>
            <label>Find Support introduction<textarea required rows={3} maxLength={1200} value={draft.supportIntro} onChange={event => setDraft({ ...draft, supportIntro: event.target.value })} /></label>
          </div>
        </section>
        {draft.categories.map((group, groupIndex) => <section className="faq-admin__section" key={group.id} aria-label={`Category ${groupIndex + 1}`}>
          <div className="resources-admin__heading">
            <div className="faq-admin__section-heading"><span>Category {groupIndex + 1}</span><h2>{group.title || "New category"}</h2></div>
            <div className="resources-admin__controls">
              <button type="button" disabled={groupIndex === 0} aria-label={`Move category ${groupIndex + 1} up`} onClick={() => setDraft({ ...draft, categories: move(draft.categories, groupIndex, -1) })}><ArrowUp size={16} /></button>
              <button type="button" disabled={groupIndex === draft.categories.length - 1} aria-label={`Move category ${groupIndex + 1} down`} onClick={() => setDraft({ ...draft, categories: move(draft.categories, groupIndex, 1) })}><ArrowDown size={16} /></button>
              <button type="button" className="resources-admin__delete" onClick={() => removeCategory(group)}><Trash2 size={15} /> Delete category</button>
            </div>
          </div>
          <div className="faq-admin__fields resources-admin__category-fields">
            <label>Category title<input required maxLength={140} value={group.title} onChange={event => updateCategory(group.id, current => ({ ...current, title: event.target.value }))} /></label>
          </div>
          <div className="faq-admin__questions">
            {group.links.map((link, index) => <article key={link.id} aria-label={`Resource ${index + 1}`}>
              <div className="faq-admin__question-heading">
                <span>Resource {index + 1}</span>
                <div className="resources-admin__controls">
                  <button type="button" disabled={index === 0} aria-label={`Move resource ${index + 1} up`} onClick={() => updateCategory(group.id, current => ({ ...current, links: move(current.links, index, -1) }))}><ArrowUp size={16} /></button>
                  <button type="button" disabled={index === group.links.length - 1} aria-label={`Move resource ${index + 1} down`} onClick={() => updateCategory(group.id, current => ({ ...current, links: move(current.links, index, 1) }))}><ArrowDown size={16} /></button>
                  <button type="button" className="resources-admin__delete" onClick={() => removeLink(group, link)}><Trash2 size={15} /> Delete resource</button>
                </div>
              </div>
              <label>Resource title<input required maxLength={500} value={link.text} onChange={event => updateLink(group.id, link.id, "text", event.target.value)} /></label>
              <label>Website address<input type="url" required maxLength={2000} placeholder="https://example.org" value={link.url} onChange={event => updateLink(group.id, link.id, "url", event.target.value)} /></label>
              <label>Label (optional)<input maxLength={60} placeholder="For example: Video, Study, or Organization" value={link.tag} onChange={event => updateLink(group.id, link.id, "tag", event.target.value)} /></label>
            </article>)}
            {group.links.length === 0 && <p className="resources-admin__empty">No resources in this category yet.</p>}
            <button type="button" className="faq-admin__add-question" disabled={group.links.length >= 60 || totalLinks >= 300} onClick={() => updateCategory(group.id, current => ({ ...current, links: [...current.links, { id: newId("resource"), text: "", url: "", tag: "" }] }))}><Plus size={17} /> Add resource</button>
          </div>
        </section>)}
        <button type="button" className="faq-admin__add-question resources-admin__add-category" disabled={draft.categories.length >= 20} onClick={() => setDraft({ ...draft, categories: [...draft.categories, { id: newId("category"), title: "", section: "learn", links: [] }] })}><Plus size={17} /> Add category</button>
      </fieldset>
      {dirty && <div className="faq-admin__actions" data-mobile-action-bar>
        <span role="status">You have unsaved changes.</span>
        <button type="button" disabled={saving} onClick={discard}><RotateCcw size={17} /> Discard</button>
        <button className="faq-admin__save" disabled={saving}><Save size={17} /> {saving ? "Saving…" : "Save and publish"}</button>
      </div>}
    </form>
  </main>;
}
