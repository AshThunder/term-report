/**
 * npm run shots: the pictures in the README, from the files npm run make wrote. Needs Chrome (or
 * Playwright's Chromium) for the HTML, and poppler's pdftoppm for the PDF pages. Writes
 *   examples/<file>/screens/   the featured pupil's email, page on desktop and phone, report card pages, mark sheet
 *   examples/<file>/clients/   the email as classic Outlook, Gmail and Apple Mail draw it (Ashcombe Park only)
 *   docs/hero.png, docs/two-schools.png
 */
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { renderInEmailClients } from "@hyper-elements/email-clients";
import { context } from "../src/context";
import { loadData, pupilArtefacts, ROOT, sampleFiles } from "./lib";

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const shoot = async (file: string, out: string, width: number, scale = 1) => {
  const page = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
};
const compose = async (html: string, out: string, width: number) => {
  await writeFile(join(ROOT, ".compose.html"), html);
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(pathToFileURL(join(ROOT, ".compose.html")).href);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
  await rm(join(ROOT, ".compose.html"));
  console.log(out.replace(ROOT, ""));
};

for (const path of await sampleFiles()) {
  const { slug, file } = await loadData(path);
  const dir = join(ROOT, "examples", slug);
  const screens = join(dir, "screens");
  await mkdir(screens, { recursive: true });
  await shoot(join(dir, "sample/email.html"), join(screens, "email.png"), 680);
  await shoot(join(dir, "sample/page.html"), join(screens, "page-desktop.png"), 1280);
  await shoot(join(dir, "sample/page.html"), join(screens, "page-phone.png"), 390, 2);
  execFileSync("pdftoppm", ["-r", "110", "-png", join(dir, "sample/report.pdf"), join(screens, "report")]);
  execFileSync("pdftoppm", ["-r", "110", "-png", "-singlefile", join(dir, "class-overview.pdf"), join(screens, "class-overview")]);
  console.log(`${slug}: screens`);

  if (slug !== "ashcombe-park-9h") continue;
  const clients = join(dir, "clients");
  const tmp = join(ROOT, ".previews");
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  await mkdir(clients, { recursive: true });
  const { previews } = await renderInEmailClients(pupilArtefacts(file, context({ file }).p.pupil.id).email, { emailClients: ["outlook", "gmail", "apple-mail", "gmail-app"], dark: true });
  const findings: Record<string, unknown> = {};
  for (const p of previews) {
    await writeFile(join(tmp, p.filename), p.html);
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(pathToFileURL(join(tmp, p.filename)).href);
    await page.waitForSelector("html[data-email-client-ready]", { timeout: 60000 });
    findings[p.filename] = JSON.parse((await page.textContent("#email-client-findings")) ?? "{}");
    await page.locator("#frames iframe").first().screenshot({ path: join(clients, p.filename.replace(/\.html$/, ".png")) });
    await page.close();
  }
  await writeFile(join(clients, "findings.json"), JSON.stringify(findings, null, 2) + "\n");
  await rm(tmp, { recursive: true, force: true });
  console.log(`${slug}: ${previews.length} client previews`);
}

await mkdir(join(ROOT, "docs"), { recursive: true });
const style = `body{margin:0;background:#E7E3DA;font:600 13px Inter,system-ui,sans-serif;color:#5A606A}img{display:block;width:100%;border:1px solid #1B1D22;background:#fff}p{margin:0 0 10px;letter-spacing:.08em;text-transform:uppercase}.crop{object-fit:cover;object-position:top}`;
const a = (slug: string, p: string) => pathToFileURL(join(ROOT, "examples", slug, p)).href;
const certs = (slug: string) => readdir(join(ROOT, "examples", slug, "certificates"));
{
  const s = "ashcombe-park-9h";
  const cert = (await certs(s)).find((c) => c.includes(context({}).p.pupil.id))!;
  await compose(
    `<!doctype html><meta charset="utf-8"><style>${style}.w{display:grid;grid-template-columns:480px 560px 620px;gap:32px;padding:52px;align-items:start}.c{display:grid;gap:32px}</style><div class="w"><div><p>Email to the family</p><img class="crop" style="height:812px" src="${a(s, "screens/email.png")}"></div><div><p>Report card PDF, page 1 of 2</p><img src="${a(s, "screens/report-1.png")}"></div><div class="c"><div><p>Award certificate</p><img src="${a(s, `certificates/${cert}`)}"></div><div><p>Class mark sheet</p><img class="crop" style="height:300px" src="${a(s, "screens/class-overview.png")}"></div></div></div>`,
    join(ROOT, "docs/hero.png"),
    1820,
  );
}
await compose(
  `<!doctype html><meta charset="utf-8"><style>${style}.w{display:grid;grid-template-columns:repeat(4,420px);gap:28px;padding:48px}</style><div class="w"><div><p>en-GB · percentages, A to E</p><img src="${a("ashcombe-park-9h", "screens/report-1.png")}"></div><div><p>Page 2 · comments</p><img src="${a("ashcombe-park-9h", "screens/report-2.png")}"></div><div><p>es-ES · 0 to 10, SB to IN</p><img src="${a("colegio-altamira-1eso-b", "screens/report-1.png")}"></div><div><p>Página 2 · observaciones</p><img src="${a("colegio-altamira-1eso-b", "screens/report-2.png")}"></div></div>`,
  join(ROOT, "docs/two-schools.png"),
  1860,
);
await browser.close();
