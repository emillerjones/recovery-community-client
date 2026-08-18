import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";

const API = import.meta.env.VITE_API;
const clone = (value) => JSON.parse(JSON.stringify(value));

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function FAQAdmin() {
  const { token } = useAuth();
  const [savedContent, setSavedContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const dirty = useMemo(
    () => Boolean(draft && savedContent && JSON.stringify(draft) !== JSON.stringify(savedContent)),
    [draft, savedContent]
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/faq2`)
      .then(readResponse)
      .then((data) => {
        if (cancelled) return;
        setSavedContent(data.content);
        setDraft(clone(data.content));
        setRevision(data.revision);
      })
      .catch((error) => { if (!cancelled) setNotice(error.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  function updateHero(field, value) {
    setDraft((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  }

  function updateGroup(groupIndex, field, value) {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group, index) => index === groupIndex ? { ...group, [field]: value } : group),
    }));
  }

  function updateItem(groupIndex, itemIndex, field, value) {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group, index) => index !== groupIndex ? group : {
        ...group,
        items: group.items.map((item, innerIndex) => innerIndex === itemIndex ? { ...item, [field]: value } : item),
      }),
    }));
  }

  function addQuestion(groupIndex) {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group, index) => index !== groupIndex ? group : {
        ...group,
        items: [...group.items, {
          id: `question-${crypto.randomUUID()}`,
          question: "",
          answer: "",
        }],
      }),
    }));
    setNotice("New question added. Complete it, then save and publish.");
  }

  function deleteQuestion(groupIndex, itemIndex) {
    const group = draft.groups[groupIndex];
    const item = group.items[itemIndex];
    if (group.items.length === 1) return;
    if (!window.confirm(`Remove “${item.question || "this new question"}”? It will not be permanently deleted until you save and publish.`)) return;
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((currentGroup, index) => index !== groupIndex ? currentGroup : {
        ...currentGroup,
        items: currentGroup.items.filter((_, innerIndex) => innerIndex !== itemIndex),
      }),
    }));
    setNotice("Question removed from this draft. Save and publish to make it permanent.");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const data = await fetch(`${API}/api/faq2`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, revision }),
      }).then(readResponse);
      setSavedContent(data.content);
      setDraft(clone(data.content));
      setRevision(data.revision);
      setNotice("FAQ2 changes are live.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!dirty || window.confirm("Discard your unsaved FAQ2 changes?")) {
      setDraft(clone(savedContent));
      setNotice("Unsaved changes discarded.");
    }
  }

  if (loading) return <main className="faq-admin"><p>Loading FAQ2 editor…</p></main>;
  if (!draft) return <main className="faq-admin"><div className="faq-admin__notice is-error">{notice || "FAQ2 could not be loaded."}</div></main>;

  return (
    <main className="faq-admin">
      <header className="faq-admin__header">
        <div><span>Owner tool</span><h1>Edit FAQ2</h1><p>Changes saved here appear only on the independent <strong>/faq2</strong> page. The existing FAQ remains untouched.</p></div>
        <a href="/faq2" target="_blank" rel="noreferrer">Open FAQ2 <ExternalLink size={16} /></a>
      </header>

      {notice && <div className={`faq-admin__notice ${notice.includes("live") ? "is-success" : ""}`} role="status">{notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}

      <form onSubmit={save}>
        <section className="faq-admin__section">
          <div className="faq-admin__section-heading"><span>Page introduction</span><h2>Hero text</h2></div>
          <div className="faq-admin__fields">
            <label>Small heading<input value={draft.hero.kicker} maxLength={120} onChange={(event) => updateHero("kicker", event.target.value)} required /></label>
            <label>Page title<input value={draft.hero.title} maxLength={180} onChange={(event) => updateHero("title", event.target.value)} required /></label>
            <label>Introduction<textarea rows="3" value={draft.hero.intro} maxLength={600} onChange={(event) => updateHero("intro", event.target.value)} required /></label>
          </div>
        </section>

        {draft.groups.map((group, groupIndex) => (
          <section className="faq-admin__section" key={group.key}>
            <div className="faq-admin__section-heading"><span>Section {groupIndex + 1}</span><h2>{group.title}</h2></div>
            <div className="faq-admin__group-fields">
              <label>Section title<input value={group.title} maxLength={120} onChange={(event) => updateGroup(groupIndex, "title", event.target.value)} required /></label>
              <label>Short navigation title<input value={group.shortTitle} maxLength={60} onChange={(event) => updateGroup(groupIndex, "shortTitle", event.target.value)} required /></label>
            </div>
            <div className="faq-admin__questions">
              {group.items.map((item, itemIndex) => (
                <article key={item.id}>
                  <div className="faq-admin__question-heading">
                    <span>Question {itemIndex + 1}</span>
                    <button type="button" onClick={() => deleteQuestion(groupIndex, itemIndex)} disabled={group.items.length === 1} title={group.items.length === 1 ? "Each section needs at least one question" : "Delete this question"}><Trash2 size={15} /> Delete</button>
                  </div>
                  <label>Question<input value={item.question} maxLength={240} onChange={(event) => updateItem(groupIndex, itemIndex, "question", event.target.value)} required /></label>
                  <label>Answer<textarea rows="5" value={item.answer} maxLength={5000} onChange={(event) => updateItem(groupIndex, itemIndex, "answer", event.target.value)} required /></label>
                </article>
              ))}
              <button className="faq-admin__add-question" type="button" onClick={() => addQuestion(groupIndex)} disabled={group.items.length >= 30}><Plus size={17} /> Add question</button>
            </div>
          </section>
        ))}

        <div className="faq-admin__actions">
          <span>{dirty ? "You have unsaved changes." : `Saved revision ${revision}.`}</span>
          <button type="button" onClick={discard} disabled={!dirty || saving}><RotateCcw size={17} /> Discard changes</button>
          <button className="faq-admin__save" disabled={!dirty || saving}><Save size={17} /> {saving ? "Saving…" : "Save and publish"}</button>
        </div>
      </form>
    </main>
  );
}
