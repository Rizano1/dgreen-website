"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function SyncScrollTrigger() {
  useLenis(ScrollTrigger.update);
  return null;
}

// Lenis drives the scroll, GSAP's ticker drives Lenis, so ScrollTrigger
// scrubs stay in lockstep with the smoothed position.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const tick = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.09, anchors: true }}>
      <SyncScrollTrigger />
      {children}
    </ReactLenis>
  );
}
