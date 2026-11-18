import type { AwardRule, ClassFile, Pupil } from "./types";
import { fill, labelsFor } from "./strings";

export interface SubjectResult {
  code: string;
  name: string;
  teacher: string;
  score: number;
  grade: string;
  gradeLabel: string;
  /** 0 is the top band. */
  band: number;
  effort: number;
  effortLabel: string;
  comment: string;
  classAverage: number;
}

export interface Award {
  code: string;
  title: string;
  description: string;
  /** The subject a subject award is for. */
  subject?: string;
  pupilId: string;
}

export interface PupilReport {
  pupil: Pupil;
  results: SubjectResult[];
  average: number;
  grade: string;
  gradeLabel: string;
  band: number;
  attendance: { percent: number; present: number; total: number; absent: number; late: number };
  /** The best result, ties broken by subject order. */
  strongest: SubjectResult;
  improvement: number | null;
  awards: Award[];
  url: string;
}

export interface ClassReport {
  file: ClassFile;
  pupils: PupilReport[];
  subjectAverages: Record<string, number>;
  average: number;
  awards: Award[];
}

/** Rounds to `decimals` places, half up, after taking out float noise. */
export function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(Number((value * f).toPrecision(12))) / f;
}

export function bandOf(file: ClassFile, score: number) {
  const bands = file.settings.scale.bands;
  const i = bands.findIndex((b) => score >= b.min);
  const at = i === -1 ? bands.length - 1 : i;
  return { ...bands[at], band: at };
}

/** Every pupil's results, the class averages and the awards, from the file alone. */
export function buildClass(file: ClassFile): ClassReport {
  const { decimals } = file.settings.scale;
  const subjectAverages: Record<string, number> = {};
  for (const s of file.subjects) {
    const scores = file.pupils.map((p) => p.results[s.code]?.score).filter((x): x is number => typeof x === "number");
    subjectAverages[s.code] = round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length), decimals + 1);
  }

  const pupils: PupilReport[] = file.pupils.map((pupil) => {
    const results = file.subjects
      .filter((s) => pupil.results[s.code])
      .map((s) => {
        const r = pupil.results[s.code];
        const b = bandOf(file, r.score);
        return { code: s.code, name: s.name, teacher: s.teacher, score: r.score, grade: b.grade, gradeLabel: b.label, band: b.band, effort: r.effort, effortLabel: file.settings.effort[r.effort - 1], comment: r.comment, classAverage: subjectAverages[s.code] };
      });
    const average = round(results.reduce((a, r) => a + r.score, 0) / Math.max(1, results.length), decimals + 1);
    const b = bandOf(file, average);
    const total = file.term.sessions;
    const strongest = results.reduce((a, r) => (r.score > a.score ? r : a), results[0]);
    return {
      pupil,
      results,
      average,
      grade: b.grade,
      gradeLabel: b.label,
      band: b.band,
      attendance: { percent: round((pupil.attendance.present / total) * 100, 1), present: pupil.attendance.present, total, absent: pupil.attendance.absent, late: pupil.attendance.late },
      strongest,
      improvement: pupil.previousAverage === null ? null : round(average - pupil.previousAverage, decimals + 1),
      awards: [],
      url: `${file.school.portalUrl.replace(/\/$/, "")}/${encodeURIComponent(pupil.id)}`,
    };
  });

  const awards: Award[] = [];
  const give = (rule: AwardRule, winners: PupilReport[], subject?: string) => {
    for (const w of winners) {
      const award: Award = { code: subject ? `${rule.code}-${subject}` : rule.code, title: rule.title, description: fill(rule.description, { subject: file.subjects.find((s) => s.code === subject)?.name ?? "", class: file.class.name }), subject, pupilId: w.pupil.id };
      awards.push(award);
      w.awards.push(award);
    }
  };
  /** Everyone who shares the top value: a tie is a shared award, never a coin toss. */
  const top = (list: PupilReport[], value: (p: PupilReport) => number | null) => {
    const scored = list.filter((p) => value(p) !== null);
    if (!scored.length) return [];
    const best = Math.max(...scored.map((p) => value(p)!));
    return scored.filter((p) => value(p) === best);
  };
  for (const rule of file.awards) {
    if (rule.rule === "subject-top")
      for (const s of file.subjects) {
        const winners = top(pupils, (p) => p.pupil.results[s.code]?.score ?? null).filter((p) => p.pupil.results[s.code].score >= rule.minScore);
        give(rule, winners, s.code);
      }
    if (rule.rule === "full-attendance") give(rule, pupils.filter((p) => p.pupil.attendance.absent === 0 && p.pupil.attendance.late === 0));
    if (rule.rule === "most-improved") give(rule, top(pupils, (p) => (p.improvement !== null && p.improvement > 0 ? p.improvement : null)));
    if (rule.rule === "top-overall") give(rule, top(pupils, (p) => p.average));
  }

  const average = round(pupils.reduce((a, p) => a + p.average, 0) / Math.max(1, pupils.length), decimals + 1);
  return { file, pupils, subjectAverages, average, awards };
}

export function formatter(file: ClassFile) {
  const { locale, scale } = file.settings;
  const t = labelsFor(file.labels);
  const num = (n: number, d = scale.decimals) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  return {
    t,
    fill,
    /** A score on the school's scale: "86%", "8,4". */
    score: (n: number, extra = 0) => `${num(n, scale.decimals + extra)}${scale.suffix}`,
    num,
    percent: (n: number) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(n / 100),
    date: (iso: string, style: "long" | "medium" = "long") =>
      new Intl.DateTimeFormat(locale, style === "long" ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)),
    weekday: (iso: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)),
  };
}

export type Fmt = ReturnType<typeof formatter>;
