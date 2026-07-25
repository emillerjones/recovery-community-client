import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../auth/AuthContext";
import { usePrefersReducedMotion, supportsWebGL } from "./motionSupport";
import "./Welcome.css";

// Same lazy/idle-load pattern as Home.jsx, so this heavy 3D chunk never
// competes with the rest of the page for bandwidth on first paint.
const HeroFireflies = lazy(() => import("./HeroFireflies"));

// PLACEHOLDER — once the real application data is wired up, this becomes
// the member's own `reasonForJoining` from registration. Some members won't
// have written much here, so the caller should be ready to skip this beat
// entirely when there's nothing genuine to reflect back.
const MOCK_REASON = "I'm tired of doing this alone, and I want to see what it's like to have people who actually get it.";

const BEATS = [
  "You applied.",
  "You were reviewed.",
  "You were welcomed in.",
];
const BEAT_DURATION_MS = 2400;

export default function Welcome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const [canRender3D] = useState(() => typeof window !== "undefined" && supportsWebGL());
  const [fireflyReady, setFireflyReady] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [revealed, setRevealed] = useState(reduced);
  const [entering, setEntering] = useState(false);
  const [memberCount, setMemberCount] = useState(null);

  const sceneRef = useRef(null);
  const doorLeftRef = useRef(null);
  const doorRightRef = useRef(null);
  const flashRef = useRef(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (reduced || !canRender3D) return;
    const run = () => setFireflyReady(true);
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 400);
    return () => window.clearTimeout(id);
  }, [reduced, canRender3D]);

  // Step through "You applied." / "You were reviewed." / "You were welcomed
  // in." one at a time, then reveal the final panel. Skipped entirely for
  // reduced-motion members — they land straight on the final panel.
  useEffect(() => {
    if (reduced) return;
    if (beatIndex >= BEATS.length) {
      const id = window.setTimeout(() => setRevealed(true), 400);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setBeatIndex((current) => current + 1), BEAT_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [beatIndex, reduced]);

  // Real: today's total membership, so "you're joining X members" isn't a
  // made-up number. (Trending/pinned-style — nothing here is member-private.)
  useEffect(() => {
    async function loadCount() {
      const response = await fetch(`${import.meta.env.VITE_API}/api/users`, { headers });
      if (!response.ok) return;
      const users = await response.json();
      setMemberCount(Array.isArray(users) ? users.length : null);
    }
    loadCount().catch(() => setMemberCount(null));
  }, [headers]);

  function enterCommunity() {
    if (entering) return;
    setEntering(true);

    if (reduced) {
      navigate("/forum");
      return;
    }

    // Doors rest just off-screen (see Welcome.css) so they never block the
    // beats or the reveal panel. The sequence below brings them in closed,
    // then swings them open to carry the transition into the forum.
    //
    // Plain pixel `x` values instead of `xPercent`: the scene is being
    // scaled at the same time, and GSAP's xPercent-to-px conversion reads
    // that unreliably mid-animation, causing the doors to over/undershoot.
    const doorWidth = window.innerWidth / 2;
    gsap.set([doorLeftRef.current, doorRightRef.current], { visibility: "visible" });
    gsap.set(doorLeftRef.current, { x: -doorWidth });
    gsap.set(doorRightRef.current, { x: doorWidth });

    const timeline = gsap.timeline({ onComplete: () => navigate("/forum") });
    timeline
      .to(sceneRef.current, { scale: 1.05, duration: 1.4, ease: "power1.in" }, 0)
      .to([doorLeftRef.current, doorRightRef.current], { opacity: 1, duration: 0.3, ease: "power1.out" }, 0)
      .to(doorLeftRef.current, { x: 0, duration: 0.45, ease: "power3.out" }, 0)
      .to(doorRightRef.current, { x: 0, duration: 0.45, ease: "power3.out" }, 0)
      .to(flashRef.current, { opacity: 1, duration: 0.45, ease: "power2.in" }, 0.5)
      .to(doorLeftRef.current, { x: -doorWidth, duration: 0.75, ease: "power3.inOut" }, 0.75)
      .to(doorRightRef.current, { x: doorWidth, duration: 0.75, ease: "power3.inOut" }, 0.75)
      .to(flashRef.current, { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.35)
      .to(sceneRef.current, { opacity: 0, duration: 0.3, ease: "power1.in" }, 1.5);
  }

  return (
    <main className="welcome-shell">
      <div className="welcome-scene" ref={sceneRef}>
        <div className="welcome-scene__veil" />

        {fireflyReady && (
          <Suspense fallback={null}>
            <HeroFireflies reduced={reduced} />
          </Suspense>
        )}

        {!revealed && (
          <div className="welcome-beats">
            {BEATS.map((beat, index) => (
              index === beatIndex && (
                <p className="welcome-beat" key={beat}>{beat}</p>
              )
            ))}
          </div>
        )}

        {revealed && (
          <div className={`welcome-panel ${entering ? "is-entering" : ""}`}>
            <p className="welcome-eyebrow">Application approved</p>
            <h1>Welcome, {user?.username || "friend"}.</h1>

            {MOCK_REASON && (
              <blockquote className="welcome-quote">
                <span>You told us:</span>
                &ldquo;{MOCK_REASON}&rdquo;
              </blockquote>
            )}

            <p className="welcome-population">
              {memberCount ? `You're joining ${memberCount} other members who are already here.` : "You're joining a community that's already here for you."}
            </p>

            <button type="button" className="welcome-enter" onClick={enterCommunity} disabled={entering}>
              {entering ? "Opening…" : "Enter the community"}
            </button>
          </div>
        )}

        <div className="welcome-door welcome-door--left" ref={doorLeftRef} />
        <div className="welcome-door welcome-door--right" ref={doorRightRef} />
        <div className="welcome-flash" ref={flashRef} />
      </div>
    </main>
  );
}
