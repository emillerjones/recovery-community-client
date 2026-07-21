import "./DiscountLinks2.css";

/**
 * DiscountLinks2 — demonstrates a touch-friendly pointer-spotlight
 * hover: a soft glow follows the pointer across each card. It's driven
 * by Pointer Events (not `:hover`), which unify mouse, pen, and touch
 * — so dragging a finger across a card on a phone moves the spotlight
 * exactly the way a mouse would on desktop, instead of the effect
 * simply not existing on touchscreens the way plain CSS `:hover` would.
 */

const discountCategories = [
  {
    title: "Apparel & Advocacy",
    desc: "Wear the message and support the movement.",
    links: [
      { name: "Etsy #EXITDRUG Advocate T-Shirt", code: "EXITDRUG", url: "https://www.etsy.com/shop/TheExitDrugRecovery" },
      { name: "LJXLDN", code: "SOBERSTONER", url: "https://www.ljxlondon.co.uk/?ref=SOBERSTONER" },
      { name: "8000 Kicks", code: "SOBERSTONER", url: "https://www.8000kicks.com/discount/SOBERSTONER?ref=SOBERSTONER" },
    ],
  },
  {
    title: "CBD, Hemp & Cannabis Wellness",
    desc: "Products some members use as part of their recovery routines.",
    links: [
      { name: "Coast Smokes", code: "SOBERSTONER", url: "https://coastsmokes.co/" },
      { name: "Healer CBD", code: "SOBERSTONER", url: "https://healercbd.com/coupon/soberstoner/?ref=237" },
      { name: "Plain Jane", code: "SOBERSTONER", url: "https://plainjane.com/soberstoner" },
      { name: "Pungent Greens CBD", code: "SOBERSTONER", url: "https://pungentgreens.com/collections/all" },
      { name: "Earthy Now", code: "SOBERSTONER", url: "https://www.earthynow.com" },
      { name: "Alien Flower Monkey", code: "SOBERSTONER15", url: "https://smokeafm.com/?sca_ref=922024.6EpRtEAC5x" },
    ],
  },
  {
    title: "Vaporizers & Devices",
    desc: "Device discounts and accessories from partner links.",
    links: [
      { name: "DYNAVAP", code: "SOBERSTONER", url: "https://www.dynavap.com/?ref=LAINIERUTH" },
      { name: "AirVape", code: "SOBERSTONER", url: "https://airvapeusa.com/SOBERSTONER" },
      { name: "Rokin Vapes", code: "SOBERSTONER", url: "https://bit.ly/360uWcr" },
      { name: "Pulsar", code: "SOBERSTONER", url: "https://www.pulsarvaporizers.com" },
      { name: "Wakit Grinders", code: "SOBERSTONER", url: "https://www.wakitgrinders.com/coupon/soberstoner/" },
    ],
  },
  {
    title: "Storage, Filters & Accessories",
    desc: "Practical tools for safer storage, odor control, and daily use.",
    links: [
      { name: "Skunk Bags", code: "SOBERSTONER", url: "https://skunkbags.com/soberstoner" },
      { name: "Stashlogix", code: "SOBERSTONER", url: "https://www.dynavap.com/search?q=Stash%20logix&ref=LAINIERUTH&type=product" },
      { name: "VonSploof Smoke Filters", code: "SOBERSTONER", url: "https://vonsploof.com/soberstoner" },
      { name: "PieceMaker", code: "SOBERSTONER", url: "https://www.piecemaker.com/SOBERSTONER" },
      { name: "King Palm", code: "SOBERSTONER", url: "https://kingpalm.com" },
      { name: "DaySavers", code: "SOBERSTONER", url: "https://daysavers.com/?ref=SOBERSTONER" },
      { name: "Waxmaid", code: "SOBERSTONER", url: "https://www.waxmaidstore.com/?ref=soberstoner" },
      { name: "BOMB Official", code: "SOBERSTONER", url: "https://bombofficial.com/?ref=soberstoner" },
      { name: "PuffShot", code: "SOBERSTONER", url: "https://www.puffshotlife.com/?coupon_code=soberstoner" },
      { name: "SoloPipe", code: "SOBERSTONER", url: "https://solopipe.com/?sca_ref=2760079.oNHfbS04OY" },
      { name: "Hemp Wick Bee Line", code: "SOBERSTONER", url: "https://www.hempwickbeeline.com/shop" },
      { name: "MooseLabs", code: "SOBERSTONER", url: "https://i.refs.cc/0m9M7O2m" },
    ],
  },
  {
    title: "Gummies, Mints & Beverages",
    desc: "Partner links for edible-style products, mints, and drinks.",
    links: [
      { name: "Snoozy Gummy Discount Link", code: null, url: "https://snwbl.io/snoozy/SOBERSTONER" },
      { name: "VitaBar", code: "SOBERSTONER", url: "https://snwbl.io/vitabar/SOBERSTONER" },
      { name: "Nokkomo Mouth Watering Mints", code: "SOBERSTONER", url: "https://nokkomomints.com/?sca_ref=9800224.dqeOoKF1R8tZSvIC" },
      { name: "Mitra9 Beverages", code: "SOBERSTONER", url: "https://mitra-9.com/?ref=SOBERSTONER" },
    ],
  },
];

function handleSpotlightMove(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty("--spot-x", `${x}%`);
  card.style.setProperty("--spot-y", `${y}%`);
  card.style.setProperty("--spot-o", "1");
}

function handleSpotlightLeave(event) {
  event.currentTarget.style.setProperty("--spot-o", "0");
}

export default function DiscountLinks2() {
  return (
    <main className="discount2">
      <section className="discount2-hero">
        <p className="discount2-eyebrow">Community perks</p>
        <h1>Discount links and codes.</h1>
        <p>A gathered list of partner links, referral links, and discount codes connected to the Recovery With The Exit Drug community.</p>

        <aside className="discount2-note" aria-label="Design technique: pointer-spotlight hover">
          <p className="discount2-note__label">Design technique</p>
          <h3>Touch-friendly spotlight hover</h3>
          <p>
            Move your mouse over a card — or drag a finger across one on
            your phone — and a soft light follows the exact point of
            contact. It's built on Pointer Events, which treat mouse and
            touch input the same way, so the effect isn't a
            desktop-only trick.
          </p>
        </aside>
      </section>

      <section className="discount2-section">
        {discountCategories.map((category) => (
          <div className="discount2-category" key={category.title}>
            <div className="discount2-category__head">
              <h2>{category.title}</h2>
              <p>{category.desc}</p>
            </div>

            <div className="discount2-grid">
              {category.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="discount2-card"
                  onPointerMove={handleSpotlightMove}
                  onPointerLeave={handleSpotlightLeave}
                  onPointerUp={handleSpotlightLeave}
                  onPointerCancel={handleSpotlightLeave}
                >
                  <span className="discount2-card__spot" aria-hidden="true" />
                  <div className="discount2-card__body">
                    <h3>{link.name}</h3>
                    {link.code ? (
                      <span className="discount2-code">Code: <strong>{link.code}</strong></span>
                    ) : (
                      <span className="discount2-code discount2-code--none">No code needed</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="discount2-disclaimer">
        <p><strong>Important:</strong> Some links may be affiliate or referral links. Products listed here are not medical advice and are not a substitute for professional care. Always follow your local laws.</p>
      </section>
    </main>
  );
}
