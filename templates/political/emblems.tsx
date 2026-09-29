import { Circle, Image, Path, Rect, Svg } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import type { PoliticalParty } from "@/lib/schemas";

/*
 * Simple original drawings of the parties' election symbols on a 100×100 canvas. They are generic
 * pictures of the objects (paddy, a boat, scales), not the parties' logos.
 */

type Point = [number, number];
const fmt = (n: number) => Math.round(n * 10) / 10;

/** Point and unit tangent at `t` on a quadratic Bézier curve. */
function onCurve(p0: Point, p1: Point, p2: Point, t: number): { at: Point; dir: Point } {
  const u = 1 - t;
  const at: Point = [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
  const d: Point = [2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]), 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])];
  const len = Math.hypot(d[0], d[1]) || 1;
  return { at, dir: [d[0] / len, d[1] / len] };
}

/** An almond-shaped grain centred on `c`, pointing along `dir`. */
function grain(c: Point, dir: Point, length: number, width: number): string {
  const n: Point = [-dir[1], dir[0]];
  const a: Point = [c[0] - dir[0] * length, c[1] - dir[1] * length];
  const b: Point = [c[0] + dir[0] * length, c[1] + dir[1] * length];
  return `M${fmt(a[0])} ${fmt(a[1])} Q${fmt(c[0] + n[0] * width)} ${fmt(c[1] + n[1] * width)} ${fmt(b[0])} ${fmt(b[1])} Q${fmt(c[0] - n[0] * width)} ${fmt(c[1] - n[1] * width)} ${fmt(a[0])} ${fmt(a[1])} Z`;
}

const rotate = ([x, y]: Point, deg: number): Point => {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};

/** Sheaf of paddy: five stalks from a tied base, grains on both sides of each head. */
function Paddy({ color }: { color: string }) {
  const base: Point = [50, 96];
  const stalks = [-26, -13, 0, 13, 26].map((s) => {
    const p1: Point = [50 + s * 0.5, 38];
    const p2: Point = [50 + s * 1.45, s === 0 ? 6 : 14 + Math.abs(s) * 0.55];
    return { p1, p2 };
  });
  const grains: string[] = [];
  for (const { p1, p2 } of stalks) {
    for (let t = 0.5; t <= 0.96; t += 0.09) {
      const { at, dir } = onCurve(base, p1, p2, t);
      const n: Point = [-dir[1], dir[0]];
      for (const side of [1, -1]) {
        const c: Point = [at[0] + n[0] * 2.6 * side, at[1] + n[1] * 2.6 * side];
        grains.push(grain(c, rotate(dir, 28 * side), 3.3, 1.5));
      }
    }
  }
  return (
    <>
      {stalks.map(({ p1, p2 }, i) => (
        <Path key={i} d={`M${base[0]} ${base[1]} Q${fmt(p1[0])} ${fmt(p1[1])} ${fmt(p2[0])} ${fmt(p2[1])}`} stroke={color} strokeWidth={1.8} fill="none" />
      ))}
      {grains.map((d, i) => (
        <Path key={`g${i}`} d={d} fill={color} />
      ))}
      <Rect x={42} y={76} width={16} height={5} rx={1.5} fill={color} />
    </>
  );
}

/** Country boat with a curved canopy, on water. */
function Boat({ color }: { color: string }) {
  return (
    <>
      <Path d="M30 62 Q50 34 70 62 Z" fill={color} />
      <Path d="M4 54 Q14 62 24 62 L76 62 Q86 62 96 54 Q90 70 76 76 L24 76 Q10 70 4 54 Z" fill={color} />
      <Path d="M8 86 Q14 82 20 86 T32 86 T44 86 T56 86 T68 86 T80 86 T92 86" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M20 94 Q26 90 32 94 T44 94 T56 94 T68 94 T80 94" stroke={color} strokeWidth={2} fill="none" />
    </>
  );
}

/** Balance scales: post on a stepped base, beam, two hanging pans. */
function Scales({ color }: { color: string }) {
  return (
    <>
      <Circle cx={50} cy={13} r={4.5} fill={color} />
      <Rect x={47.5} y={17} width={5} height={70} fill={color} />
      <Path d="M32 96 L68 96 L62 88 L38 88 Z" fill={color} />
      <Rect x={12} y={23} width={76} height={4} rx={2} fill={color} />
      <Path d="M17 27 L6 60 M17 27 L28 60 M83 27 L72 60 M83 27 L94 60" stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M3 60 L31 60 Q17 76 3 60 Z" fill={color} />
      <Path d="M69 60 L97 60 Q83 76 69 60 Z" fill={color} />
    </>
  );
}

const SYMBOLS: Record<Exclude<PoliticalParty, "other">, (props: { color: string }) => ReactNode> = {
  bnp: Paddy,
  "awami-league": Boat,
  jamaat: Scales,
};

/** The party's election symbol, or null for "other". */
export function PartySymbol({ party, size, color, style }: { party: PoliticalParty; size: number; color: string; style?: Style }) {
  if (party === "other") return null;
  return (
    <Svg viewBox="0 0 100 100" style={[{ width: size, height: size }, style ?? {}]}>
      {SYMBOLS[party]({ color })}
    </Svg>
  );
}

/** The uploaded party logo if there is one, otherwise the drawn election symbol. */
export function PartyEmblem({ doc, size, color, style }: { doc: PreparedPolitical; size: number; color: string; style?: Style }) {
  const logo = doc.data.partyLogo;
  if (logo) {
    // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt attribute
    return <Image src={logo.dataUrl} style={[{ width: size, height: size, objectFit: "contain" }, style ?? {}]} />;
  }
  return <PartySymbol party={doc.data.party} size={size} color={color} style={style} />;
}

/** True when the header has an emblem to show. */
export const hasEmblem = (doc: PreparedPolitical) => doc.data.partyLogo !== null || doc.data.party !== "other";
