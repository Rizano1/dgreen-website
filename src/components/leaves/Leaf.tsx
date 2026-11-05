import { BananaLeaf } from "./BananaLeaf";
import { PalmFrond } from "./PalmFrond";
import { LeafSprig } from "./LeafSprig";

/**
 * One leaf placed in the hero's 1600×1000 scene.
 * `x, y` is where the stem sits, `rotate` is degrees clockwise from pointing up,
 * `size` is the leaf length in scene units, `flip` mirrors it.
 *
 * kind "image" lets you drop in a real cut-out leaf later
 * (transparent PNG/WebP in /public/leaves, stem at the bottom centre, tip at the top).
 */
export type LeafSpec = {
  x: number;
  y: number;
  rotate: number;
  size: number;
  flip?: boolean;
  /** extra darkening on top of the layer's own */
  dim?: number;
} & (
  | { kind: "banana"; seed: number; bend?: number; width?: number; tears?: number }
  | { kind: "sprig"; seed: number; bend?: number; leaflets?: number }
  | { kind: "palm"; seed: number; bend?: number; droop?: number; count?: number }
  | { kind: "image"; src: string; aspect: number }
);

// Room around the stem (in leaf units, length = 100) that every leaf kind fits inside.
const BOX = { x: -95, y: -112, w: 190, h: 165 };

/**
 * Each leaf is its own small SVG. The browser draws it once and then only moves
 * it, so the sway and the hero zoom never force the whole scene to be redrawn
 * (which is what made tiles of the hero flicker).
 */
export function Leaf({ spec, dim: layerDim = 0 }: { spec: LeafSpec; dim?: number }) {
  const dim = Math.min(0.9, layerDim + (spec.dim ?? 0));
  const s = spec.size / 100;
  let body: React.ReactNode;
  switch (spec.kind) {
    case "banana":
      body = <BananaLeaf seed={spec.seed} bend={spec.bend} width={spec.width} tears={spec.tears} dim={dim} />;
      break;
    case "sprig":
      body = <LeafSprig seed={spec.seed} bend={spec.bend} leaflets={spec.leaflets} dim={dim} />;
      break;
    case "palm":
      body = <PalmFrond seed={spec.seed} bend={spec.bend} droop={spec.droop} count={spec.count} dim={dim} />;
      break;
    case "image": {
      const w = 100 * spec.aspect;
      body = (
        <image
          href={spec.src}
          x={-w / 2}
          y={-100}
          width={w}
          height={100}
          style={dim ? { filter: `brightness(${1 - dim})` } : undefined}
        />
      );
      break;
    }
  }
  return (
    <div
      className="leaf-item"
      style={{ transform: `translate(${spec.x}px, ${spec.y}px) rotate(${spec.rotate}deg)${spec.flip ? " scaleX(-1)" : ""}` }}
    >
      {/* rotated around the stem by the hero's sway animation */}
      <div className="leaf-sway">
        <svg
          viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`}
          style={{ left: BOX.x * s, top: BOX.y * s, width: BOX.w * s, height: BOX.h * s }}
          aria-hidden="true"
        >
          {body}
        </svg>
      </div>
    </div>
  );
}
