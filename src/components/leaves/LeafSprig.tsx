import { useId } from "react";
import { add, poly, rng, round1, shade, spine, type Pt } from "./geometry";

type Props = {
  seed?: number;
  bend?: number;
  /** leaflets per side */
  leaflets?: number;
  dim?: number;
};

const L = 100;
const FIRST = 0.2; // bare stem below the first leaflet
const LAST = 0.8; // last side leaflet; the terminal leaflet sits at the branch end
const BRANCH_END = 0.86;

type Leaflet = { shape: string; lit: string; vein: string; edge: string; from: Pt; to: Pt };

// A thin branch with alternating leaflets. Each leaflet is pointed at both ends,
// so it meets the branch at a single point the way a real leaflet does.
export function LeafSprig({ seed = 1, bend = 0.08, leaflets = 5, dim = 0 }: Props) {
  const id = useId().replace(/:/g, "");
  const r = rng(seed);
  const { at, normal } = spine(L, bend);
  const tangent = (t: number): Pt => {
    const n = normal(t);
    return [-n[1], n[0]];
  };

  function leaflet(base: Pt, dir: Pt, toward: Pt, len: number, width: number, sign: number): Leaflet {
    // centreline curves gently toward the branch tip
    const ctrl: Pt = [base[0] + dir[0] * len * 0.5 + toward[0] * len * 0.12, base[1] + dir[1] * len * 0.5 + toward[1] * len * 0.12];
    const end: Pt = [base[0] + dir[0] * len + toward[0] * len * 0.12, base[1] + dir[1] * len + toward[1] * len * 0.12];
    const N = 30;
    const a: Pt[] = [];
    const b: Pt[] = [];
    const c: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const p: Pt = [
        (1 - s) * (1 - s) * base[0] + 2 * (1 - s) * s * ctrl[0] + s * s * end[0],
        (1 - s) * (1 - s) * base[1] + 2 * (1 - s) * s * ctrl[1] + s * s * end[1],
      ];
      const d: Pt = [
        2 * (1 - s) * (ctrl[0] - base[0]) + 2 * s * (end[0] - ctrl[0]),
        2 * (1 - s) * (ctrl[1] - base[1]) + 2 * s * (end[1] - ctrl[1]),
      ];
      const dl = Math.hypot(d[0], d[1]);
      const n: Pt = [-d[1] / dl, d[0] / dl];
      // zero width at both ends: pointed base and pointed tip, widest just below the middle
      const h = width * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.9);
      a.push(add(p, n, h));
      b.push(add(p, n, -h));
      c.push(p);
    }
    const litSide = sign > 0 ? a : b;
    const outline = [...a, ...b.slice().reverse()];
    return {
      shape: poly(outline),
      lit: poly([...c, ...litSide.slice().reverse()]),
      vein: poly(c, false),
      edge: poly(outline),
      from: base,
      to: end,
    };
  }

  const side: Leaflet[] = [];
  const step = (LAST - FIRST) / (leaflets - 0.5);
  for (const sign of [1, -1] as const) {
    for (let j = 0; j < leaflets; j++) {
      // the two sides alternate along the branch
      const t = FIRST + j * step + (sign < 0 ? step / 2 : 0) + (r() - 0.5) * 0.015;
      const k = (t - FIRST) / (LAST - FIRST);
      const len = 36 * (1 - 0.3 * k) * (0.9 + r() * 0.2);
      const ang = ((60 - 20 * k + (r() - 0.5) * 8) * Math.PI) / 180;
      const tan = tangent(t);
      const n = normal(t);
      const dir: Pt = [
        Math.cos(ang) * tan[0] + Math.sin(ang) * sign * n[0],
        Math.cos(ang) * tan[1] + Math.sin(ang) * sign * n[1],
      ];
      side.push(leaflet(at(t), dir, tan, len, len * (0.15 + r() * 0.03), sign));
    }
  }
  const terminal = leaflet(at(BRANCH_END), tangent(BRANCH_END), tangent(BRANCH_END), 28, 4.6, 1);
  const all = [terminal, ...side];

  // tapered branch
  const bl: Pt[] = [];
  const br: Pt[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * BRANCH_END;
    const w = 0.9 - 0.55 * (t / BRANCH_END);
    bl.push(add(at(t), normal(t), w));
    br.push(add(at(t), normal(t), -w));
  }
  // bl runs up the left edge, br comes back down the right, plus a short stalk below the base
  const branch = poly([[-0.9, 30], ...bl, ...br.reverse(), [0.9, 30]]);

  const c = {
    lit: shade("#76a64e", dim),
    mid: shade("#2f6b34", dim),
    deep: shade("#173d25", dim),
    gloss: shade("#b6d27a", dim),
    vein: shade("#c8dd95", dim),
    stem: shade("#7d9a55", dim),
  };
  const g = `${id}s`;

  return (
    <g>
      <defs>
        {/* each leaflet is shaded from its base to its tip so overlapping leaflets stay distinct */}
        {all.map((lf, i) => (
          <linearGradient
            key={i}
            id={`${g}${i}`}
            gradientUnits="userSpaceOnUse"
            x1={round1(lf.from[0])}
            y1={round1(lf.from[1])}
            x2={round1(lf.to[0])}
            y2={round1(lf.to[1])}
          >
            <stop offset="0" stopColor={c.mid} />
            <stop offset="1" stopColor={c.lit} />
          </linearGradient>
        ))}
      </defs>
      {all.map((lf, i) => (
        <g key={i}>
          <path d={lf.shape} fill={`url(#${g}${i})`} />
          <path d={lf.lit} fill={c.gloss} opacity="0.2" />
          <path d={lf.edge} fill="none" stroke={c.deep} strokeWidth="0.4" strokeOpacity="0.5" />
          <path d={lf.vein} fill="none" stroke={c.vein} strokeWidth="0.45" strokeOpacity="0.6" strokeLinecap="round" />
        </g>
      ))}
      <path d={branch} fill={c.stem} />
    </g>
  );
}
