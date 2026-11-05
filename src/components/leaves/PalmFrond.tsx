import { add, poly, rng, shade, spine, type Pt } from "./geometry";

type Props = {
  seed?: number;
  bend?: number;
  /** leaflets per side */
  count?: number;
  /** how much the leaflets hang toward the frond's left (+) or right (-) */
  droop?: number;
  dim?: number;
};

const L = 100;

// Arching palm frond with folded, drooping leaflets.
export function PalmFrond({ seed = 1, bend = 0.25, count = 30, droop = 1, dim = 0 }: Props) {
  const r = rng(seed);
  const { at, normal } = spine(L, bend);
  const tangent = (t: number): Pt => {
    const n = normal(t);
    return [-n[1], n[0]];
  };

  const c = {
    top: shade("#5b8a45", dim),
    under: shade("#1f4128", dim),
    rib: shade("#8fae63", dim),
  };

  const leaflets: { top: string; under: string; rib: string }[] = [];

  for (const sign of [1, -1] as const) {
    for (let i = 0; i < count; i++) {
      const t = 0.06 + (i / count) * 0.92 + (r() - 0.5) * 0.012;
      const len = 42 * (1 - 0.62 * t) * Math.min(1, 0.35 + t * 6) * (0.88 + r() * 0.24);
      const ang = ((52 - 26 * t + (r() - 0.5) * 8) * Math.PI) / 180;
      const tan = tangent(t);
      const n = normal(t);
      const dir: Pt = [
        Math.cos(ang) * tan[0] + Math.sin(ang) * sign * n[0],
        Math.cos(ang) * tan[1] + Math.sin(ang) * sign * n[1],
      ];
      const base = at(t);
      // leaflets sag toward one side of the frond
      const sag = len * (0.25 + r() * 0.15) * droop;
      const ctrl: Pt = add([base[0] + dir[0] * len * 0.55, base[1] + dir[1] * len * 0.55], n, sag * 0.4);
      const end: Pt = add([base[0] + dir[0] * len, base[1] + dir[1] * len], n, sag);
      const w = 1.7 + r() * 0.6;
      const A: Pt[] = [];
      const B: Pt[] = [];
      const C: Pt[] = [];
      const N = 14;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        const p: Pt = [
          (1 - s) * (1 - s) * base[0] + 2 * (1 - s) * s * ctrl[0] + s * s * end[0],
          (1 - s) * (1 - s) * base[1] + 2 * (1 - s) * s * ctrl[1] + s * s * end[1],
        ];
        const d: Pt = [
          2 * (1 - s) * (ctrl[0] - base[0]) + 2 * s * (end[0] - ctrl[0]),
          2 * (1 - s) * (ctrl[1] - base[1]) + 2 * s * (end[1] - ctrl[1]),
        ];
        const dl = Math.hypot(d[0], d[1]);
        const nn: Pt = [-d[1] / dl, d[0] / dl];
        const h = w * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.55)), 0.8);
        A.push(add(p, nn, h));
        B.push(add(p, nn, -h));
        C.push(p);
      }
      // folded leaflet: one half catches light, the other is in shade
      leaflets.push({ top: poly([...C, ...A.reverse()]), under: poly([...C, ...B.reverse()]), rib: poly(C, false) });
    }
  }

  const rachis = poly(Array.from({ length: 31 }, (_, i) => at(i / 30)), false);

  return (
    <g>
      <path d="M0 0 L0 30" stroke={c.rib} strokeWidth="1.4" strokeLinecap="round" />
      {/* each leaflet paints its own rib, so overlapping leaflets hide the ones behind */}
      {leaflets.map((l, i) => (
        <g key={i}>
          <path d={l.under} fill={c.under} />
          <path d={l.top} fill={c.top} />
          <path d={l.rib} fill="none" stroke={c.rib} strokeWidth="0.3" strokeOpacity="0.6" />
        </g>
      ))}
      <path d={rachis} fill="none" stroke={c.rib} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}
