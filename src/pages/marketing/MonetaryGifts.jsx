import { FaPaypal } from "react-icons/fa";
import { SiCashapp } from "react-icons/si";
import qrImage from "../../assets/images/cashapp-qr.png";
import "./MonetaryGifts.css";

const PAYPAL_URL = "https://paypal.me/TheExitDrug";
const CASHAPP_URL = "https://cash.app/$exitdrug";
const CASHTAG = "$exitdrug";

export default function MonetaryGifts() {
  return (
    <main className="monetary-gifts">
      <section className="monetary-gifts__hero" data-nav-theme="light">
        <p className="monetary-gifts__kicker">Support the community</p>
        <h1>Give a monetary gift.</h1>
        <p className="monetary-gifts__intro">
          Recovery With The Exit Drug is free to join and run entirely by
          volunteers. If you'd like to help cover hosting and keep it
          running, here are two simple ways to send a gift.
        </p>
      </section>

      <section className="monetary-gifts__options">
        <div className="gift-card gift-card--paypal">
          <span className="gift-card__icon" aria-hidden="true"><FaPaypal /></span>
          <h2>PayPal</h2>
          <p>Send a one-time gift directly through PayPal — fast, familiar, and secure.</p>
          <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" className="gift-card__button">
            Give via PayPal <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="gift-card gift-card--cashapp">
          <span className="gift-card__icon" aria-hidden="true"><SiCashapp /></span>
          <h2>Cash App</h2>
          <p>Scan the code in the Cash App, or send directly to {CASHTAG}.</p>
          <img src={qrImage} alt={`Cash App QR code for ${CASHTAG}`} className="gift-card__qr" />
          <p className="gift-card__cashtag">{CASHTAG}</p>
          <a href={CASHAPP_URL} target="_blank" rel="noopener noreferrer" className="gift-card__button">
            Open Cash App <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="monetary-gifts__note">
        <p>Every gift helps keep the community free and accessible. Thank you.</p>
      </section>
    </main>
  );
}
