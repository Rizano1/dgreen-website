"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CHAPTERS, MENU_PAGES, menuPageSrc } from "@/data/site";
import { BendingPage, poseBendingPage } from "./BendingPage";
import { onStableResize } from "@/lib/viewport";

type LeafPages = { front: number; back: number | null };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const RATIO = 595.276 / 841.89; // A4 page
const SNAP = 0.015;

export function MenuBook() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const spine = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const meter = useRef<HTMLElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const leafEls = useRef<(HTMLDivElement | null)[]>([]);
  const bender = useRef<HTMLDivElement>(null);
  const shadeL = useRef<HTMLDivElement>(null);
  const shadeR = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const lenis = useLenis();

  // phones get one page per turn, wider screens a full spread
  const [single, setSingle] = useState(false);
  const [pageW, setPageW] = useState(300);
  const [loadedUpTo, setLoadedUpTo] = useState(3);
  const [active, setActive] = useState(0);

  const leaves: LeafPages[] = useMemo(
    () =>
      single
        ? Array.from({ length: MENU_PAGES }, (_, k) => ({ front: k + 1, back: null }))
        : Array.from({ length: MENU_PAGES / 2 }, (_, k) => ({ front: 2 * k + 1, back: 2 * k + 2 })),
    [single],
  );
  const n = leaves.length;
  const seg = () => innerHeight * (single ? 0.45 : 0.6);

  useEffect(
    () =>
      onStableResize(() => {
        const isSingle = innerWidth < 760 || innerWidth / innerHeight < 0.8;
        setSingle(isSingle);
        const sr = stage.current!.getBoundingClientRect();
        const stageW = Math.min(sr.width, innerWidth - 32);
        const availW = (isSingle ? stageW * 0.82 : stageW * 0.92) / (isSingle ? 1 : 2);
        setPageW(Math.floor(Math.min(availW, sr.height * 0.94 * RATIO)));
      }),
    [],
  );

  // load every page once the first spreads are on screen
  useEffect(() => {
    const t = setTimeout(() => setLoadedUpTo(Infinity), 2500);
    return () => clearTimeout(t);
  }, []);

  useGSAP(
    () => {
      const render = (progress: number) => {
        const p = clamp(progress * (n + 0.6) - 0.3, 0, n);
        let tFirst = 0;
        let tLast = 0;
        let turning = -1;
        let turnT = 0;
        leafEls.current.forEach((el, i) => {
          if (!el) return;
          // snap the first and last sliver of a turn to flat: resting pages are never
          // left a fraction of a degree off, which made the browser redraw them softer
          const raw = easeInOut(clamp((p - i - 0.2) / 0.6));
          const t = raw < SNAP ? 0 : raw > 1 - SNAP ? 1 : raw;
          if (i === 0) tFirst = t;
          if (i === n - 1) tLast = t;
          if (turning < 0 && t > 0 && t < 1) {
            // the bending page stands in for this leaf while it turns
            turning = i;
            turnT = t;
            el.style.visibility = "hidden";
            return;
          }
          el.style.transform = `rotateY(${-180 * t}deg)`;
          el.style.zIndex = String(t > 0 && t < 1 ? 2 * n : t >= 0.5 ? n + i : n - i);
          const shade = Math.sin(t * Math.PI) * 0.28;
          el.style.setProperty("--shade-front", String(t < 0.5 ? shade : 0));
          el.style.setProperty("--shade-back", String(t >= 0.5 ? shade : 0));
          // fade the faces, not the leaf: opacity on a 3D element flattens it and breaks backface hiding
          if (single) {
            el.style.setProperty("--fade", String(1 - clamp((t - 0.55) / 0.4)));
            el.style.visibility = t >= 1 ? "hidden" : "visible";
          } else {
            el.style.setProperty("--fade", "1");
            el.style.visibility = "visible";
          }
        });

        const bend = bender.current!;
        if (turning >= 0) {
          const pages = leaves[turning];
          const key = `${pages.front}/${pages.back}`;
          if (bend.dataset.pages !== key) {
            bend.dataset.pages = key;
            bend.style.setProperty("--front", `url(${menuPageSrc(pages.front)})`);
            bend.style.setProperty("--back", pages.back ? `url(${menuPageSrc(pages.back)})` : "none");
          }
          bend.style.visibility = "visible";
          bend.style.zIndex = String(3 * n);
          // covers are stiff card, inner pages are soft paper
          const cover = turning === 0 || turning === n - 1;
          poseBendingPage(bend, { t: turnT, maxCurl: cover ? 14 : 58 });
          bend.style.setProperty("--fade", single ? String(1 - clamp((turnT - 0.55) / 0.4)) : "1");
          // the lifting page throws a shadow on the page it is about to cover
          const lift = Math.sin(Math.PI * turnT);
          shadeR.current!.style.opacity = String(turnT < 0.5 ? lift * 0.55 : 0);
          shadeL.current!.style.opacity = String(turnT >= 0.5 ? lift * 0.55 : 0);
        } else {
          bend.style.visibility = "hidden";
          shadeR.current!.style.opacity = "0";
          shadeL.current!.style.opacity = "0";
        }

        if (!single) {
          // centre the closed covers, slide to a full spread once opened
          const shift = (-(1 - tFirst) + tLast) * (pageW / 2);
          book.current!.style.transform = `translateX(${shift}px)`;
          shadow.current!.style.left = `${(1 - tFirst) * 50}%`;
          shadow.current!.style.right = `${tLast * 50}%`;
          spine.current!.style.opacity = String(Math.min(tFirst, 1 - tLast));
        } else {
          book.current!.style.transform = "";
          shadow.current!.style.left = "0";
          shadow.current!.style.right = "0";
        }

        const rest = Math.round(p);
        const rightPage = single ? Math.min(rest + 1, MENU_PAGES) : 2 * rest + 1;
        label.current!.textContent = single
          ? rightPage === 1
            ? "Cover"
            : `Page ${rightPage} of ${MENU_PAGES}`
          : rest === 0
            ? "Cover"
            : rest >= n
              ? "Back cover"
              : `Pages ${2 * rest} – ${2 * rest + 1}`;
        meter.current!.style.width = `${(p / n) * 100}%`;
        setLoadedUpTo((v) => Math.max(v, Math.ceil(p) + 3));
        let a = 0;
        CHAPTERS.forEach(([, page], i) => {
          if (page <= rightPage) a = i;
        });
        setActive(a);
      };

      trigger.current = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: () => `+=${(n + 0.6) * seg()}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });
      render(0);
    },
    { scope: section, dependencies: [n, single, pageW, leaves], revertOnUpdate: true },
  );

  // keep the active chapter chip in view without moving the page
  useEffect(() => {
    const row = chips.current;
    const chip = row?.children[active] as HTMLElement | undefined;
    if (row && chip) row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  function goToPage(page: number) {
    const st = trigger.current;
    if (!st) return;
    const rest = single ? page - 1 : Math.floor(page / 2);
    lenis?.scrollTo(st.start + (rest + 0.3) * seg() + 1, { duration: 1.8 });
  }

  const img = (page: number, index: number) =>
    index <= loadedUpTo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={menuPageSrc(page)} alt={`D'Green menu, page ${page}`} draggable={false} decoding="async" />
    ) : null;

  return (
    <section className="menu" id="menu" ref={section}>
      <div className="menu-head">
        <p className="eyebrow">Menu 2025</p>
        <h2>Turn the pages</h2>
      </div>

      <div className="book-stage" ref={stage}>
        <div
          ref={book}
          className={`book ${single ? "single" : ""}`}
          style={
            {
              "--page-w": `${pageW}px`,
              "--page-h": `${Math.floor(pageW / RATIO)}px`,
              perspective: `${pageW * 3.4}px`,
            } as React.CSSProperties
          }
          aria-label="D'Green menu book"
        >
          <div className="book-shadow" ref={shadow} />
          <div className="book-spine" ref={spine} />
          <div className="turn-shade left" ref={shadeL} style={{ zIndex: 3 * n - 1 }} />
          <div className="turn-shade right" ref={shadeR} style={{ zIndex: 3 * n - 1 }} />
          <BendingPage ref={bender} />
          {leaves.map((l, i) => (
            <div
              key={`${single}-${i}`}
              className="leaf"
              ref={(el) => {
                leafEls.current[i] = el;
              }}
            >
              <div className="face front">{img(l.front, i)}</div>
              <div className={`face back ${l.back ? "" : "blank"}`}>{l.back ? img(l.back, i) : null}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="menu-foot">
        <div className="chapters" ref={chips} role="navigation" aria-label="Menu chapters">
          {CHAPTERS.map(([name, page], i) => (
            <button key={name} type="button" className={i === active ? "active" : ""} onClick={() => goToPage(page)}>
              {name}
            </button>
          ))}
        </div>
        <div className="page-meter">
          <span ref={label}>Cover</span>
          <div className="meter">
            <i ref={meter} />
          </div>
        </div>
      </div>
    </section>
  );
}
