import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import type { ClassFile } from "../src/types";
import { buildClass, formatter } from "../src/report";
import { loadFonts } from "../src/fonts";
import { classArtefacts, gate, passed, pupilArtefacts } from "../scripts/lib";

const load = (name: string) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")) as ClassFile;
const pages = (pdf: Uint8Array) => Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length;

describe.each(["ashcombe-park-9h", "colegio-altamira-1eso-b"])("%s", (name) => {
  const file = load(name);
  const report = buildClass(file);
  const fmt = formatter(file);
  const winner = report.pupils.find((p) => p.awards.length)!;
  const a = pupilArtefacts(file, winner.pupil.id);
  const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

  it("passes the gate for the whole class: no errors, no warnings, no page overflow", async () => {
    const r = await gate(name, file);
    expect([...r.errors, ...r.warnings]).toEqual([]);
    expect(passed(r)).toBe(true);
  }, 60000);

  it("puts the pupil, average and report link in the email and its plain text", async () => {
    const { html, text } = await render(a.email, { plugins: [] });
    expect(text).toContain(winner.pupil.firstName);
    expect(plain(text)).toContain(plain(fmt.score(winner.average, 1)));
    expect(html).toContain(winner.url);
  });

  it("draws the report card on two A4 pages, and the mark sheet on one", async () => {
    const fonts = await loadFonts();
    expect(pages((await renderPdf(a.card, { fonts })).pdf)).toBe(2);
    expect(pages((await renderPdf(classArtefacts(file).overview, { fonts })).pdf)).toBe(1);
  }, 30000);

  it("makes one certificate per award, as a 1600 by 1131 PNG", async () => {
    expect(a.certificates).toHaveLength(winner.awards.length);
    const img = await renderImage(a.certificates[0].el, { fonts: await loadFonts(), scale: 1 });
    const png = Buffer.from(img.image);
    expect(png.readUInt32BE(16)).toBe(1600);
    expect(png.readUInt32BE(20)).toBe(1131);
  }, 30000);
});
