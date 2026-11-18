/** npm run check: the gate over every file in data/, written to examples/checks.json. Exits 1 if anything fails. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gate, loadData, passed, report, ROOT, sampleFiles } from "./lib";

const files = process.argv.slice(2).length ? process.argv.slice(2) : await sampleFiles();
const results = [];
for (const path of files) {
  const { slug, file } = await loadData(path);
  const r = await gate(slug, file);
  console.log(report(r));
  results.push(r);
}
await mkdir(join(ROOT, "examples"), { recursive: true });
await writeFile(
  join(ROOT, "examples/checks.json"),
  JSON.stringify(
    results.map((r) => ({ file: `data/${r.slug}.json`, pass: passed(r), artefactsChecked: r.checked, errors: r.errors.length, warnings: r.warnings.length, dataIssues: r.dataIssues, notesByCode: r.notes })),
    null,
    2,
  ) + "\n",
);
if (!results.every(passed)) process.exitCode = 1;
