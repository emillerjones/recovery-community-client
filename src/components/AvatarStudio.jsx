import { useEffect, useMemo, useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react/ssr";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  AVATAR_CATEGORIES, AVATAR_COLORS, avatarColor, buildAvatarCatalog, parsePresetAvatar,
} from "./avatarOptions";
import "./AvatarStudio.css";

const CATALOG = buildAvatarCatalog(PhosphorIcons);
const PAGE_SIZE = 120;

export default function AvatarStudio({ value, fallback, onChoose, onClose }) {
  const existing = parsePresetAvatar(value);
  const [selectedIcon, setSelectedIcon] = useState(existing?.icon || CATALOG[0]?.name || "Butterfly");
  const [selectedColor, setSelectedColor] = useState(existing?.color || "forest");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    function closeOnEscape(event) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CATALOG.filter((icon) =>
      (category === "All" || icon.category === category)
      && (!term || icon.label.toLowerCase().includes(term))
    );
  }, [category, search]);

  const SelectedIcon = PhosphorIcons[selectedIcon];
  const chosenColor = avatarColor(selectedColor);

  return (
    <div className="avatar-studio-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="avatar-studio" role="dialog" aria-modal="true" aria-labelledby="avatar-studio-title">
        <header className="avatar-studio__header">
          <div><span>Preset avatar studio</span><h2 id="avatar-studio-title">Choose something that feels like you.</h2><p>{CATALOG.length} suitable icons · {AVATAR_COLORS.length} colors · {(CATALOG.length * AVATAR_COLORS.length).toLocaleString()} combinations</p></div>
          <button onClick={onClose} aria-label="Close avatar picker"><X size={22} /></button>
        </header>

        <div className="avatar-studio__preview-row">
          <div className="avatar-studio__preview" style={{ background: chosenColor.background, color: chosenColor.foreground }}>
            {SelectedIcon ? <SelectedIcon size={64} weight="duotone" /> : fallback}
          </div>
          <div className="avatar-studio__colors" aria-label="Avatar background color">
            {AVATAR_COLORS.map((color) => <button key={color.key} type="button" className={selectedColor === color.key ? "is-selected" : ""} style={{ background: color.background }} title={color.label} aria-label={color.label} onClick={() => setSelectedColor(color.key)} />)}
          </div>
        </div>

        <div className="avatar-studio__tools">
          <label><MagnifyingGlass size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search icons…" autoFocus /></label>
          <div className="avatar-studio__categories">{AVATAR_CATEGORIES.map((item) => <button type="button" key={item} className={category === item ? "is-selected" : ""} onClick={() => { setCategory(item); setVisibleCount(PAGE_SIZE); }}>{item}</button>)}</div>
        </div>

        <div className="avatar-studio__result-count">Showing {Math.min(filtered.length, visibleCount)} of {filtered.length} matching icons</div>
        <div className="avatar-studio__grid">
          {filtered.slice(0, visibleCount).map((item) => {
            const Icon = PhosphorIcons[item.name];
            return <button type="button" key={item.name} className={selectedIcon === item.name ? "is-selected" : ""} title={item.label} aria-label={item.label} onClick={() => setSelectedIcon(item.name)}><Icon size={27} weight="duotone" /><span>{item.label}</span></button>;
          })}
        </div>
        {visibleCount < filtered.length && <button className="avatar-studio__more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Show more icons</button>}
        {filtered.length === 0 && <p className="avatar-studio__empty">No matching icons. Try another word or category.</p>}

        <footer><button type="button" onClick={onClose}>Cancel</button><button type="button" className="avatar-studio__save" onClick={() => onChoose(`preset:${selectedIcon}:${selectedColor}`)}>Use this avatar</button></footer>
      </section>
    </div>
  );
}
