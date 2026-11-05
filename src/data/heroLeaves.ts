import type { LeafSpec } from "@/components/leaves/Leaf";

// Scene is 1600×1000. The gate opening spans x 580–1020 with its apex at y 140.
// Each side is listed once and mirrored, so tweak the left side only.

const leftBack: LeafSpec[] = [
  { kind: "palm", seed: 11, x: -80, y: 40, rotate: 104, size: 620, bend: 0.22, droop: 1 },
  { kind: "banana", seed: 12, x: 60, y: 1100, rotate: 30, size: 720, bend: 0.14, width: 0.2 },
  { kind: "sprig", seed: 13, x: 40, y: 560, rotate: 66, size: 380 },
];

const leftFront: LeafSpec[] = [
  { kind: "palm", seed: 23, x: -90, y: 230, rotate: 116, size: 460, bend: 0.2, droop: 1, count: 24 },
  { kind: "sprig", seed: 24, x: -60, y: 700, rotate: 92, size: 300, bend: -0.06, dim: 0.2 },
  { kind: "banana", seed: 21, x: -80, y: 880, rotate: 68, size: 690, bend: -0.1, width: 0.19, tears: 4 },
  { kind: "sprig", seed: 22, x: 150, y: 1110, rotate: 22, size: 380, bend: 0.1, dim: 0.1 },
];

function mirror(list: LeafSpec[], seedShift: number): LeafSpec[] {
  return list.map((l) => ({
    ...l,
    x: 1600 - l.x,
    flip: !l.flip,
    rotate: -l.rotate,
    ...("seed" in l ? { seed: l.seed + seedShift } : {}),
  })) as LeafSpec[];
}

export const backLeaves = [...leftBack, ...mirror(leftBack, 100)];
export const frontLeaves = [...leftFront, ...mirror(leftFront, 100)];

// Phones show only the middle of the scene (x ≈ 450–1150, y ≈ -250–1250), so they get
// their own smaller leaves, tucked around the gate and kept clear of the logo
// (x 600–1000, y 430–760) and the "Step inside" cue at the bottom.
const portraitLeftBack: LeafSpec[] = [
  { kind: "palm", seed: 31, x: 460, y: 60, rotate: 110, size: 250, bend: 0.2, droop: 1, count: 20 },
  { kind: "banana", seed: 32, x: 470, y: 1300, rotate: 12, size: 380, bend: 0.1, width: 0.17 },
];

const portraitLeftFront: LeafSpec[] = [
  { kind: "palm", seed: 33, x: 420, y: -120, rotate: 132, size: 320, bend: 0.2, droop: 1, count: 22 },
  { kind: "sprig", seed: 34, x: 420, y: 330, rotate: 68, size: 230, bend: 0.06 },
  { kind: "sprig", seed: 35, x: 430, y: 880, rotate: 50, size: 220, bend: -0.06, dim: 0.1 },
  { kind: "banana", seed: 36, x: 420, y: 1290, rotate: 18, size: 420, bend: -0.08, width: 0.17, tears: 3 },
];

export const portraitBackLeaves = [...portraitLeftBack, ...mirror(portraitLeftBack, 100)];
export const portraitFrontLeaves = [...portraitLeftFront, ...mirror(portraitLeftFront, 100)];
