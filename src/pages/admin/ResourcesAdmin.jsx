import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";
import "./DiscountAdmin.css";
import "./ResourcesAdmin.css";

const API = import.meta.env.VITE_API;
const clone = value => structuredClone(value);
const pageFields = content => ({ hero: content.hero, learnIntro: content.learnIntro, supportIntro: content.supportIntro });
function same(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && same(a[key], b[key]));
}
async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}
function reordered(items, id, direction, savedItems) {
  const savedIds = new Set(savedItems.map(item => item.id));
  const order = items.filter(item => savedIds.has(item.id));
  const index = order.findIndex(item => item.id === id);
  const target = order[index + direction];
  if (index < 0 || !target) return null;
  const next = [...items];
  const from = next.findIndex(item => item.id === id);
  const to = next.findIndex(item => item.id === target.id);
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export default function ResourcesAdmin() {
  const { token } = useAuth();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingLock = useRef(false);
  const [notice, setNotice] = useState(null);
  const [feedback, setFeedback] = useState({});
  const dirty = useMemo(() => Boolean(draft && saved && !same(draft, saved)), [draft, saved]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/resources`, { signal: controller.signal }).then(readResponse)
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
  function clearFeedback(key) { setFeedback(current => ({ ...current, [key]: null })); }
  function updateCategory(id, update) {
    setDraft(current => ({ ...current, categories: current.categories.map(group => group.id === id ? update(group) : group) }));
  }
  function updateTitle(id, title) {
    clearFeedback("category:" + id);
    updateCategory(id, current => ({ ...current, title }));
  }
  function updateLink(groupId, id, field, value) {
    clearFeedback("resource:" + id);
    updateCategory(groupId, group => ({ ...group, links: group.links.map(link => link.id === id ? { ...link, [field]: value } : link) }));
  }
  function updatePage(field, value, hero = false) {
    clearFeedback("page");
    setDraft(current => hero ? { ...current, hero: { ...current.hero, [field]: value } } : { ...current, [field]: value });
  }
  // The server applies just this action to saved content. The callback updates
  // only that part of the browser draft, preserving all other unfinished edits.
  async function commit(edit, key, message, onSaved, rollback) {
    if (savingLock.current) return;
    savingLock.current = true; setSaving(true); setNotice(null); clearFeedback(key);
    try {
      const data = await fetch(`${API}/api/resources/items`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...edit, revision }),
      }).then(readResponse);
      setSaved(data.content); setRevision(data.revision);
      onSaved?.(data.content);
      setFeedback(current => ({ ...current, [key]: { text: message } }));
      setNotice({ text: message });
    } catch (error) {
      rollback?.();
      setFeedback(current => ({ ...current, [key]: { error: true, text: error.message } }));
      setNotice({ error: true, text: error.message });
    } finally { savingLock.current = false; setSaving(false); }
  }
  function savePage(event) {
    event.preventDefault();
    commit({ action: "save-page-text", pageText: pageFields(draft) }, "page", "Page text saved.", content => setDraft(current => ({ ...current, ...clone(pageFields(content)) })));
  }
  function saveCategory(event, category) {
    event.preventDefault();
    commit({ action: "save-category", categoryId: category.id, category: { title: category.title } }, "category:" + category.id, "Category saved.", content => {
      const stored = content.categories.find(item => item.id === category.id);
      updateCategory(category.id, current => ({ ...current, title: stored.title, section: stored.section }));
    });
  }
  function discardCategory(category) {
    const stored = saved.categories.find(item => item.id === category.id);
    if (stored) updateCategory(category.id, current => ({ ...current, title: stored.title, section: stored.section }));
    else setDraft(current => ({ ...current, categories: current.categories.filter(item => item.id !== category.id) }));
    clearFeedback("category:" + category.id);
  }
  function saveResource(event, categoryId, resource) {
    event.preventDefault();
    commit({ action: "save-resource", categoryId, resource }, "resource:" + resource.id, "Resource saved.", content => {
      const stored = content.categories.find(item => item.id === categoryId).links.find(item => item.id === resource.id);
      updateCategory(categoryId, current => ({ ...current, links: current.links.map(item => item.id === resource.id ? clone(stored) : item) }));
    });
  }
  function discardResource(categoryId, resource) {
    const stored = saved.categories.find(item => item.id === categoryId)?.links.find(item => item.id === resource.id);
    updateCategory(categoryId, current => ({ ...current, links: stored ? current.links.map(item => item.id === resource.id ? clone(stored) : item) : current.links.filter(item => item.id !== resource.id) }));
    clearFeedback("resource:" + resource.id);
  }
  function removeCategory(category) {
    const exists = saved.categories.some(item => item.id === category.id);
    if (!window.confirm(exists ? `Delete "${category.title}" and all its resources from the public page? Unfinished edits in this category will also be removed.` : "Remove this unsaved category?")) return;
    const remove = () => setDraft(current => ({ ...current, categories: current.categories.filter(item => item.id !== category.id) }));
    if (exists) commit({ action: "delete-category", categoryId: category.id }, "category:" + category.id, "Category deleted.", remove);
    else remove();
  }
  function removeResource(categoryId, resource) {
    const exists = saved.categories.find(item => item.id === categoryId)?.links.some(item => item.id === resource.id);
    if (!window.confirm(exists ? `Delete "${resource.text}" from the public page?` : "Remove this unsaved resource?")) return;
    const remove = () => updateCategory(categoryId, current => ({ ...current, links: current.links.filter(item => item.id !== resource.id) }));
    if (exists) commit({ action: "delete-resource", categoryId, resourceId: resource.id }, "resource:" + resource.id, "Resource deleted.", remove);
    else remove();
  }
  function moveCategory(id, direction) {
    if (savingLock.current) return;
    const categories = reordered(draft.categories, id, direction, saved.categories);
    if (!categories) return;
    const previous = draft;
    setDraft({ ...draft, categories });
    commit({ action: "reorder-categories", ids: categories.filter(item => saved.categories.some(stored => stored.id === item.id)).map(item => item.id) }, "category:" + id, "Order saved.", null, () => setDraft(previous));
  }
  function moveResource(category, id, direction) {
    if (savingLock.current) return;
    const stored = saved.categories.find(item => item.id === category.id);
    const links = reordered(category.links, id, direction, stored.links);
    if (!links) return;
    const previous = draft;
    updateCategory(category.id, current => ({ ...current, links }));
    commit({ action: "reorder-resources", categoryId: category.id, ids: links.filter(item => stored.links.some(link => link.id === item.id)).map(item => item.id) }, "resource:" + id, "Order saved.", null, () => setDraft(previous));
  }
  function status(key) {
    const item = feedback[key];
    return item && <p className={`discount-admin__status ${item.error ? "is-error" : ""}`} role={item.error ? "alert" : "status"}>{item.text}</p>;
  }
  function saveActions(changed, onDiscard, label) {
    return <div className="discount-admin__save-actions">
      {changed && <button type="button" onClick={onDiscard}><RotateCcw size={15} /> Discard edits</button>}
      <button className="discount-admin__save-item" disabled={!changed}><Save size={16} /> {label}</button>
    </div>;
  }
  if (loading) return <main className="faq-admin resources-admin"><p>Loading Resources editor...</p></main>;
  if (!draft) return <main className="faq-admin resources-admin"><p role="alert">{notice?.text || "Resources could not be loaded."}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main>;
  const totalLinks = draft.categories.reduce((sum, category) => sum + category.links.length, 0);
  const savedOrder = draft.categories.filter(item => saved.categories.some(stored => stored.id === item.id));
  return <main className="faq-admin resources-admin">
    <header className="faq-admin__header">
      <div><span>Owner tool</span><h1>Edit Resources</h1><p>Save each resource or category when you finish. Reordering saves automatically.</p><small className="faq-admin__revision">Saved revision {revision}.{dirty ? " You have unfinished edits." : ""}</small></div>
      <a href="/resources" target="_blank" rel="noreferrer">Open Resources <ExternalLink size={16} /></a>
    </header>
    {notice && <div className={`faq-admin__notice ${notice.error ? "is-error" : "is-success"}`} role={notice.error ? "alert" : "status"}><span>{notice.text}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice(null)}>x</button></div>}
    <fieldset disabled={saving} className="resources-admin__fieldset">
      <section className="faq-admin__section" aria-label="Page text">
        <div className="faq-admin__section-heading"><span>Page introduction</span><h2>Page text</h2></div>
        <form onSubmit={savePage}>
          <div className="faq-admin__fields">
            <label>Small heading<input required maxLength={120} value={draft.hero.kicker} onChange={event => updatePage("kicker", event.target.value, true)} /></label>
            <label>Page title<input required maxLength={180} value={draft.hero.title} onChange={event => updatePage("title", event.target.value, true)} /></label>
            <label>Introduction<textarea required rows={3} maxLength={800} value={draft.hero.intro} onChange={event => updatePage("intro", event.target.value, true)} /></label>
            <label>Learn introduction<textarea required rows={3} maxLength={1200} value={draft.learnIntro} onChange={event => updatePage("learnIntro", event.target.value)} /></label>
            <label>Find Support introduction<textarea required rows={3} maxLength={1200} value={draft.supportIntro} onChange={event => updatePage("supportIntro", event.target.value)} /></label>
          </div>
          {status("page")}
          {saveActions(!same(pageFields(draft), pageFields(saved)), () => { setDraft(current => ({ ...current, ...clone(pageFields(saved)) })); clearFeedback("page"); }, "Save page text")}
        </form>
      </section>
      {draft.categories.map((category, categoryIndex) => {
        const stored = saved.categories.find(item => item.id === category.id);
        const orderIndex = savedOrder.findIndex(item => item.id === category.id);
        const resourceOrder = category.links.filter(item => stored?.links.some(link => link.id === item.id));
        return <section className="faq-admin__section" key={category.id} data-category-id={category.id} aria-label={`Category ${categoryIndex + 1}`}>
          <div className="resources-admin__heading">
            <div className="faq-admin__section-heading"><span>Category {categoryIndex + 1}</span><h2>{category.title || "New category"}</h2></div>
            <div className="resources-admin__controls">
              <button type="button" disabled={!stored || orderIndex === 0} aria-label={`Move category ${categoryIndex + 1} up`} onClick={() => moveCategory(category.id, -1)}><ArrowUp size={16} /></button>
              <button type="button" disabled={!stored || orderIndex === savedOrder.length - 1} aria-label={`Move category ${categoryIndex + 1} down`} onClick={() => moveCategory(category.id, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="resources-admin__delete" onClick={() => removeCategory(category)}><Trash2 size={15} /> Delete category</button>
            </div>
          </div>
          <form className="resources-admin__category-fields" onSubmit={event => saveCategory(event, category)}>
            <label>Category title<input required maxLength={140} value={category.title} onChange={event => updateTitle(category.id, event.target.value)} /></label>
            {status("category:" + category.id)}
            {saveActions(!stored || category.title !== stored.title, () => discardCategory(category), "Save category")}
          </form>
          <div className="faq-admin__questions">
            {category.links.map((resource, index) => {
              const savedResource = stored?.links.find(item => item.id === resource.id);
              const resourceIndex = resourceOrder.findIndex(item => item.id === resource.id);
              return <article key={resource.id} data-resource-id={resource.id} aria-label={`Resource ${index + 1}`}>
                <div className="faq-admin__question-heading">
                  <span>Resource {index + 1}</span>
                  <div className="resources-admin__controls">
                    <button type="button" disabled={!savedResource || resourceIndex === 0} aria-label={`Move resource ${index + 1} up`} onClick={() => moveResource(category, resource.id, -1)}><ArrowUp size={16} /></button>
                    <button type="button" disabled={!savedResource || resourceIndex === resourceOrder.length - 1} aria-label={`Move resource ${index + 1} down`} onClick={() => moveResource(category, resource.id, 1)}><ArrowDown size={16} /></button>
                    <button type="button" className="resources-admin__delete" onClick={() => removeResource(category.id, resource)}><Trash2 size={15} /> Delete resource</button>
                  </div>
                </div>
                <form className="resources-admin__resource-form" onSubmit={event => saveResource(event, category.id, resource)}>
                  <label>Resource title<input required maxLength={500} value={resource.text} onChange={event => updateLink(category.id, resource.id, "text", event.target.value)} /></label>
                  <label>Website address<input type="url" required maxLength={2000} placeholder="https://example.org" value={resource.url} onChange={event => updateLink(category.id, resource.id, "url", event.target.value)} /></label>
                  <label>Label (optional)<input maxLength={60} placeholder="For example: Video, Study, or Organization" value={resource.tag} onChange={event => updateLink(category.id, resource.id, "tag", event.target.value)} /></label>
                  {status("resource:" + resource.id)}
                  {saveActions(!savedResource || !same(resource, savedResource), () => discardResource(category.id, resource), "Save resource")}
                </form>
              </article>;
            })}
            {!category.links.length && <p className="resources-admin__empty">No resources in this category yet.</p>}
            {!stored && <p className="resources-admin__empty">Save this category before adding resources or changing its order.</p>}
            <button type="button" className="faq-admin__add-question" disabled={!stored || category.links.length >= 60 || totalLinks >= 300} onClick={() => updateCategory(category.id, current => ({ ...current, links: [...current.links, { id: `resource-${crypto.randomUUID()}`, text: "", url: "", tag: "" }] }))}><Plus size={17} /> Add resource</button>
          </div>
        </section>;
      })}
      <button type="button" className="faq-admin__add-question resources-admin__add-category" disabled={draft.categories.length >= 20} onClick={() => setDraft(current => ({ ...current, categories: [...current.categories, { id: `category-${crypto.randomUUID()}`, title: "", section: "learn", links: [] }] }))}><Plus size={17} /> Add category</button>
    </fieldset>
  </main>;
}
