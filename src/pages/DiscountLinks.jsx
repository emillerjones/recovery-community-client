import { useEffect, useState } from "react";
import {
  Candy,
  Cable,
  ExternalLink,
  Leaf,
  PackageCheck,
  ShieldAlert,
  Shirt,
} from "lucide-react";
import "./DiscountLinks.css";

const discountCategories = [
  {
    title: "Apparel & Advocacy",
    icon: Shirt,
    desc: "Wear the message and support the movement.",
    links: [
      { name: "Etsy #EXITDRUG Advocate T-Shirt", code: "EXITDRUG", url: "https://www.etsy.com/shop/TheExitDrugRecovery", logo: "https://cdn2.lnk.bi/uploads/6288789_20231123040640893-100.jpg" },
      { name: "LJXLDN", code: "SOBERSTONER", url: "https://www.ljxlondon.co.uk/?ref=SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/4284813_20230307111410592-100.jpg" },
      { name: "8000 Kicks", code: "SOBERSTONER", url: "https://www.8000kicks.com/discount/SOBERSTONER?ref=SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/4284752_20230307104743168-100.jpg" },
    ],
  },
  {
    title: "CBD, Hemp & Cannabis Wellness",
    icon: Leaf,
    desc: "Products some members use as part of their recovery routines.",
    links: [
      { name: "Coast Smokes", code: "SOBERSTONER", url: "https://coastsmokes.co/", logo: "https://cdn2.lnk.bi/uploads/11432104_20251005051805110-100.jpg" },
      { name: "Healer CBD", code: "SOBERSTONER", url: "https://healercbd.com/coupon/soberstoner/?ref=237", logo: "https://cdn2.lnk.bi/uploads/9524041_20250320012844606-100.jpg" },
      { name: "Plain Jane", code: "SOBERSTONER", url: "https://plainjane.com/soberstoner", logo: "https://cdn2.lnk.bi/uploads/4570716_20230424095736500-100.jpg" },
      { name: "Pungent Greens CBD", code: "SOBERSTONER", url: "https://pungentgreens.com/collections/all", logo: "https://cdn2.lnk.bi/uploads/7808780_20240701224418947-100.jpg" },
      { name: "Earthy Now", code: "SOBERSTONER", url: "https://www.earthynow.com", logo: "https://cdn2.lnk.bi/uploads/12010744_20251202212756356-100.png" },
      { name: "Alien Flower Monkey", code: "SOBERSTONER15", url: "https://smokeafm.com/?sca_ref=922024.6EpRtEAC5x", logo: "https://cdn2.lnk.bi/uploads/4284774_20230307105612588-100.jpg" },
    ],
  },
  {
    title: "Vaporizers & Devices",
    icon: Cable,
    desc: "Device discounts and accessories from partner links.",
    links: [
      { name: "DYNAVAP", code: "SOBERSTONER", url: "https://www.dynavap.com/?ref=LAINIERUTH", logo: "https://cdn2.lnk.bi/uploads/8407012_20240930212435937-100.jpg" },
      { name: "AirVape", code: "SOBERSTONER", url: "https://airvapeusa.com/SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/12838899_20260328062943817-100.png" },
      { name: "Rokin Vapes", code: "SOBERSTONER", url: "https://bit.ly/360uWcr", logo: "https://cdn2.lnk.bi/uploads/4284780_20230307105956885-100.png" },
      { name: "Pulsar", code: "SOBERSTONER", url: "https://www.pulsarvaporizers.com", logo: "https://cdn2.lnk.bi/uploads/9515343_20250319004625306-100.jpg" },
      { name: "Wakit Grinders", code: "SOBERSTONER", url: "https://www.wakitgrinders.com/coupon/soberstoner/", logo: "https://cdn2.lnk.bi/uploads/9688921_20250412055734915-100.png" },
    ],
  },
  {
    title: "Storage, Filters & Accessories",
    icon: PackageCheck,
    desc: "Practical tools for safer storage, odor control, and daily use.",
    links: [
      { name: "Skunk Bags", code: "SOBERSTONER", url: "https://skunkbags.com/soberstoner", logo: "https://cdn2.lnk.bi/uploads/11114314_20250905044301743-100.jpg" },
      { name: "Stashlogix", code: "SOBERSTONER", url: "https://www.dynavap.com/search?q=Stash%20logix&ref=LAINIERUTH&type=product", logo: "https://cdn2.lnk.bi/uploads/4284689_20230307102237950-100.jpg" },
      { name: "VonSploof Smoke Filters", code: "SOBERSTONER", url: "https://vonsploof.com/soberstoner", logo: "https://cdn2.lnk.bi/uploads/10695815_20250729010653464-100.jpg" },
      { name: "PieceMaker", code: "SOBERSTONER", url: "https://www.piecemaker.com/SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/12182626_20251230065926148-100.png" },
      { name: "King Palm", code: "SOBERSTONER", url: "https://kingpalm.com", logo: "https://cdn2.lnk.bi/uploads/13010017_20260422071349419-100.jpg" },
      { name: "DaySavers", code: "SOBERSTONER", url: "https://daysavers.com/?ref=SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/12773570_20260320020532176-100.jpg" },
      { name: "Waxmaid", code: "SOBERSTONER", url: "https://www.waxmaidstore.com/?ref=soberstoner", logo: "https://cdn2.lnk.bi/uploads/9356221_20250222235905748-100.jpg" },
      { name: "BOMB Official", code: "SOBERSTONER", url: "https://bombofficial.com/?ref=soberstoner", logo: "https://cdn2.lnk.bi/uploads/10646015_20250724011135189-100.png" },
      { name: "PuffShot", code: "SOBERSTONER", url: "https://www.puffshotlife.com/?coupon_code=soberstoner", logo: "https://cdn2.lnk.bi/uploads/9688992_20250412061839539-100.jpg" },
      { name: "SoloPipe", code: "SOBERSTONER", url: "https://solopipe.com/?sca_ref=2760079.oNHfbS04OY", logo: "https://cdn2.lnk.bi/uploads/10667499_20250725215639957-100.jpg" },
      { name: "Hemp Wick Bee Line", code: "SOBERSTONER", url: "https://www.hempwickbeeline.com/shop", logo: "https://cdn2.lnk.bi/uploads/6586149_20240104102734627-100.jpg" },
      { name: "MooseLabs", code: "SOBERSTONER", url: "https://i.refs.cc/0m9M7O2m?smile_ref=eyJzbWlsZV9zb3VyY2UiOiJzbWlsZV91aSIsInNtaWxlX21lZGl1bSI6IiIsInNtaWxlX2NhbXBhaWduIjoicmVmZXJyYWxfcHJvZ3JhbSIsInNtaWxlX2N1c3RvbWVyX2lkIjoxODIzMjg1NTA4fQ%3D%3D", logo: "https://cdn2.lnk.bi/uploads/5351224_20230809175814716-100.png" },
    ],
  },
  {
    title: "Gummies, Mints & Beverages",
    icon: Candy,
    desc: "Partner links for edible-style products, mints, and drinks.",
    links: [
      { name: "Snoozy Gummy Discount Link", code: null, note: "Use this link, then click “Redeem Coupon.”", url: "https://snwbl.io/snoozy/SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/9153322_20250128220112811-100.png" },
      { name: "VitaBar", code: "SOBERSTONER", url: "https://snwbl.io/vitabar/SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/6452592_20231213215737236-100.png" },
      { name: "Nokkomo Mouth Watering Mints", code: "SOBERSTONER", url: "https://nokkomomints.com/?sca_ref=9800224.dqeOoKF1R8tZSvIC", logo: "https://cdn2.lnk.bi/uploads/11559300_20251017005222148-100.png" },
      { name: "Mitra9 Beverages", code: "SOBERSTONER", url: "https://mitra-9.com/?ref=SOBERSTONER", logo: "https://cdn2.lnk.bi/uploads/12067418_20251211013838861-100.jpg" },
    ],
  },
];

