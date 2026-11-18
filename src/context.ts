import type { ClassFile } from "./types";
import { bandOf, buildClass, formatter } from "./report";
import { bandColors, themeFor } from "./theme";
import sample from "../data/ashcombe-park-9h.json";

/** The sample every template renders with no props: Ashcombe Park School, 9H, autumn term 2026. */
export const SAMPLE = sample as unknown as ClassFile;

export interface TemplateProps {
  /** The class file. Defaults to the Ashcombe Park sample. */
  file?: ClassFile;
  /** The pupil's id. Defaults to the pupil with the most awards (the most to show). */
  pupil?: string;
}

export function context({ file = SAMPLE, pupil }: TemplateProps) {
  const report = buildClass(file);
  const p = pupil ? report.pupils.find((x) => x.pupil.id === pupil) : [...report.pupils].sort((a, b) => b.awards.length - a.awards.length)[0];
  if (!p) throw new Error(`No pupil ${pupil} in the class file`);
  const fmt = formatter(file);
  const accent = file.school.accent;
  const nBands = file.settings.scale.bands.length;
  return {
    file,
    report,
    p,
    fmt,
    theme: themeFor(file),
    accent,
    lang: file.settings.locale,
    chip: (band: number) => bandColors(accent, band, nBands),
    bandOf: (score: number) => bandOf(file, score),
    key: file.settings.scale.bands.map((b, i, all) => ({ grade: b.grade, label: b.label, min: i === all.length - 1 ? `< ${fmt.num(all[i - 1]?.min ?? 0, 0)}${file.settings.scale.suffix}` : `${fmt.num(b.min, 0)}${file.settings.scale.suffix}+` })),
  };
}
