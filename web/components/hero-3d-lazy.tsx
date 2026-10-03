"use client";
import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("@/components/hero-3d").then((m) => m.Hero3D), {
  ssr: false,
  loading: () => <div className="w-full aspect-square" aria-hidden />,
});

export function Hero3DLazy() {
  return <Hero3D />;
}
