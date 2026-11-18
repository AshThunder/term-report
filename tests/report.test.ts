import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { ClassFile } from "../src/types";
import { bandOf, buildClass, formatter, round } from "../src/report";
import { checkFile } from "../src/check";

const load = (name: string) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")) as ClassFile;
const uk = load("ashcombe-park-9h");
const es = load("colegio-altamira-1eso-b");
const clone = (f: ClassFile): ClassFile => structuredClone(f);

describe("grades", () => {
  it("gives a score the first band whose min it reaches", () => {
    expect(bandOf(uk, 85).grade).toBe("A");
    expect(bandOf(uk, 84.9).grade).toBe("B");
    expect(bandOf(uk, 40).grade).toBe("D");
    expect(bandOf(uk, 0).grade).toBe("E");
  });
  it("works on a 0 to 10 scale", () => {
    expect(bandOf(es, 9).grade).toBe("SB");
    expect(bandOf(es, 4.9).grade).toBe("IN");
    expect(bandOf(es, 5).grade).toBe("SU");
  });
  it("rounds half up without float noise", () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(84.95, 1)).toBe(85);
  });
});

describe("the class", () => {
  const r = buildClass(uk);
  it("has a report for every pupil with every subject", () => {
    expect(r.pupils).toHaveLength(uk.pupils.length);
    for (const p of r.pupils) expect(p.results).toHaveLength(uk.subjects.length);
  });
  it("works out averages from the results", () => {
    const p = r.pupils[0];
    const mean = p.results.reduce((a, x) => a + x.score, 0) / p.results.length;
    expect(p.average).toBeCloseTo(mean, 1);
    const eng = uk.pupils.map((x) => x.results.ENG.score);
    expect(r.subjectAverages.ENG).toBeCloseTo(eng.reduce((a, b) => a + b, 0) / eng.length, 1);
  });
  it("works out attendance against the term's sessions", () => {
    const p = r.pupils[0];
    expect(p.attendance.percent).toBeCloseTo((p.pupil.attendance.present / uk.term.sessions) * 100, 1);
  });
  it("gives subject awards to the top score only when it clears the minimum", () => {
    const rule = uk.awards.find((a) => a.rule === "subject-top") as { minScore: number; code: string };
    for (const s of uk.subjects) {
      const best = Math.max(...uk.pupils.map((p) => p.results[s.code].score));
      const winners = r.awards.filter((a) => a.subject === s.code);
      if (best >= rule.minScore) expect(winners.length).toBeGreaterThan(0);
      else expect(winners).toHaveLength(0);
      for (const w of winners) expect(uk.pupils.find((p) => p.id === w.pupilId)!.results[s.code].score).toBe(best);
    }
  });
  it("shares a tied award rather than picking one pupil", () => {
    const f = clone(uk);
    f.pupils[0].results.ENG.score = 100;
    f.pupils[1].results.ENG.score = 100;
    const eng = buildClass(f).awards.filter((a) => a.subject === "ENG");
    expect(eng.map((a) => a.pupilId).sort()).toEqual([f.pupils[0].id, f.pupils[1].id].sort());
  });
  it("gives full attendance only with no absence and no lates", () => {
    for (const a of r.awards.filter((x) => x.code === "ATT")) {
      const p = uk.pupils.find((x) => x.id === a.pupilId)!;
      expect(p.attendance.absent + p.attendance.late).toBe(0);
    }
  });
});

describe("formatting", () => {
  it("formats scores and dates in the school's locale", () => {
    const f = formatter(es);
    expect(f.score(8.4)).toBe("8,4");
    expect(f.date("2026-12-18")).toBe("18 de diciembre de 2026");
    expect(formatter(uk).date("2026-12-11")).toBe("11 December 2026");
  });
  it("prints Spanish labels from the file", () => {
    expect(formatter(es).t.average).not.toBe(formatter(uk).t.average);
  });
});

describe("data checks", () => {
  it("passes the samples", () => {
    expect(checkFile(uk)).toEqual([]);
    expect(checkFile(es)).toEqual([]);
  });
  it("names the path to fix", () => {
    const f = clone(uk);
    f.pupils[2].results.MAT.score = 140;
    f.pupils[3].attendance.present -= 4;
    delete (f.pupils[4].results as Record<string, unknown>).SCI;
    f.settings.scale.bands[1].min = 90;
    f.school.accent = "navy";
    const paths = checkFile(f).map((i) => i.path);
    expect(paths).toEqual(expect.arrayContaining(["pupils[2].results.MAT.score", "pupils[3].attendance", "pupils[4].results", "settings.scale.bands[1].min", "school.accent"]));
  });
});
