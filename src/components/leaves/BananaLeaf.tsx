import { useId } from "react";
import { add, lerp, poly, quad, rng, round1, shade, spine, type Pt } from "./geometry";

type Props = {
  seed?: number;
  /** half-width of the blade relative to its length */
  width?: number;
  /** sideways curl of the midrib, -0.3 … 0.3 */
  bend?: number;
  /** number of wind tears along each edge */
  tears?: number;
  /** 0 = lit, 1 = black. Used to push leaves into the background */
  dim?: number;
};

const L = 100;
const STEPS = 90;

// Large banana / bird-of-paradise leaf with dense parallel veins and a
// backlit glow, after the D'Green "Ngariung" artwork.
export function BananaLeaf({ seed = 1, width = 0.2, bend = 0.12, tears = 3, dim = 0 }: Props) {
  const id = useId().replace(/:/g, "");
  const r = rng(seed);
  const { at, normal } = spine(L, bend);
  const W = width * L;
  const veinSlant = 0.07; // veins run toward the tip

  // long oblong blade: rounded base, nearly parallel sides, blunt tip
  const half = (t: number) =>
    W * Math.sin((Math.PI / 2) * Math.min(1, t / 0.16)) * Math.pow(Math.min(1, (1 - t) / 0.22), 0.55);

  function side(sign: 1 | -1) {
    const wobble = r() * 6;
    const edge = (t: number): Pt => {
      const w = half(t) * (1 + 0.025 * Math.sin(t * 40 + wobble));
      return add(at(t), normal(t), sign * w);
    };
    // pick tear positions, each one splits the blade along a vein
    const tearAt = Array.from({ length: tears }, () => 0.22 + r() * 0.6).sort();
    const pts: Pt[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      pts.push(edge(t));
      for (const tt of tearAt) {
        if (t < tt && (i + 1) / STEPS >= tt) {
          const start = tt - veinSlant;
          const inner = lerp(at(start), edge(tt), 0.12 + r() * 0.3);
          const gap = 0.006 + r() * 0.01;
          pts.push(edge(tt - gap), lerp(inner, edge(tt - gap), 0.04), inner, edge(tt + gap));
        }
      }
    }
    const veins: string[] = [];
    const ribs: string[] = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      const t = 0.02 + (i / count) * 0.94;
      const a = at(t);
      const b = edge(Math.min(t + veinSlant, 0.995));
      const c = add(lerp(a, b, 0.5), normal(t), sign * -1.2);
      // every few veins a stronger rib gives the corrugated look
      (i % 4 === 0 ? ribs : veins).push(quad(a, c, b));
    }
    return { edgePts: pts, veins: veins.join(""), ribs: ribs.join("") };
  }

  const left = side(1);
  const right = side(-1);
  const rib: Pt[] = [];
  for (let i = 0; i <= STEPS; i++) rib.push(at(i / STEPS));
  const leftShape = poly([...rib, ...left.edgePts.slice().reverse()]);
  const rightShape = poly([...rib, ...right.edgePts.slice().reverse()]);

  // tapered midrib
  const ribL: Pt[] = [];
  const ribR: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const w = 1.5 * (1 - t) + 0.15;
    ribL.push(add(at(t), normal(t), w));
    ribR.push(add(at(t), normal(t), -w));
  }
  const ribShape = poly([[0, 14], ...ribL, ...ribR.reverse()]);

  const c = {
    deep: shade("#123222", dim),
    mid: shade("#2f6b2c", dim),
    lit: shade("#8fbf3a", dim),
    glow: shade("#e4f27a", dim),
    rib: shade("#c9dc86", dim),
    vein: shade("#d9ec92", dim),
  };
  const g = (k: string) => `${id}${k}`;
  const glowAt = at(0.42);
  const gx = round1(glowAt[0] - W * 0.3);
  const gy = round1(glowAt[1]);

  return (
    <g>
      <defs>
        <linearGradient id={g("l")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={-L}>
          <stop offset="0" stopColor={c.deep} />
          <stop offset="0.45" stopColor={c.mid} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
        <linearGradient id={g("r")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={-L}>
          <stop offset="0" stopColor={shade(c.deep, 0.3)} />
          <stop offset="0.5" stopColor={shade(c.mid, 0.35)} />
          <stop offset="1" stopColor={shade(c.deep, 0.3)} />
        </linearGradient>
        <linearGradient id={g("edgeL")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={round1(-W * 1.1)} y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={g("edgeR")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={round1(W * 1.1)} y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient
          id={g("glow")}
          gradientUnits="userSpaceOnUse"
          cx={gx}
          cy={gy}
          r={L * 0.42}
          gradientTransform={`translate(${gx} ${gy}) scale(0.45 1) translate(${-gx} ${-gy})`}
        >
          <stop offset="0" stopColor={c.glow} stopOpacity="0.85" />
          <stop offset="0.45" stopColor={c.lit} stopOpacity="0.45" />
          <stop offset="1" stopColor={c.lit} stopOpacity="0" />
        </radialGradient>
        <clipPath id={g("clipL")}>
          <path d={leftShape} />
        </clipPath>
        <clipPath id={g("clipR")}>
          <path d={rightShape} />
        </clipPath>
      </defs>

      {/* left half (sunlit) */}
      <path d={leftShape} fill={`url(#${g("l")})`} />
      <path d={leftShape} fill={`url(#${g("glow")})`} />
      <path d={leftShape} fill={`url(#${g("edgeL")})`} />
      {/* veins are clipped to the blade so they stop at tears and edges */}
      <g clipPath={`url(#${g("clipL")})`}>
        <path d={left.veins} fill="none" stroke={c.vein} strokeWidth="0.2" strokeOpacity="0.3" />
        <path d={left.ribs} fill="none" stroke={c.deep} strokeWidth="0.35" strokeOpacity="0.35" />
      </g>
      {/* right half (in shade) */}
      <path d={rightShape} fill={`url(#${g("r")})`} />
      <g clipPath={`url(#${g("clipR")})`}>
        <path d={right.veins} fill="none" stroke={c.vein} strokeWidth="0.2" strokeOpacity="0.13" />
        <path d={right.ribs} fill="none" stroke="#000" strokeWidth="0.35" strokeOpacity="0.25" />
      </g>
      <path d={rightShape} fill={`url(#${g("edgeR")})`} />
      {/* soft fold shadow along the midrib */}
      <path d={ribShape} fill={c.rib} opacity="0.85" />
    </g>
  );
}
