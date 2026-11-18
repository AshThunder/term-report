/**
 * npm run make: everything Term Report makes, for every file in data/ (or the files given), into
 * examples/<file>/. Nothing renders unless the gate passes for the whole class.
 *
 *   class/<pupil>/email.html, email.txt   the email to the family               (Email, render)
 *   class/<pupil>/page.html               the report online                     (Page, render)
 *   class/<pupil>/report.pdf              the two-page report card              (Document, renderPdf)
 *   certificates/<pupil>-<award>.png      one per award won                     (Canvas, renderImage)
 *   class-overview.pdf                    the staff mark sheet                  (Document, renderPdf)
 *   sample/                               the featured pupil's set, for browsing
 */
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDiagnostics, render } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { loadFonts } from "../src/fonts";
import { context } from "../src/context";
import { classArtefacts, gate, loadData, passed, pupilArtefacts, report, ROOT, sampleFiles } from "./lib";

const files = process.argv.slice(2).length ? process.argv.slice(2) : await sampleFiles();
const fonts = await loadFonts();
const timings: Record<string, unknown> = {};

const say = (label: string, diagnostics: { severity: string }[]) => {
  const loud = diagnostics.filter((d) => d.severity !== "info");
  if (loud.length) console.warn(`${label}:\n${formatDiagnostics(loud as never)}`);
};

for (const path of files) {
  const { slug, file } = await loadData(path);
  const result = await gate(slug, file);
  if (!passed(result)) {
    console.error(report(result));
    process.exitCode = 1;
    continue;
  }
  const out = join(ROOT, "examples", slug);
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "certificates"), { recursive: true });
  const started = performance.now();
  let certs = 0;
  for (const pupil of file.pupils) {
    const dir = join(out, "class", pupil.id);
    await mkdir(dir, { recursive: true });
    const a = pupilArtefacts(file, pupil.id);
    const email = await render(a.email, { plugins: [] });
    await writeFile(join(dir, "email.html"), email.html);
    await writeFile(join(dir, "email.txt"), email.text);
    await writeFile(join(dir, "page.html"), (await render(a.page)).html);
    const pdf = await renderPdf(a.card, { fonts });
    say(`${slug} ${pupil.id} report.pdf`, pdf.diagnostics);
    await writeFile(join(dir, "report.pdf"), pdf.pdf);
    for (const c of a.certificates) {
      const img = await renderImage(c.el, { fonts, scale: 1 });
      say(`${slug} ${pupil.id} ${c.award.code}`, img.diagnostics);
      await writeFile(join(out, "certificates", `${pupil.id}-${c.award.code.toLowerCase()}.png`), img.image);
      certs++;
    }
  }
  const overview = await renderPdf(classArtefacts(file).overview, { fonts });
  say(`${slug} class-overview.pdf`, overview.diagnostics);
  await writeFile(join(out, "class-overview.pdf"), overview.pdf);
  const ms = Math.round(performance.now() - started);
  const featured = context({ file }).p.pupil.id;
  await cp(join(out, "class", featured), join(out, "sample"), { recursive: true });
  timings[slug] = { pupils: file.pupils.length, certificates: certs, batchMs: ms };
  console.log(`${slug}: ${file.pupils.length} pupils (email, page, report card each), ${certs} certificates and the mark sheet in examples/${slug}/ (${ms} ms)`);
}
await writeFile(join(ROOT, "examples/timings.json"), JSON.stringify({ note: "Measured on the machine that last ran npm run make; for scale, not a benchmark.", node: process.version, ...timings }, null, 2) + "\n");
