import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import type { ReactElement } from "react";
import { validate, type Diagnostic } from "@hyper-elements/react";
import { emailClients } from "@hyper-elements/email-clients";
import { lint } from "@hyper-elements/lint";
import type { ClassFile } from "../src/types";
import { checkFile } from "../src/check";
import { buildClass } from "../src/report";
import ReportEmail from "../templates/report-email";
import ReportPage from "../templates/report-page";
import ReportCard from "../templates/report-card";
import Certificate from "../templates/certificate";
import ClassOverview from "../templates/class-overview";

export const ROOT = new URL("..", import.meta.url).pathname;

export async function loadData(path: string): Promise<{ slug: string; file: ClassFile }> {
  return { slug: basename(path, ".json"), file: JSON.parse(await readFile(path, "utf8")) };
}

export async function sampleFiles(): Promise<string[]> {
  const dir = join(ROOT, "data");
  return (await readdir(dir)).filter((f) => f.endsWith(".json")).sort().map((f) => join(dir, f));
}

/** Everything one pupil gets, as elements: what the gate checks and what make renders. */
export function pupilArtefacts(file: ClassFile, pupil: string) {
  const report = buildClass(file);
  const p = report.pupils.find((x) => x.pupil.id === pupil)!;
  return {
    email: <ReportEmail file={file} pupil={pupil} />,
    page: <ReportPage file={file} pupil={pupil} pdfHref="report.pdf" />,
    card: <ReportCard file={file} pupil={pupil} />,
    certificates: p.awards.map((a) => ({ award: a, el: <Certificate file={file} pupil={pupil} award={a.code} /> })),
  };
}

export function classArtefacts(file: ClassFile) {
  return { overview: <ClassOverview file={file} /> };
}

export interface GateResult {
  slug: string;
  dataIssues: { path: string; message: string }[];
  checked: number;
  errors: Diagnostic[];
  warnings: Diagnostic[];
  notes: Record<string, number>;
}

let plugins: { email: unknown[]; page: unknown[] } | undefined;

/**
 * The gate: the data checks, then validate() on every artefact for every pupil (the email with the
 * email-client models and lint, the page with lint), every certificate and the mark sheet. Errors
 * and warnings fail it (a report card page that overflows is a warning); notes are counted.
 */
export async function gate(slug: string, file: ClassFile): Promise<GateResult> {
  plugins ??= { email: [await emailClients(), lint({ kind: "transactional" })], page: [lint()] };
  const result: GateResult = { slug, dataIssues: checkFile(file), checked: 0, errors: [], warnings: [], notes: {} };
  if (result.dataIssues.length) return result;
  const run = (el: ReactElement, kind: "email" | "page" | "other", where: string) => {
    const v = validate(el, { plugins: (kind === "other" ? [] : plugins![kind]) as never });
    result.checked++;
    for (const d of v.diagnostics) {
      const tagged = { ...d, path: `${where}: ${d.path ?? ""}` };
      if (d.severity === "error") result.errors.push(tagged);
      else if (d.severity === "warning") result.warnings.push(tagged);
      else result.notes[d.code] = (result.notes[d.code] ?? 0) + 1;
    }
  };
  for (const pupil of file.pupils) {
    const a = pupilArtefacts(file, pupil.id);
    run(a.email, "email", `${pupil.id} email`);
    run(a.page, "page", `${pupil.id} page`);
    run(a.card, "other", `${pupil.id} report card`);
    for (const c of a.certificates) run(c.el, "other", `${pupil.id} certificate ${c.award.code}`);
  }
  run(classArtefacts(file).overview, "other", "class overview");
  return result;
}

export function passed(r: GateResult) {
  return r.dataIssues.length === 0 && r.errors.length === 0 && r.warnings.length === 0;
}

export function report(r: GateResult) {
  const lines = [`${r.slug}: ${passed(r) ? "pass" : "FAIL"} (${r.checked} artefacts, ${r.errors.length} errors, ${r.warnings.length} warnings, ${Object.values(r.notes).reduce((a, b) => a + b, 0)} notes)`];
  for (const i of r.dataIssues) lines.push(`  data  ${i.path}: ${i.message}`);
  for (const d of [...r.errors, ...r.warnings]) lines.push(`  ${d.severity} ${d.code} at ${d.path}: ${d.message}`);
  return lines.join("\n");
}
