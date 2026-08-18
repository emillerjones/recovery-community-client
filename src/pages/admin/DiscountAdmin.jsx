import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./FAQAdmin.css";
import "./DiscountAdmin.css";

const API = import.meta.env.VITE_API;
const clone = (value) => JSON.parse(JSON.stringify(value));
const ICON_OPTIONS = [
  ["shirt", "Shirt"],
  ["leaf", "Leaf"],
  ["cable", "Device"],
  ["package", "Package"],
  ["candy", "Candy"],
];

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

function moved(items, from, to) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function DiscountAdmin() {
  const { token } = useAuth();
  const [savedContent, setSavedContent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const dirty = useMemo(() => Boolean(draft && savedContent && JSON.stringify(draft) !== JSON.stringify(savedContent)), [draft, savedContent]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/discount2`)
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
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateCategory(categoryIndex, field, value) {
    setDraft((current) => ({ ...current, categories: current.categories.map((category, index) => index === categoryIndex ? { ...category, [field]: value } : category) }));
  }

  function addCategory() {
    setDraft((current) => ({
      ...current,
      categories: [...current.categories, {
        id: `category-${crypto.randomUUID()}`,
        title: "",
        description: "",
        icon: "leaf",
        brands: [],
      }],
    }));
    setNotice("New category added to this draft.");
  }

  function deleteCategory(categoryIndex) {
    const category = draft.categories[categoryIndex];
    if (draft.categories.length === 1) return;
    if (!window.confirm(`Remove “${category.title || "this new category"}” and all of its brands? This becomes permanent only after publishing.`)) return;
    setDraft((current) => ({ ...current, categories: current.categories.filter((_, index) => index !== categoryIndex) }));
    setNotice("Category removed from this draft. Save and publish to make it permanent.");
  }

  function moveCategory(categoryIndex, direction) {
    setDraft((current) => ({ ...current, categories: moved(current.categories, categoryIndex, categoryIndex + direction) }));
  }

  function updateBrand(categoryIndex, brandIndex, field, value) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) => index !== categoryIndex ? category : {
        ...category,
        brands: category.brands.map((brand, innerIndex) => innerIndex === brandIndex ? { ...brand, [field]: value } : brand),
      }),
    }));
  }

  function addBrand(categoryIndex) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) => index !== categoryIndex ? category : {
        ...category,
        brands: [...category.brands, {
          id: `brand-${crypto.randomUUID()}`,
          name: "",
          code: "",
          url: "",
          logo: null,
          note: null,
          active: true,
        }],
      }),
    }));
    setNotice("New brand added. Complete its required fields before publishing.");
  }

  function deleteBrand(categoryIndex, brandIndex) {
    const brand = draft.categories[categoryIndex].brands[brandIndex];
    if (!window.confirm(`Remove “${brand.name || "this new brand"}”? This becomes permanent only after publishing.`)) return;
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) => index !== categoryIndex ? category : {
        ...category,
        brands: category.brands.filter((_, innerIndex) => innerIndex !== brandIndex),
      }),
    }));
    setNotice("Brand removed from this draft. Save and publish to make it permanent.");
  }

  function moveBrand(categoryIndex, brandIndex, direction) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) => index !== categoryIndex ? category : {
        ...category,
        brands: moved(category.brands, brandIndex, brandIndex + direction),
      }),
    }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const data = await fetch(`${API}/api/discount2`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, revision }),
      }).then(readResponse);
      setSavedContent(data.content);
      setDraft(clone(data.content));
      setRevision(data.revision);
      setNotice("Discount2 changes are live.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!dirty || window.confirm("Discard your unsaved Discount2 changes?")) {
      setDraft(clone(savedContent));
      setNotice("Unsaved changes discarded.");
    }
  }

  if (loading) return <main className="faq-admin discount-admin"><p>Loading Discount2 editor…</p></main>;
  if (!draft) return <main className="faq-admin discount-admin"><div className="faq-admin__notice is-error">{notice || "Discount2 could not be loaded."}</div></main>;

  return (
    <main className="faq-admin discount-admin">
      <header className="faq-admin__header">
        <div><span>Owner tool</span><h1>Edit Discount2</h1><p>Add, update, hide, reorder, or remove discount brands. Changes affect only the independent <strong>/discountlinks2</strong> page.</p></div>
        <a href="/discountlinks2" target="_blank" rel="noreferrer">Open Discount2 <ExternalLink size={16} /></a>
      </header>

      {notice && <div className={`faq-admin__notice ${notice.includes("live") ? "is-success" : ""}`} role="status">{notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}

      <form onSubmit={save}>
        {draft.categories.map((category, categoryIndex) => (
          <section className="faq-admin__section discount-admin__category" key={category.id}>
            <div className="discount-admin__category-heading">
              <div><span>Category {categoryIndex + 1}</span><h2>{category.title || "New category"}</h2><small>{category.brands.length} {category.brands.length === 1 ? "brand" : "brands"}</small></div>
              <div className="discount-admin__icon-actions">
                <button type="button" onClick={() => moveCategory(categoryIndex, -1)} disabled={categoryIndex === 0} title="Move category up"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => moveCategory(categoryIndex, 1)} disabled={categoryIndex === draft.categories.length - 1} title="Move category down"><ArrowDown size={16} /></button>
                <button className="is-danger" type="button" onClick={() => deleteCategory(categoryIndex)} disabled={draft.categories.length === 1} title="Delete category"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="discount-admin__category-fields">
              <label>Category title<input value={category.title} maxLength={140} onChange={(event) => updateCategory(categoryIndex, "title", event.target.value)} required /></label>
              <label>Icon<select value={category.icon} onChange={(event) => updateCategory(categoryIndex, "icon", event.target.value)}>{ICON_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label className="is-wide">Description<input value={category.description} maxLength={500} onChange={(event) => updateCategory(categoryIndex, "description", event.target.value)} required /></label>
            </div>

            <div className="discount-admin__brand-list">
              {category.brands.map((brand, brandIndex) => (
                <details className={`discount-admin__brand ${brand.active ? "" : "is-hidden"}`} key={brand.id} open={!brand.name}>
                  <summary>
                    {brand.logo ? <img src={brand.logo} alt="" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="discount-admin__logo-placeholder">Logo</span>}
                    <span className="discount-admin__brand-summary"><strong>{brand.name || "New brand"}</strong><small>{brand.code === null ? "No code needed" : brand.code || "Code not entered"}</small></span>
                    {!brand.active && <em>Hidden</em>}
                  </summary>
                  <div className="discount-admin__brand-fields">
                    <label>Brand name<input value={brand.name} maxLength={160} onChange={(event) => updateBrand(categoryIndex, brandIndex, "name", event.target.value)} required /></label>
                    <label>Website/referral link<input type="url" value={brand.url} maxLength={2000} placeholder="https://…" onChange={(event) => updateBrand(categoryIndex, brandIndex, "url", event.target.value)} required /></label>
                    <label>Logo image URL<input type="url" value={brand.logo || ""} maxLength={2000} placeholder="https://…" onChange={(event) => updateBrand(categoryIndex, brandIndex, "logo", event.target.value || null)} /></label>
                    <label>Optional note<textarea rows="2" value={brand.note || ""} maxLength={500} onChange={(event) => updateBrand(categoryIndex, brandIndex, "note", event.target.value || null)} /></label>
                    <div className="discount-admin__code-fields">
                      <label>Discount code<input value={brand.code || ""} maxLength={100} disabled={brand.code === null} required={brand.code !== null} onChange={(event) => updateBrand(categoryIndex, brandIndex, "code", event.target.value.toUpperCase())} /></label>
                      <label className="discount-admin__check"><input type="checkbox" checked={brand.code === null} onChange={(event) => updateBrand(categoryIndex, brandIndex, "code", event.target.checked ? null : "")} /> No code needed</label>
                      <label className="discount-admin__check"><input type="checkbox" checked={brand.active} onChange={(event) => updateBrand(categoryIndex, brandIndex, "active", event.target.checked)} /> Visible publicly</label>
                    </div>
                    <div className="discount-admin__brand-actions">
                      <button type="button" onClick={() => moveBrand(categoryIndex, brandIndex, -1)} disabled={brandIndex === 0}><ArrowUp size={15} /> Move up</button>
                      <button type="button" onClick={() => moveBrand(categoryIndex, brandIndex, 1)} disabled={brandIndex === category.brands.length - 1}><ArrowDown size={15} /> Move down</button>
                      {brand.url.startsWith("http") && <a href={brand.url} target="_blank" rel="noreferrer">Test link <ExternalLink size={14} /></a>}
                      <button className="is-danger" type="button" onClick={() => deleteBrand(categoryIndex, brandIndex)}><Trash2 size={15} /> Delete brand</button>
                    </div>
                  </div>
                </details>
              ))}
              {!category.brands.length && <p className="discount-admin__empty">This category has no brands yet.</p>}
              <button className="discount-admin__add" type="button" onClick={() => addBrand(categoryIndex)} disabled={category.brands.length >= 60}><Plus size={17} /> Add brand to {category.title || "category"}</button>
            </div>
          </section>
        ))}

        <button className="discount-admin__add discount-admin__add-category" type="button" onClick={addCategory} disabled={draft.categories.length >= 12}><Plus size={18} /> Add category</button>

        <div className="faq-admin__actions">
          <span>{dirty ? "You have unsaved changes." : `Saved revision ${revision}.`}</span>
          <button type="button" onClick={discard} disabled={!dirty || saving}><RotateCcw size={17} /> Discard changes</button>
          <button className="faq-admin__save" disabled={!dirty || saving}><Save size={17} /> {saving ? "Saving…" : "Save and publish"}</button>
        </div>
      </form>
    </main>
  );
}
