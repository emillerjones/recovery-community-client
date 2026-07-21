import TechniqueNote from "../components/TechniqueNote";
import DiscountLinks from "./DiscountLinks";
import "./DiscountLinks3.css";

const CATEGORY_LINKS = [
  ["discount-apparel-and-advocacy", "Apparel"],
  ["discount-cbd-hemp-and-cannabis-wellness", "Wellness"],
  ["discount-vaporizers-and-devices", "Devices"],
  ["discount-storage-filters-and-accessories", "Storage"],
  ["discount-gummies-mints-and-beverages", "Edibles"],
];

export default function DiscountLinks3() {
  return (
    <div className="discount3-study">
      <TechniqueNote
        number="04"
        title="Spatial category rail + asymmetric editorial grid"
        how="A persistent category rail provides lateral navigation while the partner cards use an intentionally uneven grid instead of identical tiles. On narrow screens the rail becomes a native touch carousel."
        watch="Swipe the category labels sideways on mobile, notice the next label peeking at the edge, then compare the varied card rhythm on desktop with the calm single-column reading order on mobile."
      />
      <nav className="discount3-rail" aria-label="Version 3 category rail">
        <span className="discount3-rail__label">Browse sideways</span>
        <div>
          {CATEGORY_LINKS.map(([id, label], index) => (
            <a href={`#${id}`} key={id}>
              <span>0{index + 1}</span>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <DiscountLinks />
    </div>
  );
}
