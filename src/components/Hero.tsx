"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf } from "./leaves/Leaf";
import { LogoMark, Wordmark } from "./brand/Logo";
import { backLeaves, frontLeaves, portraitBackLeaves, portraitFrontLeaves } from "@/data/heroLeaves";
import { onStableResize } from "@/lib/viewport";
import { gsap, useGSAP } from "@/lib/gsap";

// the sides run to y 1600 so the opening reaches the bottom of tall phone screens too
const ARCH_INNER = "M580 1600 V470 C580 320 690 220 800 140 C910 220 1020 320 1020 470 V1600";
const ARCH_OUTER = "M556 1600 V470 C556 306 676 196 800 112 C924 196 1044 306 1044 470 V1600";
const LANDSCAPE = "0 0 1600 1000";
const PORTRAIT = "380 -250 840 1500";

/** ease that turns a linear scale tween into a constant-speed "walk forward" zoom */
const walk = (max: number) => (p: number) => (Math.pow(max, p) - 1) / (max - 1);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [viewBox, setViewBox] = useState(LANDSCAPE);
  // leaves live in a 1600×1000 scene scaled to cover the screen like the wall's viewBox
  const [sceneScale, setSceneScale] = useState(1);

  useEffect(
    () =>
      onStableResize(() => {
        const portrait = innerWidth / innerHeight < 0.9;
        setViewBox(portrait ? PORTRAIT : LANDSCAPE);
        setSceneScale(portrait ? Math.max(innerWidth / 840, innerHeight / 1500) : Math.max(innerWidth / 1600, innerHeight / 1000));
      }),
    [],
  );
  const portrait = viewBox === PORTRAIT;

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=170%",
          pin: true,
          scrub: true,
        },
      });
      tl.to(".hero-wall", { scale: 9, ease: walk(9), force3D: false, duration: 1 }, 0)
        .to(".leaves-back", { scale: 6, ease: walk(6), duration: 1 }, 0)
        .to(".leaves-front", { scale: 14, ease: walk(14), duration: 1 }, 0)
        .to(".hero-title", { opacity: 0, scale: 1.35, filter: "blur(6px)", duration: 0.4 }, 0)
        .to(".scroll-cue", { opacity: 0, duration: 0.08 }, 0)
        .to(".leaves-front", { opacity: 0, duration: 0.35 }, 0.35)
        .to(".leaves-back", { opacity: 0, duration: 0.35 }, 0.5)
        .to(".hero-wall", { opacity: 0, duration: 0.15 }, 0.85);

      // gentle intro on load
      gsap.from(".leaves-front .leaf-intro", { scale: 1.12, opacity: 0, duration: 2.2, ease: "power3.out" });
      gsap.from(".leaves-back .leaf-intro", { scale: 1.06, opacity: 0, duration: 2.4, ease: "power3.out", delay: 0.1 });
      gsap.from(".hero-title > *", { y: 24, opacity: 0, duration: 1.4, stagger: 0.12, ease: "power3.out", delay: 0.5 });
    },
    { scope: root },
  );

  // Each leaf swings around its own stem, picking a fresh random angle and pace
  // every swing, so the plants never fall into a shared rhythm.
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { random } = gsap.utils;
      // only CSS transforms on each leaf's own layer: no repainting while swaying
      const leaves = gsap.utils.toArray<HTMLElement>(".leaf-sway");
      leaves.forEach((el) => {
        const reach = random(1, 2.8); // how far this particular leaf tends to move
        const swing = () =>
          gsap.to(el, {
            rotation: random(-reach, reach),
            duration: random(1.6, 4.2),
            delay: random(0, 0.6),
            ease: "sine.inOut",
            onComplete: swing,
          });
        gsap.delayedCall(random(0, 2), swing);
      });
      return () => gsap.killTweensOf(leaves);
    },
    // phones swap in a different set of leaves, which need their own sway
    { scope: root, dependencies: [portrait], revertOnUpdate: true },
  );

  const scene = (children: React.ReactNode, className: string) => (
    <div className={`hero-layer ${className}`}>
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {children}
      </svg>
    </div>
  );

  const leafLayer = (children: React.ReactNode, className: string) => (
    <div className={`hero-layer leaves ${className}`} aria-hidden="true">
      <div className="leaf-scene" style={{ "--scene-scale": sceneScale } as React.CSSProperties}>
        {/* separate wrapper so the intro tween never touches the scene's scale */}
        <div className="leaf-intro">{children}</div>
      </div>
    </div>
  );

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-inside">
        <div className="hero-glow" />
        <div className={`hero-title ${portrait ? "portrait" : ""}`}>
          <LogoMark className="hero-mark" />
          <h1>
            <Wordmark className="hero-wordmark" tagline />
          </h1>
          <p className="tagline">Pause · Relax · Linger</p>
        </div>
      </div>

      {scene(
        <>
          <defs>
            <radialGradient id="wallShade" cx="50%" cy="55%" r="70%">
              <stop offset="0" stopColor="#1d3d37" />
              <stop offset="0.55" stopColor="#132b27" />
              <stop offset="1" stopColor="#0a1816" />
            </radialGradient>
            <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e2c98f" />
              <stop offset="1" stopColor="#9c7d45" />
            </linearGradient>
            <radialGradient id="archLight" cx="800" cy="520" r="520" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f6e9c4" stopOpacity="0.16" />
              <stop offset="1" stopColor="#f6e9c4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path fillRule="evenodd" fill="url(#wallShade)" d={`M-400 -400 H2000 V1700 H-400Z ${ARCH_INNER}Z`} />
          <path fillRule="evenodd" fill="url(#archLight)" d={`M-400 -400 H2000 V1700 H-400Z ${ARCH_INNER}Z`} />
          <path d={ARCH_INNER} stroke="url(#brass)" strokeWidth="3" fill="none" />
          <path d={ARCH_OUTER} stroke="url(#brass)" strokeWidth="1.2" fill="none" opacity="0.7" />
        </>,
        "hero-wall",
      )}

      {leafLayer((portrait ? portraitBackLeaves : backLeaves).map((l, i) => <Leaf key={`${portrait}${i}`} spec={l} dim={0.38} />), "leaves-back")}
      {leafLayer((portrait ? portraitFrontLeaves : frontLeaves).map((l, i) => <Leaf key={`${portrait}${i}`} spec={l} />), "leaves-front")}

      <div className="scroll-cue">
        <span>Step inside</span>
        <i />
      </div>
    </section>
  );
}
