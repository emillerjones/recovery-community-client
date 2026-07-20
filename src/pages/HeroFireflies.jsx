import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import {
  BatchedRenderer,
  ParticleSystem,
  RectangleEmitter,
  ConstantValue,
  IntervalValue,
  ColorRange,
  Gradient,
  ApplyForce,
  Noise,
  ColorOverLife,
  Vector3 as QVector3,
  Vector4 as QVector4,
} from "three.quarks";
import { useSoftGlowTexture } from "./useSoftGlowTexture";

// A sparse field of slow, twinkling light motes drifting over the hero photo.
function Fireflies({ reduced }) {
  const texture = useSoftGlowTexture();
  const batchRenderer = useMemo(() => new BatchedRenderer(), []);

  const system = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    return new ParticleSystem({
      duration: 1,
      looping: true,
      prewarm: true,
      startLife: new IntervalValue(4, 8),
      startSpeed: new IntervalValue(0.02, 0.08),
      startSize: new IntervalValue(0.02, 0.05),
      startColor: new ColorRange(new QVector4(1, 0.87, 0.6, 1), new QVector4(1, 0.75, 0.42, 1)),
      emissionOverTime: new ConstantValue(reduced ? 0 : 2.4),
      shape: new RectangleEmitter({ width: 7.5, height: 4, thickness: 1 }),
      material,
      behaviors: [
        new ApplyForce(new QVector3(0, 1, 0), new ConstantValue(0.025)),
        new Noise(new ConstantValue(0.18), new ConstantValue(0.4), new ConstantValue(0.55)),
        new ColorOverLife(
          new Gradient(
            [
              [new QVector3(1, 0.87, 0.6), 0],
              [new QVector3(1, 0.75, 0.42), 1],
            ],
            [
              [0, 0],
              [1, 0.18],
              [1, 0.75],
              [0, 1],
            ]
          )
        ),
      ],
    });
  }, [texture, reduced]);

  useEffect(() => {
    batchRenderer.addSystem(system);
    system.play();
    return () => batchRenderer.deleteSystem(system);
  }, [batchRenderer, system]);

  useFrame((_, delta) => {
    batchRenderer.update(Math.min(delta, 0.05));
  });

  return (
    <>
      <primitive object={batchRenderer} />
      <primitive object={system.emitter} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Experimental: a sparse field of ambient light particles drifting over the
// hero photo. Self-contained — remove the <HeroFireflies /> usage in
// Home.jsx to take it out, nothing else depends on this file.
// ─────────────────────────────────────────────────────────────────────────
export default function HeroFireflies({ reduced }) {
  const containerRef = useRef(null);

  function handleCreated() {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: reduced ? 0.3 : 2.2, ease: "power2.out" });
  }

  return (
    <div ref={containerRef} className="home-hero__fireflies" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }} onCreated={handleCreated}>
        <Fireflies reduced={reduced} />
      </Canvas>
    </div>
  );
}
