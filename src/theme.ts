import { defineTheme, extendTheme } from "@hyper-elements/react";
import type { ClassFile } from "./types";

/**
 * Term Report's look, written once for all four roots.
 *
 * A school report is read slowly, often more than once, and kept. So: a serif for names and
 * headings (Source Serif), Inter for everything that is data, generous leading, hairline rules,
 * and the school's colour used as a scale. Grades are shown as flat chips whose depth follows the
 * band: the top band is the school colour itself, each band below it a lighter tint, so a page of
 * results reads at a glance without a legend and without traffic-light red and green.
 */
export const SERIF = "'Source Serif Pro', 'Source Serif 4', Georgia, 'Times New Roman', serif";
export const SANS = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";
export const INK = "#1B1D22";
export const MUTED = "#5A606A";
export const RULE = "#DCD9D2";
export const PAPER = "#F6F4EF";
export const WASH = "#EEEBE4";

/** `hex` mixed with white: 0 is the colour, 1 is white. */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

/** The chip for a band: background and text. The lowest band is a warm paper with ink, never alarm red. */
export function bandColors(accent: string, band: number, bands: number) {
  if (band === 0) return { bg: accent, fg: "#FFFFFF" };
  if (band >= bands - 1) return { bg: "#F1E4D3", fg: "#6B3A12" };
  const steps = [0.55, 0.72, 0.84];
  return { bg: tint(accent, steps[Math.min(band - 1, steps.length - 1)]), fg: INK };
}

export const termReport = defineTheme({
  colors: { background: PAPER, foreground: INK, primary: "#2C4A7A", primaryForeground: "#FFFFFF", muted: MUTED, border: RULE, card: "#FFFFFF", wash: WASH },
  fonts: { body: SANS, heading: SERIF },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.55 },
  elements: {
    Heading: {
      fontWeight: 600,
      by: {
        level: {
          1: { fontSize: 34, lineHeight: 1.12, letterSpacing: -0.4 },
          2: { fontSize: 21, lineHeight: 1.25 },
          3: { fontSize: 16, lineHeight: 1.3 },
        },
      },
    },
    Button: { borderRadius: 3, padding: [14, 24], fontWeight: 600, fontFamily: SANS, hover: { backgroundColor: INK } },
    Divider: { borderTop: `1px solid ${RULE}` },
  },
  styles: {
    card: { backgroundColor: "{colors.card}", padding: 32, gap: 24, border: `1px solid ${RULE}` },
  },
  formats: {
    document: { colors: { background: "#FFFFFF" }, fontSizes: { body: 10.5 }, lineHeights: { body: 1.45 } },
  },
});

export function themeFor(file: ClassFile) {
  return extendTheme(termReport, { colors: { primary: file.school.accent } });
}
