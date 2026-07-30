import { useEffect, useState } from "react";

// Deliberately has zero dependency on three.js/R3F. Page components import
// this tiny utility before deciding whether heavier animation code is useful.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

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
    return !!(
      canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}
