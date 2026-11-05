// Shared helpers for the procedural leaf illustrations.
// Every leaf is drawn in its own local space: stem at (0, 0), tip at (0, -100).

export type Pt = [number, number];

/** Deterministic RNG so server and client render identical paths. */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round to 0.1 so server and browser print identical numbers (avoids hydration mismatches). */
export const round1 = (n: number) => Math.round(n * 10) / 10;
const f = (n: number) => round1(n).toString();

/** Straight-segment path through dense points (closed). */
export function poly(pts: Pt[], close = true) {
  return pts.map((p, i) => `${i ? "L" : "M"}${f(p[0])} ${f(p[1])}`).join("") + (close ? "Z" : "");
}

export const quad = (a: Pt, c: Pt, b: Pt) =>
  `M${f(a[0])} ${f(a[1])}Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`;

export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Mix a hex colour toward black (amount > 0) or white (amount < 0). */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount >= 0 ? c * (1 - amount) : c + (255 - c) * -amount),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** A curved spine: point + unit normal (pointing to the leaf's left) at t in [0, 1]. */
export function spine(length: number, bend: number) {
  const at = (t: number): Pt => [bend * length * t * t, -length * t];
  const normal = (t: number): Pt => {
    const tx = 2 * bend * length * t;
    const ty = -length;
    const l = Math.hypot(tx, ty);
    return [ty / l, -tx / l];
  };
  return { at, normal };
}

export const add = (p: Pt, n: Pt, d: number): Pt => [p[0] + n[0] * d, p[1] + n[1] * d];
