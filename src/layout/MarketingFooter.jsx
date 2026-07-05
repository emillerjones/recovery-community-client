import { NavLink } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import "./MarketingFooter.css";
import logo from "../assets/icons/logo.png";

export default function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer__inner">
        
        <div className="marketing-footer__brand">
          <NavLink to="/" className="marketing-footer__logo">
            <img
              src={logo}
              alt="Recovery With The Exit Drug"
              className="marketing-footer__logo-mark"
            />

            <span className="marketing-footer__logo-text">
              Recovery With<br />The Exit Drug
            </span>
          </NavLink>

          <p>
            A welcoming community exploring cannabis as a path away from alcohol,
            opioids, and other harmful substances.
          </p>
        </div>

        <nav className="marketing-footer__links" aria-label="Footer navigation">
          <div>
            <h3>Community</h3>
            <NavLink to="/community">Features</NavLink>
            <NavLink to="/stories">Stories</NavLink>
            <NavLink to="/guidelines">Culture</NavLink>
          </div>
          <div>
            <h3>Learn</h3>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
          </div>
          <div>
            <h3>Support</h3>
            <NavLink to="/donate">Donate</NavLink>
            <NavLink to="/merch">Merch</NavLink>
            <NavLink to="/discountlinks">Discount Partners</NavLink>
          </div>
          <div>
            <h3>About</h3>
            <NavLink to="/about">Our Mission</NavLink>
            <NavLink to="/mystory">My Story</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </nav>
      </div>

      <div className="marketing-footer__bottom">
        <p>© 2026 Recovery With The Exit Drug</p>
        <div className="marketing-footer__social">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF /><span>Facebook</span>
          </a>
          <a href="https://www.instagram.com/recoverywiththeexitdrug" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram /><span>Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
