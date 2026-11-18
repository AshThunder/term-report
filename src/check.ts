/**
 * Checks on the class file, run before anything is rendered: what Hyper Elements' validate()
 * can't know (a score above the scale, attendance that doesn't add up, a pupil missing a subject,
 * grade bands out of order). Each problem names the path in the file to fix.
 */
import type { ClassFile } from "./types";

export interface Issue {
  path: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR = /^#[0-9a-f]{6}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function checkFile(file: ClassFile): Issue[] {
  const issues: Issue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  const { school, settings, term, subjects, pupils, awards } = file;

  try {
    new Intl.NumberFormat(settings.locale);
    new Intl.DateTimeFormat(settings.locale);
  } catch {
    add("settings.locale", `"${settings.locale}" is not a valid locale`);
  }
  if (!COLOR.test(school.accent)) add("school.accent", `"${school.accent}" is not a #rrggbb colour`);
  if (!/^[A-Z]{1,3}$/.test(school.monogram)) add("school.monogram", "one to three capital letters");
  if (!/^https:\/\//.test(school.portalUrl)) add("school.portalUrl", "must be an https URL");

  const { max, bands } = settings.scale;
  if (!(max > 0)) add("settings.scale.max", "must be above zero");
  if (bands.length < 2) add("settings.scale.bands", "needs at least two bands");
  bands.forEach((b, i) => {
    if (i > 0 && b.min >= bands[i - 1].min) add(`settings.scale.bands[${i}].min`, "bands must be highest first, each min below the one before");
    if (b.min < 0 || b.min > max) add(`settings.scale.bands[${i}].min`, `outside 0 to ${max}`);
  });
  if (bands.length && bands[bands.length - 1].min !== 0) add(`settings.scale.bands[${bands.length - 1}].min`, "the lowest band must start at 0, so every score has a grade");

  for (const k of ["start", "end", "reportDate"] as const) if (!ISO_DATE.test(term[k])) add(`term.${k}`, `"${term[k]}" is not a YYYY-MM-DD date`);
  if (term.end < term.start) add("term.end", "ends before it starts");
  term.dates.forEach((d, i) => !ISO_DATE.test(d.date) && add(`term.dates[${i}].date`, `"${d.date}" is not a YYYY-MM-DD date`));
  if (!(term.sessions > 0)) add("term.sessions", "must be above zero");

  const codes = new Set<string>();
  subjects.forEach((s, i) => {
    if (codes.has(s.code)) add(`subjects[${i}].code`, `"${s.code}" appears twice`);
    codes.add(s.code);
  });
  awards.forEach((a, i) => {
    if (a.rule === "subject-top" && (a.minScore < 0 || a.minScore > max)) add(`awards[${i}].minScore`, `outside 0 to ${max}`);
  });

  const ids = new Set<string>();
  if (pupils.length === 0) add("pupils", "has no pupils");
  pupils.forEach((p, i) => {
    const at = `pupils[${i}]`;
    if (ids.has(p.id)) add(`${at}.id`, `"${p.id}" appears twice`);
    ids.add(p.id);
    if (!p.name.trim() || !p.firstName.trim()) add(at, "name or firstName is empty");
    if (!EMAIL.test(p.guardian.email)) add(`${at}.guardian.email`, `"${p.guardian.email}" is not an email address`);
    const { present, absent, late } = p.attendance;
    if (present + absent !== term.sessions) add(`${at}.attendance`, `present + absent is ${present + absent}, not the term's ${term.sessions} sessions`);
    if (late > present) add(`${at}.attendance.late`, "more lates than sessions present");
    for (const code of codes) if (!p.results[code]) add(`${at}.results`, `no result for ${code}`);
    for (const [code, r] of Object.entries(p.results)) {
      if (!codes.has(code)) add(`${at}.results.${code}`, "is not a subject in the file");
      if (r.score < 0 || r.score > max) add(`${at}.results.${code}.score`, `${r.score} is outside 0 to ${max}`);
      if (![1, 2, 3, 4].includes(r.effort)) add(`${at}.results.${code}.effort`, "must be 1 to 4");
      if (!r.comment.trim()) add(`${at}.results.${code}.comment`, "is empty");
    }
    if (p.previousAverage !== null && (p.previousAverage < 0 || p.previousAverage > max)) add(`${at}.previousAverage`, `outside 0 to ${max}`);
  });
  return issues;
}
