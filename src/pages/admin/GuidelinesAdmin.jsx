import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CircleCheck, ExternalLink, LoaderCircle, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";
import "./DiscountAdmin.css";
import "./ResourcesAdmin.css";

const API = import.meta.env.VITE_API;
const ICON_LABELS = { LockKeyhole: "Privacy", Heart: "Kindness", UsersRound: "Community", MegaphoneOff: "No promotions", Ban: "Prohibited activity", MessageCircle: "Discussion", Image: "Images", ShieldCheck: "Safety" };
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
export default function GuidelinesAdmin() {
  const { token } = useAuth();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [pageFields, setPageFields] = useState([]);
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const savingLock = useRef(false);
  const [feedback, setFeedback] = useState({});
  const [notice, setNotice] = useState(null);
  const dirty = useMemo(() => Boolean(saved && draft && !same(saved, draft)), [saved, draft]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/guidelines`, { signal: controller.signal }).then(readResponse).then(data => {
      setSaved(data.content); setDraft(structuredClone(data.content)); setRevision(data.revision);
      setPageFields(data.pageFields); setIcons(data.icons);
    }).catch(error => { if (error.name !== "AbortError") setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    function warn(event) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function clear(key) { setFeedback(current => ({ ...current, [key]: null })); }
  function updateItem(id, field, value) {
    clear(id); setDraft(current => ({ ...current, items: current.items.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  }
  function updatePage(key, value) {
    clear("page"); setDraft(current => ({ ...current, page: { ...current.page, [key]: value } }));
  }
  async function commit(edit, key, message, onSaved, rollback) {
    if (savingLock.current) return;
    savingLock.current = true; setSaving(true); setSavingKey(edit.action.startsWith("save-") ? key : null); clear(key); setNotice(null);
    try {
      const data = await fetch(`${API}/api/guidelines/items`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...edit, revision }),
      }).then(readResponse);
      setSaved(data.content); setRevision(data.revision); onSaved?.(data.content);
      const result = { text: message, saved: edit.action.startsWith("save-") };
      setFeedback(current => ({ ...current, [key]: result })); setNotice(result);
    } catch (error) {
      rollback?.(); const result = { error: true, text: error.message };
      setFeedback(current => ({ ...current, [key]: result })); setNotice(result);
    } finally { savingLock.current = false; setSaving(false); setSavingKey(null); }
  }
  function savePage(event) {
    event.preventDefault();
    commit({ action: "save-page", page: draft.page }, "page", "Saved successfully. The page text is now published.", content => setDraft(current => ({ ...current, page: structuredClone(content.page) })));
  }
  function saveItem(event, item) {
    event.preventDefault();
    commit({ action: "save-item", item }, item.id, "Saved successfully. This guideline is now published.", content => {
      const stored = content.items.find(value => value.id === item.id);
      setDraft(current => ({ ...current, items: current.items.map(value => value.id === item.id ? structuredClone(stored) : value) }));
    });
  }
  function discardItem(item) {
    const stored = saved.items.find(value => value.id === item.id);
    setDraft(current => ({ ...current, items: stored ? current.items.map(value => value.id === item.id ? structuredClone(stored) : value) : current.items.filter(value => value.id !== item.id) }));
    clear(item.id);
  }
  function remove(item) {
    const exists = saved.items.some(value => value.id === item.id);
    if (!window.confirm(exists ? `Delete "${item.title}" from the published community guidelines?` : "Remove this unsaved guideline?")) return;
    const removeDraft = () => setDraft(current => ({ ...current, items: current.items.filter(value => value.id !== item.id) }));
    if (exists) commit({ action: "delete-item", itemId: item.id }, item.id, "Guideline deleted from the public page.", removeDraft);
    else removeDraft();
  }
  function move(id, direction) {
    if (savingLock.current) return;
    const savedIds = new Set(saved.items.map(item => item.id));
    const order = draft.items.filter(item => savedIds.has(item.id));
    const index = order.findIndex(item => item.id === id);
    const target = order[index + direction];
    if (index < 0 || !target) return;
    const previous = draft;
    const items = [...draft.items];
    const from = items.findIndex(item => item.id === id), to = items.findIndex(item => item.id === target.id);
    [items[from], items[to]] = [items[to], items[from]];
    setDraft({ ...draft, items });
    commit({ action: "reorder-items", ids: items.filter(item => savedIds.has(item.id)).map(item => item.id) }, id, "Order saved.", null, () => setDraft(previous));
  }
  function status(key) {
    const result = feedback[key];
    return result && <p className={`resources-admin__feedback ${result.error ? "is-error" : "is-success"}`} role={result.error ? "alert" : "status"}>
      {!result.error && <CircleCheck size={20} aria-hidden="true" />}<span>{result.text}</span>
    </p>;
  }
  function actions(key, changed, discard, label) {
    const confirmed = !changed && feedback[key]?.saved;
    const pending = savingKey === key;
    return <div className="discount-admin__save-actions">
      {changed && <button type="button" onClick={discard}><RotateCcw size={15} /> Discard edits</button>}
      <button disabled={!changed || pending} className={`discount-admin__save-item ${confirmed ? "resources-admin__saved-button" : ""}`} aria-label={`${label}${confirmed ? " (saved)" : ""}`}>
        {pending ? <LoaderCircle className="resources-admin__saving-icon" size={16} aria-hidden="true" /> : confirmed ? <CircleCheck size={18} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
        {pending ? "Saving..." : confirmed ? "Saved" : label}
      </button>
    </div>;
  }
  if (loading) return <main className="faq-admin resources-admin"><p>Loading Guidelines editor...</p></main>;
  if (!draft) return <main className="faq-admin resources-admin"><p role="alert">{loadError || "Guidelines could not be loaded."}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main>;
  const order = draft.items.filter(item => saved.items.some(value => value.id === item.id));
  return <main className="faq-admin resources-admin guidelines-admin">
    <header className="faq-admin__header"><div><span>Owner tool</span><h1>Edit Guidelines</h1><p>Save each guideline when you finish. Saving publishes the change immediately. Reordering saves automatically.</p><small className="faq-admin__revision">Saved revision {revision}.{dirty ? " You have unfinished edits." : ""}</small></div><a href="/guidelines" target="_blank" rel="noreferrer">Open Guidelines <ExternalLink size={16} /></a></header>
    {notice && <div className={`faq-admin__notice ${notice.error ? "is-error" : "is-success"}`} role={notice.error ? "alert" : "status"}><span>{notice.text}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice(null)}>x</button></div>}
    <fieldset disabled={saving} className="resources-admin__fieldset">
      <section className="faq-admin__section" aria-label="Page text">
        <div className="faq-admin__section-heading"><span>Page introduction</span><h2>Page text</h2></div>
        <form onSubmit={savePage}><div className="faq-admin__fields">{pageFields.map(field => <label key={field.key}>{field.label}
          {field.multiline ? <textarea aria-label={field.label} required rows={4} maxLength={field.maxLength} value={draft.page[field.key]} onChange={event => updatePage(field.key, event.target.value)} /> : <input aria-label={field.label} required maxLength={field.maxLength} value={draft.page[field.key]} onChange={event => updatePage(field.key, event.target.value)} />}
        </label>)}</div>{status("page")}{actions("page", !same(draft.page, saved.page), () => { setDraft(current => ({ ...current, page: structuredClone(saved.page) })); clear("page"); }, "Save page text")}</form>
      </section>
      {draft.items.map((item, index) => {
        const stored = saved.items.find(value => value.id === item.id);
        const orderIndex = order.findIndex(value => value.id === item.id);
        return <section className="faq-admin__section" key={item.id} data-guideline-id={item.id} aria-label={`Guideline ${index + 1}`}>
          <div className="resources-admin__heading"><div className="faq-admin__section-heading"><span>Guideline {index + 1}</span><h2>{item.title || "New guideline"}</h2></div>
            <div className="resources-admin__controls">
              <button type="button" disabled={!stored || orderIndex === 0} aria-label="Move guideline up" onClick={() => move(item.id, -1)}><ArrowUp size={16} /></button>
              <button type="button" disabled={!stored || orderIndex === order.length - 1} aria-label="Move guideline down" onClick={() => move(item.id, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="resources-admin__delete" disabled={Boolean(stored && saved.items.length === 1)} onClick={() => remove(item)}><Trash2 size={15} /> Delete guideline</button>
            </div>
          </div>
          <form onSubmit={event => saveItem(event, item)}><div className="faq-admin__fields">
            <label>Title<input required maxLength={240} value={item.title} onChange={event => updateItem(item.id, "title", event.target.value)} /></label>
            <label>Icon<select aria-label="Icon" value={item.icon} onChange={event => updateItem(item.id, "icon", event.target.value)}>{icons.map(icon => <option key={icon} value={icon}>{ICON_LABELS[icon] || icon}</option>)}</select></label>
            <label>Explanation<textarea aria-label="Explanation" required rows={6} maxLength={6000} value={item.text} onChange={event => updateItem(item.id, "text", event.target.value)} /></label>
          </div>{status(item.id)}{actions(item.id, !stored || !same(item, stored), () => discardItem(item), "Save guideline")}</form>
        </section>;
      })}
      <button type="button" className="faq-admin__add-question resources-admin__add-category" disabled={draft.items.length >= 50} onClick={() => setDraft(current => ({ ...current, items: [...current.items, { id: crypto.randomUUID(), icon: "ShieldCheck", title: "", text: "" }] }))}><Plus size={17} /> Add guideline</button>
    </fieldset>
  </main>;
}
