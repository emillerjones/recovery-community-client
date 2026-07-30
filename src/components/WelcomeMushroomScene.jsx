import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import memberMushroom from "../assets/welcome/member-mushroom.png";

const ROOT_COLOR = "#d8b66d";

function smoothstep(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function easeOutBack(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function makeRoot(points) {
  return new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
}

function RootPath({ curve, delay, duration, reduced }) {
  const lineRef = useRef(null);
  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
    next.setDrawRange(0, reduced ? 91 : 0);
    return next;
  }, [curve, reduced]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (reduced || !lineRef.current) return;
    const progress = smoothstep((clock.elapsedTime - delay) / duration);
    geometry.setDrawRange(0, Math.max(0, Math.round(progress * 91)));
  });

  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={ROOT_COLOR} transparent opacity={0.72} toneMapped={false} />
      </line>
      <line geometry={geometry}>
        <lineBasicMaterial color="#fff0c0" transparent opacity={0.14} toneMapped={false} />
      </line>
    </group>
  );
}

function TravellingLight({ curve, reduced }) {
  const pulseRef = useRef(null);

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    if (reduced) {
      pulseRef.current.visible = false;
      return;
    }

    const progress = (clock.elapsedTime - 0.55) / 1.9;
    pulseRef.current.visible = progress >= 0 && progress <= 1;
    if (!pulseRef.current.visible) return;

    pulseRef.current.position.copy(curve.getPoint(smoothstep(progress)));
    const size = 0.065 + Math.sin(progress * Math.PI) * 0.055;
    pulseRef.current.scale.setScalar(size);
  });

  return (
    <mesh ref={pulseRef} visible={false}>
      <sphereGeometry args={[1, 14, 14]} />
      <meshBasicMaterial color="#fff2c6" toneMapped={false} />
    </mesh>
  );
}

function MemberMushroom({ reduced, onReady }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const readyRef = useRef(false);
  const texture = useTexture(memberMushroom);

  useEffect(() => {
    if (reduced && !readyRef.current) {
      readyRef.current = true;
      onReady();
    }
  }, [onReady, reduced]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialRef.current || reduced) return;
    const elapsed = clock.elapsedTime;
    const progress = THREE.MathUtils.clamp((elapsed - 2.05) / 1.25, 0, 1);
    const growth = easeOutBack(progress);

    groupRef.current.visible = progress > 0;
    groupRef.current.scale.set(0.58 + growth * 0.42, Math.max(0.001, growth), 1);
    groupRef.current.position.y = -1.83 + (progress === 1 ? Math.sin(elapsed * 0.72) * 0.012 : 0);
    materialRef.current.opacity = smoothstep(progress);

    if (progress === 1 && !readyRef.current) {
      readyRef.current = true;
      onReady();
    }
  });

  return (
    <group
      ref={groupRef}
      visible={reduced}
      position={[0, -1.83, 0.1]}
      scale={reduced ? 1 : 0.001}
    >
      <sprite position={[0, 0.72, 0]} scale={[0.66, 1.48, 1]}>
        <spriteMaterial ref={materialRef} map={texture} color="#d6c29b" transparent opacity={reduced ? 1 : 0} alphaTest={0.015} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

function GroveWorld({ reduced, onReady }) {
  const roots = useMemo(() => [
    makeRoot([[-5.2, -1.95, 0.7], [-3.7, -2.02, 0.45], [-2.25, -2.2, 0.25], [-1.05, -2.1, 0.12], [0, -2.08, 0.1]]),
    makeRoot([[4.8, -2.03, 0.75], [3.35, -2.18, 0.48], [2.1, -2.02, 0.28], [1.05, -2.16, 0.16], [0, -2.08, 0.1]]),
    makeRoot([[-3.4, -2.42, 0.42], [-2.1, -2.28, 0.3], [-1.15, -2.3, 0.18], [0, -2.08, 0.1]]),
    makeRoot([[3.6, -2.38, 0.5], [2.45, -2.32, 0.31], [1.35, -2.25, 0.2], [0, -2.08, 0.1]]),
    makeRoot([[-1.7, -2.52, 0.36], [-0.95, -2.3, 0.2], [0, -2.08, 0.1]]),
    makeRoot([[1.7, -2.5, 0.35], [0.9, -2.3, 0.2], [0, -2.08, 0.1]]),
  ], []);

  return (
    <>
      <ambientLight intensity={0.24} />
      <directionalLight color="#ffe5b2" intensity={1.4} position={[-3, 5, 5]} />
      <group position={[0, 0.25, 0]}>
        {roots.map((curve, index) => (
          <RootPath
            key={index}
            curve={curve}
            delay={0.3 + index * 0.11}
            duration={1.9 + index * 0.08}
            reduced={reduced}
          />
        ))}
        <TravellingLight curve={roots[0]} reduced={reduced} />
      </group>
      <MemberMushroom reduced={reduced} onReady={onReady} />
    </>
  );
}

export default function WelcomeMushroomScene({ reduced, onReady }) {
  return (
    <Canvas
      className="welcome-grove-canvas"
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <GroveWorld reduced={reduced} onReady={onReady} />
    </Canvas>
  );
}
