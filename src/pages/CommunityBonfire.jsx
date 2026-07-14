import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Image as DreiImage, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import {
  BatchedRenderer,
  ParticleSystem,
  ConeEmitter,
  ConstantValue,
  IntervalValue,
  ColorRange,
  Gradient,
  ApplyForce,
  ColorOverLife,
  Noise,
  Vector3 as QVector3,
  Vector4 as QVector4,
} from "three.quarks";
import { PUBLIC_STORIES } from "../data/publicStories";
import { useSoftGlowTexture } from "./useSoftGlowTexture";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { usePrefersReducedMotion, supportsWebGL } from "./motionSupport";
import "./CommunityBonfire.css";

// --- the flame itself: a handful of additive sprites + a flickering point light ---
function FireCore({ reduced, introRef }) {
  const glow = useSoftGlowTexture();
  const groupRef = useRef();
  const flameRefs = useRef([]);
  const lightRef = useRef();
  const groundRef = useRef();

  const flames = useMemo(
    () => [
      { x: 0, y: 0.42, w: 0.82, h: 1.25, color: "#ffd48a" },
      { x: -0.2, y: 0.24, w: 0.65, h: 0.95, color: "#ff8a3d" },
      { x: 0.22, y: 0.26, w: 0.6, h: 0.9, color: "#ff7a2e" },
      { x: 0.02, y: 0.66, w: 0.4, h: 0.65, color: "#ffb45c" },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const intro = introRef.current.t;
    const flicker = reduced ? 0 : 1;

    if (groupRef.current) groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.35, 1, intro));

    flameRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const f = flames[i];
      const wobble = 1 + Math.sin(t * (3.1 + i * 0.7) + i * 12.3) * 0.09 * flicker + Math.sin(t * (7.2 + i)) * 0.05 * flicker;
      sprite.scale.set(f.w * wobble, f.h * wobble, 1);
      sprite.position.x = f.x + Math.sin(t * (1.4 + i * 0.4) + i * 3.1) * 0.045 * flicker;
    });

    if (lightRef.current) {
      const base = 3.2 * intro;
      lightRef.current.intensity = base + (reduced ? 0 : Math.sin(t * 9.4) * 0.4 + Math.sin(t * 21) * 0.22);
    }

    if (groundRef.current) {
      groundRef.current.material.opacity = 0.48 * intro + (reduced ? 0 : Math.sin(t * 6) * 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <pointLight ref={lightRef} color="#ff9a4d" position={[0, 0.6, 0.35]} distance={11} decay={2} />
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[2.2, 40]} />
        <meshBasicMaterial map={glow} color="#ff7a2e" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {flames.map((f, i) => (
        <sprite key={i} ref={(el) => (flameRefs.current[i] = el)} position={[f.x, f.y, 0]}>
          <spriteMaterial map={glow} color={f.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
}

// --- rising embers, real GPU particles via three.quarks ---
function Embers({ reduced }) {
  const texture = useSoftGlowTexture();
  const groupRef = useRef();
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
      startLife: new IntervalValue(1.3, 2.6),
      startSpeed: new IntervalValue(0.2, 0.45),
      startSize: new IntervalValue(0.045, 0.11),
      startColor: new ColorRange(new QVector4(1, 0.72, 0.32, 1), new QVector4(1, 0.48, 0.14, 1)),
      emissionOverTime: new ConstantValue(reduced ? 0 : 24),
      shape: new ConeEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 1, angle: 9 }),
      material,
      behaviors: [
        new ApplyForce(new QVector3(0, 1, 0), new ConstantValue(0.65)),
        new Noise(new ConstantValue(0.5), new ConstantValue(0.28), new ConstantValue(0.35)),
        new ColorOverLife(
          new Gradient(
            [
              [new QVector3(1, 0.68, 0.28), 0],
              [new QVector3(1, 0.38, 0.1), 0.55],
              [new QVector3(0.28, 0.07, 0.02), 1],
            ],
            [
              [1, 0],
              [0.85, 0.45],
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
    <group ref={groupRef} position={[0, -0.05, 0]}>
      <primitive object={batchRenderer} />
      <primitive object={system.emitter} />
    </group>
  );
}

// --- one story, orbiting the fire, billboarded toward the camera ---
function OrbitCard({ story, angleOffset, radius, height, speed, index, count, reduced, introRef, onSelect }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const delay = (index / count) * 0.45;

  useEffect(() => () => { document.body.style.cursor = "auto"; }, []);

  useFrame((state) => {
    const t = introRef.current.t;
    const local = THREE.MathUtils.clamp((t - delay) / 0.55, 0, 1);
    const eased = local * local * (3 - 2 * local);
    const elapsed = state.clock.elapsedTime;
    const angle = angleOffset + (reduced ? 0 : elapsed) * speed;
    const liveRadius = radius * (0.2 + 0.8 * eased);

    if (groupRef.current) {
      // A shallow ellipse rather than a full circle — keeps every card at a
      // comfortable, roughly constant distance from the camera instead of
      // swinging close enough to clip on the near side of the orbit.
      groupRef.current.position.set(
        Math.cos(angle) * liveRadius,
        height + Math.sin(elapsed * 0.5 + angleOffset) * (reduced ? 0 : 0.05),
        Math.sin(angle) * liveRadius * 0.32
      );
      groupRef.current.scale.setScalar(eased);
    }
    if (meshRef.current) {
      const target = eased * (hovered ? 1 : 0.94);
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity ?? 0, target, 0.15);
    }
  });

  return (
    <group ref={groupRef}>
      <Billboard>
        <DreiImage
          ref={meshRef}
          url={story.photo}
          radius={0.07}
          scale={hovered ? 0.62 : 0.5}
          grayscale={hovered ? 0 : 0.4}
          transparent
          opacity={1}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(story);
          }}
        />
      </Billboard>
    </group>
  );
}

function Scene({ stories, onSelectStory, reduced, introRef }) {
  const { viewport } = useThree();
  // The orbit's world-space width is fixed, but the canvas isn't — on a
  // narrow/mobile viewport the ring needs to shrink or the outer cards clip
  // past the edge of the frame.
  const radiusScale = THREE.MathUtils.clamp(viewport.width / 8.5, 0.42, 1);

  useFrame((state) => {
    const targetX = reduced ? 0 : state.pointer.x * 0.5;
    const targetY = 1.25 + (reduced ? 0 : state.pointer.y * 0.16);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.035);
    state.camera.lookAt(0, 0.25, 0);
  });

  const orbitConfig = useMemo(
    () =>
      stories.map((story, i) => ({
        story,
        angleOffset: (i / stories.length) * Math.PI * 2,
        radius: (3.6 + (((i * 47) % 10) / 10) * 1.7) * radiusScale,
        height: -0.05 + (((i * 83) % 10) / 10) * 0.3,
        speed: 0.045 + (i % 3) * 0.012,
      })),
    [stories, radiusScale]
  );

  return (
    <>
      <ambientLight intensity={0.16} color="#3a4a66" />
      <Stars radius={40} depth={18} count={600} factor={2} saturation={0} fade speed={reduced ? 0 : 0.35} />
      <FireCore reduced={reduced} introRef={introRef} />
      <Embers reduced={reduced} />
      {orbitConfig.map((cfg, i) => (
        <OrbitCard key={cfg.story.slug} index={i} count={orbitConfig.length} reduced={reduced} introRef={introRef} onSelect={onSelectStory} {...cfg} />
      ))}
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.2} luminanceSmoothing={0.4} intensity={0.9} />
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Experimental: a real-time 3D campfire with the community's stories
// orbiting it. Self-contained — remove the <CommunityBonfire /> line in
// Stories.jsx to take it out, nothing else depends on this file.
// ─────────────────────────────────────────────────────────────────────────
export default function CommunityBonfire({ onSelectStory }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [canRender3D] = useState(() => typeof window !== "undefined" && supportsWebGL());
  const reduced = usePrefersReducedMotion();
  const introRef = useRef({ t: 0 });
  const introStarted = useRef(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || introStarted.current) return;
    introStarted.current = true;
    gsap.to(introRef.current, { t: 1, duration: reduced ? 0.6 : 2.4, ease: "power3.out" });
  }, [visible, reduced]);

  return (
    <section className="cfire" ref={sectionRef}>
      <div className="cfire__head">
        <p>The community fire</p>
        <h2>Every story here keeps this fire lit.</h2>
        <span>Drift around the flame, and click anyone's photo to hear how they got here.</span>
      </div>
      <div className="cfire__stage">
        {visible && canRender3D ? (
          <SceneErrorBoundary label="CommunityBonfire" fallback={<div className="cfire__fallback" />}>
            <Canvas camera={{ position: [0, 1.25, 6.4], fov: 36 }} dpr={[1, 1.75]} gl={{ antialias: false, alpha: true }}>
              <Suspense fallback={null}>
                <Scene stories={PUBLIC_STORIES} onSelectStory={onSelectStory} reduced={reduced} introRef={introRef} />
              </Suspense>
            </Canvas>
          </SceneErrorBoundary>
        ) : (
          <div className="cfire__fallback" />
        )}
      </div>
    </section>
  );
}
