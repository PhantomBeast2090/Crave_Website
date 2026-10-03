"use client";
// Lazy 3D sticker cluster: coral torus + citrus marble + lime chopstick.
// DPR capped, demand frameloop, pauses offscreen, static fallback for
// reduced-motion / no-WebGL. Decorative only (aria-hidden).

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Floaters({ mouse }: { mouse: MutableRefObject<{ x: number; y: number }> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (!g.current) return;
    g.current.rotation.y += dt * 0.25;
    g.current.rotation.x = mouse.current.y * 0.35 + Math.sin(t * 0.4) * 0.08;
    g.current.position.x = mouse.current.x * 0.25;
    g.current.children.forEach((c, i) => {
      c.position.y += Math.sin(t * 1.2 + i * 1.7) * dt * 0.25;
    });
  });
  return (
    <group ref={g}>
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.65, 0.24, 24, 48]} />
        <meshStandardMaterial color="#FF4D2E" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0.85, -0.45, 0.2]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FF9E0B" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[-0.8, 0.5, -0.1]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.09, 0.09, 1.1, 20]} />
        <meshStandardMaterial color="#A8E10C" roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Hero3D() {
  const [active, setActive] = useState(false);
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    // Subscription callback for an external system (IntersectionObserver).
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current = { x: ((ev.clientX - r.left) / r.width - 0.5) * 2, y: ((ev.clientY - r.top) / r.height - 0.5) * 2 };
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("pointermove", move); };
  }, [reduced]);

  if (reduced || failed) {
    return (
      <div className="w-full aspect-square grid place-items-center" aria-hidden>
        <span className="font-display font-bold text-7xl text-accent">✳</span>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="w-full aspect-square" aria-hidden>
      {active && (
        <Canvas
          dpr={[1, 2]}
          frameloop="always"
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          onCreated={({ gl }) => {
            const lose = () => setFailed(true);
            gl.domElement.addEventListener("webglcontextlost", lose, { once: true });
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <Floaters mouse={mouse} />
        </Canvas>
      )}
    </div>
  );
}
