/**
 * The blocks the outputs share. Root-agnostic ones (no Svg, no phone styles) are used by every
 * root; the Svg ones (the shield, the result bars) only by the Page, the Document and the Canvas.
 */
import type { ReactNode } from "react";
import { Column, Grid, Layer, Line, Path, Rect, Row, Svg, Text, defineElement, prop } from "@hyper-elements/react";
import { INK, MUTED, RULE, SERIF } from "./theme";

export const LABEL = { fontSize: 11, lineHeight: 1.4, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED } as const;

/** A grade as a flat chip, coloured by its band. Text on a box, so it shows in every email client. */
export const GradeChip = defineElement({
  type: "termreport.GradeChip",
  label: "Grade chip",
  description: "A grade in a box coloured by its band.",
  props: {
    grade: prop.text({ label: "Grade", required: true }),
    background: prop.color({ label: "Background", default: "#2C4A7A" }),
    color: prop.color({ label: "Text colour", default: "#FFFFFF" }),
    size: prop.number({ label: "Size", default: 14, min: 8, max: 96 }),
    width: prop.number({ label: "Width", default: 36, min: 16, max: 400 }),
  },
  render: ({ grade, background, color, size, width }) => (
    <Column style={{ width, backgroundColor: background, padding: [Math.round(size * 0.32), 0] }}>
      <Text style={{ color, fontSize: size, lineHeight: 1.1, fontWeight: 700, textAlign: "center" }}>{grade}</Text>
    </Column>
  ),
});

/** The school's letters on its colour: the crest where Svg can't go (email). */
export const Crest = defineElement({
  type: "termreport.Crest",
  label: "Crest",
  description: "The school's letters on its colour, in place of a logo file.",
  props: {
    letters: prop.text({ label: "Letters", required: true }),
    color: prop.color({ label: "Colour", default: "#2C4A7A" }),
    size: prop.number({ label: "Size", default: 44, min: 24, max: 200 }),
  },
  render: ({ letters, color, size }) => (
    <Column style={{ width: size, backgroundColor: color, padding: [Math.round(size * 0.29), 0] }}>
      <Text style={{ color: "#FFFFFF", fontFamily: SERIF, fontSize: Math.round(size * 0.4), lineHeight: 1.05, fontWeight: 600, textAlign: "center" }}>{letters}</Text>
    </Column>
  ),
});

/** The crest as a shield, drawn in Svg (Page, Document, Canvas). Letters are set over it by the caller's layout, so it carries no text. */
export function Shield({ color, size }: { color: string; size: number }) {
  const w = size;
  const h = Math.round(size * 1.18);
  return (
    <Svg width={w} height={h} viewBox="0 0 100 118" title="School crest">
      <Path d="M4 4 H96 V58 C96 88 74 106 50 114 C26 106 4 88 4 58 Z" style={{ fill: color }} />
      <Path d="M12 12 H88 V57 C88 82 70 97 50 104 C30 97 12 82 12 57 Z" style={{ fill: "transparent", stroke: "#FFFFFF", strokeWidth: 2 }} />
      <Line x1={12} y1={44} x2={88} y2={44} style={{ stroke: "#FFFFFF", strokeWidth: 2 }} />
    </Svg>
  );
}

/** A result against the scale, with the class average as a tick. */
export function ResultBar({ score, average, max, width, height = 10, color }: { score: number; average: number; max: number; width: number; height?: number; color: string }) {
  const w = Math.max(2, Math.round((score / max) * width));
  const x = Math.round((average / max) * width);
  return (
    <Svg width={width} height={height + 6} viewBox={`0 0 ${width} ${height + 6}`} title={`Result ${score} of ${max}, class average ${average}`}>
      <Rect x={0} y={3} width={width} height={height} style={{ fill: "#ECE9E2" }} />
      <Rect x={0} y={3} width={w} height={height} style={{ fill: color }} />
      <Rect x={Math.min(width - 2, Math.max(0, x - 1))} y={0} width={2} height={height + 6} style={{ fill: INK }} />
    </Svg>
  );
}

/** A label over a value. */
export function Fact({ label, value, size = 16, color = INK, serif = false, labelSize = 11 }: { label: string; value: ReactNode; size?: number; color?: string; serif?: boolean; labelSize?: number }) {
  return (
    <Column style={{ gap: Math.max(3, Math.round(size / 5)) }}>
      <Text style={{ ...LABEL, fontSize: labelSize }}>{label}</Text>
      <Text style={{ fontSize: size, lineHeight: 1.2, fontWeight: serif ? 600 : 500, fontFamily: serif ? SERIF : undefined, color }}>{value}</Text>
    </Column>
  );
}

/** A thin rule with a label on it: section heads in the PDF. */
export function SectionHead({ children, size = 9 }: { children: ReactNode; size?: number }) {
  return <Text style={{ ...LABEL, fontSize: size, color: INK, padding: [0, 0, 6], border: { bottom: `1px solid ${INK}` } }}>{children}</Text>;
}

export function KeyRow({ items, bands, size = 9, columns = 5 }: { items: { grade: string; label: string; min: string }[]; accent?: string; bands: (band: number) => { bg: string; fg: string }; size?: number; columns?: number }) {
  return (
    <Grid columns={columns} stackOnMobile={false} style={{ gap: 10, rowGap: 8 }}>
      {items.map((it, i) => (
        <Row key={it.grade} style={{ gap: 6, alignItems: "center" }} stackOnMobile={false}>
          <Column style={{ width: 30 }}>
            <GradeChip grade={it.grade} background={bands(i).bg} color={bands(i).fg} size={size} width={30} />
          </Column>
          <Text style={{ fontSize: size, color: MUTED }}>{`${it.label} · ${it.min}`}</Text>
        </Row>
      ))}
    </Grid>
  );
}

export const hair = `1px solid ${RULE}`;

/** The shield with the school's letters set in its lower field. */
export function LetteredShield({ color, size, letters }: { color: string; size: number; letters: string }) {
  const h = Math.round(size * 1.18);
  return (
    <Layer style={{ width: size, height: h, justifyItems: "center", alignItems: "start" }}>
      <Shield color={color} size={size} />
      <Column style={{ width: size, padding: [Math.round(h * 0.42), 0, 0] }}>
        <Text style={{ color: "#FFFFFF", fontFamily: SERIF, fontWeight: 600, fontSize: Math.round(size * 0.3), lineHeight: 1, textAlign: "center" }}>{letters}</Text>
      </Column>
    </Layer>
  );
}
