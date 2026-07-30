import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import logo from "../assets/icons/logo.png";
import { useAuth } from "../auth/AuthContext";
import { usePrefersReducedMotion } from "../utils/motionSupport";
import "./WelcomeOverlay.css";

export default function WelcomeOverlay({ onComplete }) {
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();
  const [entering, setEntering] = useState(false);

  const shellRef = useRef(null);
  const coverRef = useRef(null);
  const contentRef = useRef(null);
  const ruleRef = useRef(null);

  useEffect(() => {
    // The forum is already rendered underneath this editorial cover. Keep it
    // still until the member lifts the cover and enters the community.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  function enterCommunity() {
    if (entering) return;
    setEntering(true);

    if (reduced) {
      onComplete();
      return;
    }

    // WELCOME TRACE: The gold rule completes, the message settles away, and
    // one warm paper cover lifts to reveal the already-loaded Forum beneath.
    gsap.timeline({ onComplete })
      .to(contentRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.22,
        ease: "power1.in",
      }, 0)
      .to(ruleRef.current, {
        scaleX: 1,
        duration: 0.38,
        ease: "power2.inOut",
      }, 0)
      .to(coverRef.current, {
        yPercent: -100,
        duration: 0.78,
        ease: "power3.inOut",
      }, 0.24)
      .to(shellRef.current, {
        opacity: 0,
        duration: 0.08,
        ease: "none",
      }, 0.94);
  }

  return (
    <div className="welcome-shell" ref={shellRef} role="dialog" aria-modal="true">
      <div className="welcome-cover" ref={coverRef}>
        <header className="welcome-brand">
          <img src={logo} alt="" />
          <span>Recovery With<br />The Exit Drug</span>
        </header>

        <section className="welcome-content" ref={contentRef}>
          <p className="welcome-eyebrow">Application approved</p>
          <h1>You belong here.</h1>
          <p className="welcome-personal">
            Welcome, <strong>{user?.username || "friend"}</strong>.<br />
            Your place in the community is ready.
          </p>
          <button type="button" onClick={enterCommunity} disabled={entering}>
            {entering ? "Entering…" : "Enter the community"}
            <ArrowRight size={18} />
          </button>
        </section>

        <div className="welcome-rule" ref={ruleRef} aria-hidden="true" />
        <p className="welcome-footnote">A private member community</p>
      </div>
    </div>
  );
}
