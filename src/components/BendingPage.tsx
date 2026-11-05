// A page that bends like paper while it turns.
//
// The page is cut into vertical strips. Each strip is nested inside the previous
// one and hinged on its left edge, so a small rotation per strip adds up to a
// smooth curve, the way a real sheet curls away from the spine.

export const STRIPS = 16;

function Strip({ i, count }: { i: number; count: number }) {
  // both faces start --seam px left of the strip (except at the spine), so shift the picture to match
  const lead = (first: boolean) => (first ? "0px" : "var(--seam)");
  return (
    <div className="strip">
      <div
        className="strip-face front"
        style={{ backgroundPosition: `calc(var(--page-w) * ${-i} / ${count} + ${lead(i === 0)}) 0` }}
      />
      <div
        className="strip-face back"
        style={{ backgroundPosition: `calc(var(--page-w) * ${-(count - 1 - i)} / ${count} + ${lead(i === 0)}) 0` }}
      />
      {i < count - 1 && <Strip i={i + 1} count={count} />}
    </div>
  );
}

export function BendingPage({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div className="bending-page" ref={ref} style={{ "--strips": STRIPS } as React.CSSProperties} aria-hidden="true">
      <Strip i={0} count={STRIPS} />
    </div>
  );
}

type Pose = {
  /** overall turn, 0 = flat on the right, 1 = flat on the left */
  t: number;
  /** strongest curl in degrees, reached mid-turn */
  maxCurl: number;
};

/**
 * Poses the page for turn progress `t`.
 * The free edge trails behind the turn, so the curl bends against the direction
 * of travel; it is capped so the edge never dips below the table.
 */
export function poseBendingPage(root: HTMLElement, { t, maxCurl }: Pose) {
  const angle = -180 * t;
  const curl = Math.min(maxCurl * Math.sin(Math.PI * t), -angle * 0.85, (180 + angle) * 0.85);
  root.style.transform = `rotateY(${angle}deg)`;

  const strips = root.querySelectorAll<HTMLElement>(".strip");
  const n = strips.length;
  // more of the bend happens toward the loose edge than near the spine
  const weights = Array.from({ length: n }, (_, i) => Math.pow((i + 1) / n, 1.6));
  const total = weights.reduce((a, b) => a + b, 0);
  let abs = angle;
  strips.forEach((el, i) => {
    const step = (curl * weights[i]) / total;
    abs += step;
    el.style.transform = `rotateY(${step}deg)`;
    // darker where the strip faces away from the viewer
    const facing = Math.abs(Math.cos((abs * Math.PI) / 180));
    el.style.setProperty("--light", String(((1 - facing) * 0.45).toFixed(3)));
  });
}
