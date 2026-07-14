import { useMemo } from "react";
import * as THREE from "three";

// A soft radial-gradient sprite used for glow-style particles/sprites across
// the site's small WebGL/R3F scenes (CommunityBonfire, HeroFireflies, ...).
// Generated once and shared so we don't pay for more than one canvas readback.
//
// This imports `three`, so it must only ever be imported by scene components
// themselves (already lazy-loaded) — never by a page component directly.
export function useSoftGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}
