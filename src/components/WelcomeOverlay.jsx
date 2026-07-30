import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import logo from "../assets/icons/logo.png";
import groveBackground from "../assets/welcome/member-grove-background.png";
import { useAuth } from "../auth/AuthContext";
import { usePrefersReducedMotion } from "../utils/motionSupport";
import WelcomeMushroomScene from "./WelcomeMushroomScene";
import "./WelcomeOverlay.css";

export default function WelcomeOverlay({ onComplete }) {
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();
  const [entering, setEntering] = useState(false);
  const [ceremonyReady, setCeremonyReady] = useState(reduced);

  const shellRef = useRef(null);
  const coverRef = useRef(null);
  const sceneRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => setCeremonyReady(true), 5000);
    return () => window.clearTimeout(fallback);
  }, []);

  const finishCeremony = useCallback(() => setCeremonyReady(true), []);

  function enterCommunity() {
    if (entering || !ceremonyReady) return;
    setEntering(true);

    if (reduced) {
      onComplete();
      return;
    }

    gsap.timeline({ onComplete })
      .to(contentRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.28,
        ease: "power1.in",
      }, 0)
      .to(sceneRef.current, {
        opacity: 0,
        scale: 1.035,
        duration: 0.78,
        ease: "power2.inOut",
      }, 0.12)
      .to(coverRef.current, {
        opacity: 0,
        duration: 0.52,
        ease: "power1.inOut",
      }, 0.46)
      .to(shellRef.current, {
        opacity: 0,
        duration: 0.08,
        ease: "none",
      }, 0.94);
  }

  return (
    <div className="welcome-shell" ref={shellRef} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-cover" ref={coverRef}>
        <div
          className="welcome-grove"
          ref={sceneRef}
          style={{ backgroundImage: `url(${groveBackground})` }}
          aria-hidden="true"
        >
          <WelcomeMushroomScene reduced={reduced} onReady={finishCeremony} />
        </div>

        <header className="welcome-brand">
          <img src={logo} alt="" />
          <span>Recovery With<br />The Exit Drug</span>
        </header>

        <section className={`welcome-content ${ceremonyReady ? "is-ready" : ""}`} ref={contentRef}>
          <p className="welcome-eyebrow">Application approved</p>
          <h1 id="welcome-title">You belong here.</h1>
          <p className="welcome-personal">
            Welcome, <strong>{user?.username || "friend"}</strong>.<br />
            Your place in the community is ready.
          </p>
          <button type="button" onClick={enterCommunity} disabled={entering || !ceremonyReady}>
            {entering ? "Entering…" : ceremonyReady ? "Enter the community" : "Joining the grove…"}
            <ArrowRight size={18} />
          </button>
        </section>

        <p className="welcome-footnote">A private member community</p>
      </div>
    </div>
  );
}
