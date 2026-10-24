import { useEffect, useRef, useState } from "react";
import { CircleCheck, ExternalLink, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";
import "./DiscountAdmin.css";
import "./ResourcesAdmin.css";

const API = import.meta.env.VITE_API;

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function HomeTestAdmin() {
  const { token } = useAuth();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [sections, setSections] = useState([]);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const savingLock = useRef(false);
  const [feedback, setFeedback] = useState({});
  const changed = section => section.fields.some(field => draft[section.id][field.key] !== saved[section.id][field.key]);
  const dirty = Boolean(draft && saved && sections.some(changed));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/home-test`, { signal: controller.signal }).then(readResponse)
      .then(data => {
        setSaved(data.content); setDraft(structuredClone(data.content));
        setRevision(data.revision); setSections(data.sections);
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

  function update(sectionId, key, value) {
    setFeedback(current => ({ ...current, [sectionId]: null }));
    setDraft(current => ({ ...current, [sectionId]: { ...current[sectionId], [key]: value } }));
  }
  function discard(sectionId) {
    setDraft(current => ({ ...current, [sectionId]: structuredClone(saved[sectionId]) }));
    setFeedback(current => ({ ...current, [sectionId]: null }));
  }
  async function save(event, sectionId) {
    event.preventDefault();
    if (savingLock.current) return;
    savingLock.current = true; setSavingId(sectionId);
    setFeedback(current => ({ ...current, [sectionId]: null }));
    try {
      const data = await fetch(`${API}/api/home-test/sections/${sectionId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: draft[sectionId], revision }),
      }).then(readResponse);
      setSaved(data.content); setRevision(data.revision);
      setDraft(current => ({ ...current, [sectionId]: structuredClone(data.content[sectionId]) }));
      setFeedback(current => ({ ...current, [sectionId]: { saved: true, text: "Saved successfully. This section is now live on Home - Test." } }));
    } catch (error) {
      setFeedback(current => ({ ...current, [sectionId]: { error: true, text: error.message } }));
    } finally { savingLock.current = false; setSavingId(null); }
  }

  if (loading) return <main className="faq-admin resources-admin"><p>Loading Home - Test editor…</p></main>;
  if (!draft) return <main className="faq-admin resources-admin"><p role="alert">{loadError || "Home - Test could not be loaded."}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main>;

  return <main className="faq-admin resources-admin home-test-admin">
    <header className="faq-admin__header">
      <div><span>Owner tool</span><h1>Edit Home - Test</h1><p>Save each section when you finish. Only Home - Test changes; the current Home page stays as it is. Buttons, links, images, and layout stay fixed.</p><small className="faq-admin__revision">Saved revision {revision}.{dirty ? " You have unfinished edits." : ""}</small></div>
      <a href="/home-test" target="_blank" rel="noreferrer">Open Home - Test <ExternalLink size={16} /></a>
    </header>
    <fieldset className="resources-admin__fieldset" disabled={Boolean(savingId)}>
      {sections.map(section => {
        const isChanged = changed(section);
        const result = feedback[section.id];
        const pending = savingId === section.id;
        const confirmed = !isChanged && result?.saved;
        return <section className="faq-admin__section" aria-label={section.title} key={section.id} data-home-test-section={section.id}>
          <div className="faq-admin__section-heading"><span>Home - Test text</span><h2>{section.title}</h2></div>
          <form onSubmit={event => save(event, section.id)}>
            <div className="faq-admin__fields">{section.fields.map(field => <label key={field.key}>{field.label}
              {field.multiline
                ? <textarea aria-label={field.label} required rows={4} maxLength={field.maxLength} value={draft[section.id][field.key]} onChange={event => update(section.id, field.key, event.target.value)} />
                : <input aria-label={field.label} required maxLength={field.maxLength} value={draft[section.id][field.key]} onChange={event => update(section.id, field.key, event.target.value)} />}
            </label>)}</div>
            {result && <p className={`resources-admin__feedback ${result.error ? "is-error" : "is-success"}`} role={result.error ? "alert" : "status"}>
              {!result.error && <CircleCheck size={20} aria-hidden="true" />}<span>{result.text}</span>
            </p>}
            <div className="discount-admin__save-actions">
              {isChanged && <button type="button" onClick={() => discard(section.id)}><RotateCcw size={15} /> Discard edits</button>}
              <button disabled={!isChanged || pending} className={`discount-admin__save-item ${confirmed ? "resources-admin__saved-button" : ""}`} aria-label={`Save ${section.title}${confirmed ? " (saved)" : ""}`}>
                {pending ? <LoaderCircle className="resources-admin__saving-icon" size={16} aria-hidden="true" /> : confirmed ? <CircleCheck size={18} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                {pending ? "Saving…" : confirmed ? "Saved" : "Save section"}
              </button>
            </div>
          </form>
        </section>;
      })}
    </fieldset>
  </main>;
}
