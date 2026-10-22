import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import DiscountLogoInput from "./DiscountLogoInput";
import "./FAQAdmin.css";
import "./DiscountAdmin.css";

const API = import.meta.env.VITE_API;
const clone = value => structuredClone(value);
// JSONB can return object keys in a different order. Compare their values,
// keeping array order meaningful, so a saved item does not stay "unfinished".
function same(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && same(a[key], b[key]));
}
const categoryFields = category => ({ title: category.title, description: category.description, icon: category.icon });
const ICON_OPTIONS = [["shirt", "Shirt"], ["leaf", "Leaf"], ["cable", "Device"], ["package", "Package"], ["candy", "Candy"]];

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

function reordered(items, id, direction, savedItems) {
  const savedIds = new Set(savedItems.map(item => item.id));
  const savedOrder = items.filter(item => savedIds.has(item.id));
  const index = savedOrder.findIndex(item => item.id === id);
  const target = savedOrder[index + direction];
  if (index < 0 || !target) return null;
  const next = [...items];
  const from = next.findIndex(item => item.id === id);
  const to = next.findIndex(item => item.id === target.id);
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export default function DiscountAdmin() {
  const { token } = useAuth();
  const [savedContent, setSavedContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingLock = useRef(false);
  const [notice, setNotice] = useState("");
  const [feedback, setFeedback] = useState({});
  const [logoFiles, setLogoFiles] = useState({});
  const latestLogoFiles = useRef({});
  const [openBrandIds, setOpenBrandIds] = useState(() => new Set());
  const dirty = useMemo(() => Boolean(draft && savedContent && (!same(draft, savedContent) || Object.keys(logoFiles).length)), [draft, savedContent, logoFiles]);

  useEffect(() => {
    let cancelled = false;
    fetch(API + "/api/discount2").then(readResponse).then(data => {
      if (!cancelled) { setSavedContent(data.content); setDraft(clone(data.content)); setRevision(data.revision); }
    }).catch(error => { if (!cancelled) setNotice(error.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function warn(event) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    Object.entries(latestLogoFiles.current).forEach(([id, selection]) => {
      if (logoFiles[id]?.previewUrl !== selection.previewUrl) URL.revokeObjectURL(selection.previewUrl);
    });
    latestLogoFiles.current = logoFiles;
  }, [logoFiles]);
  useEffect(() => () => Object.values(latestLogoFiles.current).forEach(selection => URL.revokeObjectURL(selection.previewUrl)), []);

  function clearFeedback(key) { setFeedback(current => ({ ...current, [key]: null })); }
  function clearLogoFile(id) { setLogoFiles(current => { const next = { ...current }; delete next[id]; return next; }); }
  function selectLogo(id, file) {
    const previewUrl = URL.createObjectURL(file);
    clearFeedback("brand:" + id);
    setLogoFiles(current => ({ ...current, [id]: { file, previewUrl } }));
  }
  function updateCategory(id, field, value) {
    clearFeedback("category:" + id);
    setDraft(current => ({ ...current, categories: current.categories.map(category => category.id === id ? { ...category, [field]: value } : category) }));
  }
  function updateBrand(categoryId, id, field, value) {
    clearFeedback("brand:" + id);
    setDraft(current => ({ ...current, categories: current.categories.map(category => category.id !== categoryId ? category : {
      ...category, brands: category.brands.map(brand => brand.id === id ? { ...brand, [field]: value } : brand),
    }) }));
  }
  function setBrandOpen(id, open) {
    setOpenBrandIds(current => { const next = new Set(current); if (open) next.add(id); else next.delete(id); return next; });
  }

  // Only one write at a time. Each response updates the saved baseline, while
  // its callback changes only the edited item in the local draft.
  async function commit(edit, key, message, onSaved, prepare, rollback) {
    if (savingLock.current) return;
    savingLock.current = true; setSaving(true); setNotice(""); clearFeedback(key);
    try {
      const prepared = prepare ? await prepare(edit) : edit;
      const data = await fetch(API + "/api/discount2/items", {
        method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...prepared, revision }),
      }).then(readResponse);
      setSavedContent(data.content); setRevision(data.revision);
      onSaved?.(data.content);
      setFeedback(current => ({ ...current, [key]: { text: message, error: false } }));
      setNotice(message);
    } catch (error) {
      rollback?.();
      setFeedback(current => ({ ...current, [key]: { text: error.message, error: true } }));
      setNotice(error.message);
    } finally { savingLock.current = false; setSaving(false); }
  }

  function addCategory() {
    setDraft(current => ({ ...current, categories: [...current.categories, {
      id: "category-" + crypto.randomUUID(), title: "", description: "", icon: "leaf", brands: [],
    }] }));
    setNotice("Complete the category details and choose Save category.");
  }
  function saveCategory(event, category) {
    event.preventDefault();
    commit({ action: "save-category", categoryId: category.id, category: categoryFields(category) }, "category:" + category.id, "Category saved.",
      content => {
        const saved = content.categories.find(item => item.id === category.id);
        setDraft(current => ({ ...current, categories: current.categories.map(item => item.id === category.id ? { ...item, ...categoryFields(saved) } : item) }));
      });
  }
  function discardCategory(category) {
    const saved = savedContent.categories.find(item => item.id === category.id);
    setDraft(current => ({ ...current, categories: saved
      ? current.categories.map(item => item.id === category.id ? { ...item, ...categoryFields(saved) } : item)
      : current.categories.filter(item => item.id !== category.id) }));
    clearFeedback("category:" + category.id);
  }
  function deleteCategory(category) {
    const exists = savedContent.categories.some(item => item.id === category.id);
    if (!window.confirm(exists ? 'Delete "' + category.title + '" and all its brands from the public page? Any unfinished edits in this category will also be removed.' : "Remove this unsaved category?")) return;
    const remove = () => {
      category.brands.forEach(brand => clearLogoFile(brand.id));
      setDraft(current => ({ ...current, categories: current.categories.filter(item => item.id !== category.id) }));
    };
    if (exists) commit({ action: "delete-category", categoryId: category.id }, "category:" + category.id, "Category deleted.", remove);
    else remove();
  }
  function addBrand(categoryId) {
    const id = "brand-" + crypto.randomUUID();
    setDraft(current => ({ ...current, categories: current.categories.map(category => category.id !== categoryId ? category : {
      ...category, brands: [...category.brands, { id, name: "", code: "", url: "", logo: null, note: null, active: true }],
    }) }));
    setBrandOpen(id, true);
  }
  function saveBrand(event, categoryId, brand) {
    event.preventDefault();
    commit({ action: "save-brand", categoryId, brand }, "brand:" + brand.id, "Brand saved.",
      content => {
        const saved = content.categories.find(category => category.id === categoryId).brands.find(item => item.id === brand.id);
        setDraft(current => ({ ...current, categories: current.categories.map(category => category.id !== categoryId ? category : {
          ...category, brands: category.brands.map(item => item.id === brand.id ? saved : item),
        }) }));
        clearLogoFile(brand.id); setBrandOpen(brand.id, false);
      }, async edit => {
        const selection = logoFiles[brand.id];
        if (!selection) return edit;
        let url = selection.uploadedUrl;
        if (!url) {
          const form = new FormData(); form.append("image", selection.file);
          const result = await fetch(API + "/api/discount2/logos", { method: "POST", headers: { Authorization: "Bearer " + token }, body: form }).then(readResponse);
          url = result.url;
          if (typeof url !== "string" || !url.startsWith("https://")) throw new Error("The logo upload did not return a valid image address. Please try again.");
          setLogoFiles(current => ({ ...current, [brand.id]: { ...selection, uploadedUrl: url } }));
        }
        return { ...edit, brand: { ...brand, logo: url } };
      });
  }
  function discardBrand(categoryId, brand) {
    const saved = savedContent.categories.find(category => category.id === categoryId)?.brands.find(item => item.id === brand.id);
    clearLogoFile(brand.id); clearFeedback("brand:" + brand.id);
    setDraft(current => ({ ...current, categories: current.categories.map(category => category.id !== categoryId ? category : {
      ...category, brands: saved ? category.brands.map(item => item.id === brand.id ? clone(saved) : item) : category.brands.filter(item => item.id !== brand.id),
    }) }));
    setBrandOpen(brand.id, false);
  }
  function deleteBrand(categoryId, brand) {
    const exists = savedContent.categories.find(category => category.id === categoryId)?.brands.some(item => item.id === brand.id);
    if (!window.confirm(exists ? 'Delete "' + brand.name + '" from the public page?' : "Remove this unsaved brand?")) return;
    const remove = () => {
      clearLogoFile(brand.id);
      setDraft(current => ({ ...current, categories: current.categories.map(category => category.id !== categoryId ? category : {
        ...category, brands: category.brands.filter(item => item.id !== brand.id),
      }) }));
    };
    if (exists) commit({ action: "delete-brand", categoryId, brandId: brand.id }, "brand:" + brand.id, "Brand deleted.", remove);
    else remove();
  }
  function moveCategory(id, direction) {
    if (savingLock.current) return;
    const categories = reordered(draft.categories, id, direction, savedContent.categories);
    if (!categories) return;
    const previous = draft;
    setDraft({ ...draft, categories });
    commit({ action: "reorder-categories", ids: categories.filter(item => savedContent.categories.some(saved => saved.id === item.id)).map(item => item.id) },
      "category:" + id, "Order saved.", null, null, () => setDraft(previous));
  }
  function moveBrand(category, id, direction) {
    if (savingLock.current) return;
    const saved = savedContent.categories.find(item => item.id === category.id);
    const brands = reordered(category.brands, id, direction, saved.brands);
    if (!brands) return;
    const previous = draft;
    setDraft({ ...draft, categories: draft.categories.map(item => item.id === category.id ? { ...item, brands } : item) });
    commit({ action: "reorder-brands", categoryId: category.id, ids: brands.filter(item => saved.brands.some(brand => brand.id === item.id)).map(item => item.id) },
      "brand:" + id, "Order saved.", null, null, () => setDraft(previous));
  }
  function status(key) {
    const item = feedback[key];
    return item && <p className={"discount-admin__status" + (item.error ? " is-error" : "")} role={item.error ? "alert" : "status"}>{item.text}</p>;
  }

  if (loading) return <main className="faq-admin discount-admin"><p>Loading Discount Links editor…</p></main>;
  if (!draft) return <main className="faq-admin discount-admin"><div className="faq-admin__notice is-error">{notice || "Discount Links could not be loaded."}</div></main>;

  return (
    <main className="faq-admin discount-admin">
      <header className="faq-admin__header">
        <div><span>Owner tool</span><h1>Edit Discount Links</h1><p>Save each brand or category when you finish. Reordering saves automatically.</p><small className="faq-admin__revision">Saved revision {revision}.{dirty ? " You have unfinished edits." : ""}</small></div>
        <a href="/discountlinks" target="_blank" rel="noreferrer">Open Discount Links <ExternalLink size={16} /></a>
      </header>
      {notice && <div className="faq-admin__notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
      <fieldset className="discount-admin__fieldset" disabled={saving}>
        {draft.categories.map((category, categoryIndex) => {
          const saved = savedContent.categories.find(item => item.id === category.id);
          const changed = !saved || !same(categoryFields(category), categoryFields(saved));
          const savedOrder = draft.categories.filter(item => savedContent.categories.some(stored => stored.id === item.id));
          const orderIndex = savedOrder.findIndex(item => item.id === category.id);
          return (
            <section className="faq-admin__section discount-admin__category" key={category.id} data-category-id={category.id}>
              <div className="discount-admin__category-heading">
                <div><span>Category {categoryIndex + 1}</span><h2>{category.title || "New category"}</h2><small>{category.brands.length} {category.brands.length === 1 ? "brand" : "brands"}</small></div>
                <div className="discount-admin__icon-actions">
                  <button type="button" onClick={() => moveCategory(category.id, -1)} disabled={!saved || orderIndex === 0} title="Move category up"><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => moveCategory(category.id, 1)} disabled={!saved || orderIndex === savedOrder.length - 1} title="Move category down"><ArrowDown size={16} /></button>
                  <button type="button" className="is-danger" onClick={() => deleteCategory(category)} disabled={Boolean(saved && savedContent.categories.length === 1)} title="Delete category"><Trash2 size={16} /></button>
                </div>
              </div>
              <form className="discount-admin__category-form" onSubmit={event => saveCategory(event, category)}>
                <div className="discount-admin__category-fields">
                  <label>Category title<input value={category.title} maxLength={140} onChange={event => updateCategory(category.id, "title", event.target.value)} required /></label>
                  <label>Icon<select value={category.icon} onChange={event => updateCategory(category.id, "icon", event.target.value)}>{ICON_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label className="is-wide">Description<input value={category.description} maxLength={500} onChange={event => updateCategory(category.id, "description", event.target.value)} required /></label>
                </div>
                {status("category:" + category.id)}
                <div className="discount-admin__save-actions">
                  {changed && <button type="button" onClick={() => discardCategory(category)}><RotateCcw size={15} /> Discard edits</button>}
                  <button className="discount-admin__save-item" disabled={!changed}><Save size={16} /> {saving ? "Saving…" : "Save category"}</button>
                </div>
              </form>
              <div className="discount-admin__brand-list">
                {category.brands.map(brand => {
                  const stored = saved?.brands.find(item => item.id === brand.id);
                  const brandChanged = !stored || !same(brand, stored) || Boolean(logoFiles[brand.id]);
                  const order = category.brands.filter(item => saved?.brands.some(savedBrand => savedBrand.id === item.id));
                  const brandIndex = order.findIndex(item => item.id === brand.id);
                  const preview = logoFiles[brand.id]?.previewUrl || brand.logo;
                  return (
                    <details className={"discount-admin__brand " + (brand.active ? "" : "is-hidden")} key={brand.id} data-brand-id={brand.id} open={openBrandIds.has(brand.id)} onToggle={event => setBrandOpen(brand.id, event.currentTarget.open)}>
                      <summary>
                        {preview ? <img key={preview} src={preview} alt="" onError={event => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="discount-admin__logo-placeholder">Logo</span>}
                        <span className="discount-admin__brand-summary"><strong>{brand.name || "New brand"}</strong><small>{brandChanged ? "Unsaved changes" : feedback["brand:" + brand.id]?.text || (brand.code === null ? "No code needed" : brand.code || "Code not entered")}</small></span>
                        {!brand.active && <em>Hidden</em>}
                      </summary>
                      <form className="discount-admin__brand-fields" onSubmit={event => saveBrand(event, category.id, brand)}>
                        <label>Brand name<input value={brand.name} maxLength={160} onChange={event => updateBrand(category.id, brand.id, "name", event.target.value)} required /></label>
                        <label>Website/referral link<input type="url" value={brand.url} maxLength={2000} placeholder="https://…" onChange={event => updateBrand(category.id, brand.id, "url", event.target.value)} required /></label>
                        <DiscountLogoInput value={brand.logo} selection={logoFiles[brand.id]} onFile={file => selectLogo(brand.id, file)}
                          onLink={url => { clearLogoFile(brand.id); updateBrand(category.id, brand.id, "logo", url); }}
                          onRemove={() => { clearLogoFile(brand.id); updateBrand(category.id, brand.id, "logo", null); }} />
                        <label>Optional note<textarea rows="2" value={brand.note || ""} maxLength={500} onChange={event => updateBrand(category.id, brand.id, "note", event.target.value || null)} /></label>
                        <div className="discount-admin__code-fields">
                          <label>Discount code<input value={brand.code || ""} maxLength={100} disabled={brand.code === null} required={brand.code !== null} onChange={event => updateBrand(category.id, brand.id, "code", event.target.value.toUpperCase())} /></label>
                          <label className="discount-admin__check"><input type="checkbox" checked={brand.code === null} onChange={event => updateBrand(category.id, brand.id, "code", event.target.checked ? null : "")} /> No code needed</label>
                          <label className="discount-admin__check"><input type="checkbox" checked={brand.active} onChange={event => updateBrand(category.id, brand.id, "active", event.target.checked)} /> Visible publicly</label>
                        </div>
                        <div className="discount-admin__brand-actions">
                          <button type="button" onClick={() => moveBrand(category, brand.id, -1)} disabled={!stored || brandIndex === 0}><ArrowUp size={15} /> Move up</button>
                          <button type="button" onClick={() => moveBrand(category, brand.id, 1)} disabled={!stored || brandIndex === order.length - 1}><ArrowDown size={15} /> Move down</button>
                          {brand.url.startsWith("http") && <a href={brand.url} target="_blank" rel="noreferrer">Test link <ExternalLink size={14} /></a>}
                        </div>
                        {status("brand:" + brand.id)}
                        <div className="discount-admin__save-actions">
                          <button type="button" className="is-danger" onClick={() => deleteBrand(category.id, brand)}><Trash2 size={15} /> Delete brand</button>
                          {brandChanged && <button type="button" onClick={() => discardBrand(category.id, brand)}><RotateCcw size={15} /> Discard edits</button>}
                          <button className="discount-admin__save-item" disabled={!brandChanged}><Save size={16} /> {saving ? "Saving…" : "Save brand"}</button>
                        </div>
                      </form>
                    </details>
                  );
                })}
                {!category.brands.length && <p className="discount-admin__empty">This category has no brands yet.</p>}
                {!saved && <p className="discount-admin__hint">Save this category before adding brands or changing its order.</p>}
                <button className="discount-admin__add" type="button" onClick={() => addBrand(category.id)} disabled={!saved || category.brands.length >= 60}><Plus size={17} /> Add brand to {category.title || "category"}</button>
              </div>
            </section>
          );
        })}
        <button className="discount-admin__add discount-admin__add-category" type="button" onClick={addCategory} disabled={draft.categories.length >= 12}><Plus size={18} /> Add category</button>
      </fieldset>
    </main>
  );
}
