import "./DiscountLinks.css";

const discountLinks = [
  { name: "Etsy #EXITDRUG Advocate T-Shirt", code: "EXITDRUG", url: "https://www.etsy.com/shop/TheExitDrugRecovery" },
  { name: "Coast Smokes", code: "SOBERSTONER", url: "https://coastsmokes.co/" },
  { name: "Healer CBD", code: "SOBERSTONER", url: "https://healercbd.com/coupon/soberstoner/?ref=237" },
  { name: "Snoozy Gummy Discount Link (must use this link then click “Redeem Coupon”)", code: null, url: "https://snwbl.io/snoozy/SOBERSTONER" },
  { name: "Plain Jane", code: "SOBERSTONER", url: "https://plainjane.com/soberstoner" },
  { name: "Pungent Greens CBD", code: "SOBERSTONER", url: "https://pungentgreens.com/collections/all" },
  { name: "Earthy Now", code: "SOBERSTONER", url: "https://www.earthynow.com" },
  { name: "DYNAVAP", code: "SOBERSTONER", url: "https://www.dynavap.com/?ref=LAINIERUTH" },
  { name: "AirVape", code: "SOBERSTONER", url: "https://airvapeusa.com/SOBERSTONER" },
  { name: "Rokin Vapes", code: "SOBERSTONER", url: "https://bit.ly/360uWcr" },
  { name: "Skunk Bags", code: "SOBERSTONER", url: "https://skunkbags.com/soberstoner" },
  { name: "Stashlogix", code: "SOBERSTONER", url: "https://www.dynavap.com/search?q=Stash%20logix&ref=LAINIERUTH&type=product" },
  { name: "VonSploof Smoke Filters", code: "SOBERSTONER", url: "https://vonsploof.com/soberstoner" },
  { name: "PieceMaker", code: "SOBERSTONER", url: "https://www.piecemaker.com/SOBERSTONER" },
  { name: "King Palm", code: "SOBERSTONER", url: "https://kingpalm.com" },
  { name: "DaySavers", code: "SOBERSTONER", url: "https://daysavers.com/?ref=SOBERSTONER" },
  { name: "Waxmaid", code: "SOBERSTONER", url: "https://www.waxmaidstore.com/?ref=soberstoner" },
  { name: "BOMB Official", code: "SOBERSTONER", url: "https://bombofficial.com/?ref=soberstoner" },
  { name: "PuffShot", code: "SOBERSTONER", url: "https://www.puffshotlife.com/?coupon_code=soberstoner" },
  { name: "VitaBar", code: "SOBERSTONER", url: "https://snwbl.io/vitabar/SOBERSTONER" },
  { name: "Nokkomo Mouth Watering Mints", code: "SOBERSTONER", url: "https://nokkomomints.com/?sca_ref=9800224.dqeOoKF1R8tZSvIC" },
  { name: "Wakit Grinders", code: "SOBERSTONER", url: "https://www.wakitgrinders.com/coupon/soberstoner/" },
  { name: "8000 Kicks", code: "SOBERSTONER", url: "https://www.8000kicks.com/discount/SOBERSTONER?ref=SOBERSTONER" },
  { name: "Mitra9 Beverages", code: "SOBERSTONER", url: "https://mitra-9.com/?ref=SOBERSTONER" },
  { name: "SoloPipe", code: "SOBERSTONER", url: "https://solopipe.com/?sca_ref=2760079.oNHfbS04OY" },
  { name: "LJXLDN", code: "SOBERSTONER", url: "https://www.ljxlondon.co.uk/?ref=SOBERSTONER" },
  { name: "Alien Flower Monkey", code: "SOBERSTONER15", url: "https://smokeafm.com/?sca_ref=922024.6EpRtEAC5x" },
  { name: "Pulsar", code: "SOBERSTONER", url: "https://www.pulsarvaporizers.com" },
  { name: "Hemp Wick Bee Line", code: "SOBERSTONER", url: "https://www.hempwickbeeline.com/shop" },
  {
    name: "MooseLabs",
    code: "SOBERSTONER",
    url: "https://i.refs.cc/0m9M7O2m?smile_ref=eyJzbWlsZV9zb3VyY2UiOiJzbWlsZV91aSIsInNtaWxlX21lZGl1bSI6IiIsInNtaWxlX2NhbXBhaWduIjoicmVmZXJyYWxfcHJvZ3JhbSIsInNtaWxlX2N1c3RvbWVyX2lkIjoxODIzMjg1NTA4fQ%3D%3D",
  },
];

export default function DiscountLinks() {
  return (
    <div className="discount-links">
      <h2 className="discount-links__title">Discount Links & Codes</h2>
      <ul className="discount-links__list">
        {discountLinks.map((link, i) => (
          <li key={i}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="discount-links__item"
            >
              <span className="discount-links__name">{link.name}</span>
              {link.code && (
                <span className="discount-links__code">Code: {link.code}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