const categoryId = (title) =>
  `discount-${title.toLowerCase().replaceAll("&", "and").replaceAll(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`;

const CATEGORY_IDS = discountCategories.map((category) => categoryId(category.title));

function useActiveCategory(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <button
      type="button"
      className={`discount-copy ${copied ? "is-copied" : ""}`}
      onClick={handleCopy}
      aria-label={`Copy code ${code}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function DiscountLinks() {
  const activeCategory = useActiveCategory(CATEGORY_IDS);

  return (
    <main className="discount-page">
      <section className="discount-hero">
        <div className="discount-inner discount-hero__inner">
          <div className="discount-hero__copy">
            <p className="discount-eyebrow">Community perks</p>
            <h1>Discount links and codes.</h1>
            <p className="discount-intro">
              A gathered list of partner links, referral links, and discount codes
              connected to the Recovery With The Exit Drug community.
            </p>
            <nav className="discount-index" aria-label="Discount categories">
              {discountCategories.map((category, index) => {
                const id = categoryId(category.title);
                return (
                  <a
                    href={`#${id}`}
                    key={category.title}
                    className={activeCategory === id ? "is-active" : undefined}
                    aria-current={activeCategory === id ? "true" : undefined}
                  >
                    <span>0{index + 1}</span>
                    {category.title}
                  </a>
                );
              })}
            </nav>
          </div>
          <svg className="discount-hero__art" viewBox="0 0 500 380" aria-hidden="true">
            <path className="discount-hero__orbit" pathLength="1" d="M38 190C38 89 124 29 252 29c130 0 210 61 210 162 0 103-82 158-212 158S38 294 38 190Z" />
            <path className="discount-hero__tag" pathLength="1" d="M128 92h176l88 88-158 158-106-106Z" />
            <path className="discount-hero__fold" pathLength="1" d="m304 92-1 89 89-1" />
            <circle className="discount-hero__hole" cx="177" cy="141" r="13" />
            <path className="discount-hero__percent" pathLength="1" d="m220 234 78-78M226 166a15 15 0 1 0 0 .1M292 224a15 15 0 1 0 0 .1" />
            <path className="discount-hero__thread" pathLength="1" d="M177 128C133 83 86 91 69 125" />
          </svg>
        </div>
      </section>

      <section className="discount-section">
        <div className="discount-inner discount-category-list">
          {discountCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
            <section className="discount-category" id={categoryId(category.title)} key={category.title}>
              <div className="discount-category__head">
                <span className="discount-category__number">0{categoryIndex + 1}</span>
                <span className="discount-category__icon"><CategoryIcon /></span>
                <h2>{category.title}</h2>
                <p>{category.desc}</p>
              </div>

              <div className="discount-grid">
                {category.links.map((link) => (
                  <div key={link.name} className="discount-card discount-feature-card">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="discount-card__link-overlay"
                      aria-label={link.name}
                    />
                    <img
                      src={link.logo}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="discount-card__logo"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />

                    <div className="discount-card__body">
                      <div>
                        <h3>{link.name}</h3>
                        {link.note && <p>{link.note}</p>}
                      </div>

                      <div className="discount-card__bottom">
                        {link.code ? (
                          <span className="discount-code discount-code-row">
                            Code: <strong>{link.code}</strong>
                            <CopyCodeButton code={link.code} />
                          </span>
                        ) : (
                          <span className="discount-code discount-code--none">
                            No code needed
                          </span>
                        )}
                        <span className="discount-arrow"><ExternalLink /></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            );
          })}
        </div>
      </section>

      <section className="discount-disclaimer-section">
        <div className="discount-inner">
          <div className="discount-disclaimer">
            <span className="discount-disclaimer__icon"><ShieldAlert /></span>
            <p><strong>Important:</strong> Some links may be affiliate or referral
              links. Products listed here are not medical advice and are not a
              substitute for professional care. Always follow your local laws.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
