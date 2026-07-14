import { useEffect, useState } from "react";

// Deliberately has zero dependency on three.js/R3F. It gets imported eagerly
// (from page components, not just the lazy-loaded 3D scenes themselves) to
// decide whether it's even worth fetching the heavy 3D chunk — so it must
// stay tiny, or the thing it's guarding against ends up in the main bundle
// anyway.

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}
