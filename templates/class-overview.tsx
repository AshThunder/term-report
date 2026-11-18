/**
 * Term Report: the class mark sheet, A4 landscape.
 *
 * For staff, not families: the whole class on one page before reports go out. A row per pupil and
 * a column per subject, each result in a cell tinted by its band, then the pupil's average,
 * attendance and awards; class averages along the foot. It is where a head of year spots the
 * pupil who is struggling in four subjects, or the subject whose results are out of line.
 */
import { Column, Document, Heading, PageFooter, PageHeader, PageNumber, Row, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { context, type TemplateProps } from "../src/context";
import { KeyRow, LABEL, Shield, hair } from "../src/parts";
import { INK, MUTED, SERIF } from "../src/theme";

export const meta = {
  title: "Term Report class mark sheet",
  description: "The whole class on one A4 landscape page: every result tinted by band, averages, attendance and awards.",
  root: "Document",
};

/** Short subject heads for the columns: the code, with the full names in the key. */
export default function ClassOverview(props: TemplateProps) {
  const { file, report, fmt, theme, accent, lang, chip, key, bandOf } = context(props);
  const { t, fill } = fmt;
  const s = file.school;
  const n = report.pupils.length;
  const rowPad = n > 26 ? 2 : n > 18 ? 3.5 : 6;
  const head = { ...LABEL, fontSize: 7.5, padding: [0, 2, 6], border: { bottom: `1px solid ${INK}` }, textAlign: "center" } as const;
  const cell = { padding: [rowPad, 2], textAlign: "center", fontSize: 8.5, border: { bottom: "1px solid #FFFFFF" } } as const;
  return (
    <Document theme={theme} size="A4" orientation="landscape" margin={[30, 36, 28, 36]} lang={lang} title={`${t.classOverview} · ${file.class.name} · ${file.term.name}`} style={{ gap: 12 }}>
      <PageHeader style={{ padding: [0, 0, 10], border: { bottom: `1px solid ${INK}` } }}>
        <Row style={{ alignItems: "center", gap: 12 }}>
          <Column style={{ width: 26 }}>
            <Shield color={accent} size={26} />
          </Column>
          <Column>
            <Text style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13 }}>{s.name}</Text>
          </Column>
          <Column style={{ width: 300 }}>
            <Text style={{ fontSize: 8.5, color: MUTED, textAlign: "right" }}>{`${file.term.name} · ${fill(t.pupilsCount, { count: String(n) })}`}</Text>
          </Column>
        </Row>
      </PageHeader>
      <Row style={{ alignItems: "end", gap: 20, padding: [4, 0, 0] }}>
        <Column style={{ gap: 2 }}>
          <Text style={{ ...LABEL, fontSize: 8, color: accent }}>{`${t.classOverview} · ${file.class.year}`}</Text>
          <Heading level={1} style={{ fontSize: 22 }}>
            {`${file.class.name} · ${file.class.tutor}`}
          </Heading>
        </Column>
        <Column style={{ width: 600 }}>
          <KeyRow items={key} bands={chip} size={8} />
        </Column>
      </Row>
      <Table style={{ fontSize: 8.5, borderCollapse: "separate" }}>
        <TableRow header>
          <TableCell style={{ ...head, textAlign: "left", width: 132 }}>{t.pupil}</TableCell>
          {file.subjects.map((sub) => (
            <TableCell key={sub.code} style={{ ...head, width: 50 }}>
              {sub.code}
            </TableCell>
          ))}
          <TableCell style={{ ...head, width: 52, color: INK }}>{t.average}</TableCell>
          <TableCell style={{ ...head, width: 64 }}>{t.attendance}</TableCell>
          <TableCell style={{ ...head, textAlign: "left" }}>{t.awards}</TableCell>
        </TableRow>
        {report.pupils.map((p) => (
          <TableRow key={p.pupil.id}>
            <TableCell style={{ ...cell, textAlign: "left", border: { bottom: hair } }}>{p.pupil.name}</TableCell>
            {file.subjects.map((sub) => {
              const r = p.results.find((x) => x.code === sub.code);
              if (!r) return <TableCell key={sub.code} style={cell}>–</TableCell>;
              const c = chip(r.band);
              return (
                <TableCell key={sub.code} style={{ ...cell, backgroundColor: c.bg, color: c.fg, fontWeight: r.band === 0 ? 600 : 400 }}>
                  {fmt.num(r.score)}
                </TableCell>
              );
            })}
            <TableCell style={{ ...cell, fontWeight: 700, border: { bottom: hair } }}>{`${fmt.num(p.average, file.settings.scale.decimals + 1)} ${p.grade}`}</TableCell>
            <TableCell style={{ ...cell, color: p.attendance.percent < 95 ? "#8A4A12" : INK, fontWeight: p.attendance.percent < 95 ? 600 : 400, border: { bottom: hair } }}>{fmt.percent(p.attendance.percent)}</TableCell>
            <TableCell style={{ ...cell, textAlign: "left", fontSize: 7.5, color: MUTED, border: { bottom: hair } }}>{p.awards.map((a) => (a.subject ? a.subject : a.code)).join(" · ")}</TableCell>
          </TableRow>
        ))}
        <TableRow footer>
          <TableCell style={{ padding: [7, 2, 0], fontWeight: 600 }}>{t.classAverage}</TableCell>
          {file.subjects.map((sub) => (
            <TableCell key={sub.code} style={{ padding: [7, 2, 0], textAlign: "center", fontWeight: 600 }}>
              {fmt.num(report.subjectAverages[sub.code], file.settings.scale.decimals + 1)}
            </TableCell>
          ))}
          <TableCell style={{ padding: [7, 2, 0], textAlign: "center", fontWeight: 700, color: accent }}>{`${fmt.num(report.average, file.settings.scale.decimals + 1)} ${bandOf(report.average).grade}`}</TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </Table>
      <Text style={{ fontSize: 7.5, color: MUTED }}>
        {`${file.subjects.map((sub) => `${sub.code} ${sub.name}`).join(" · ")} · ${file.awards.map((a) => `${a.code} ${a.title}`).join(" · ")}`}
      </Text>
      <PageFooter style={{ padding: [8, 0, 0], border: { top: hair } }}>
        <Row>
          <Text style={{ fontSize: 7.5, color: MUTED }}>{`${s.name} · ${t.classOverview} · ${fmt.date(file.term.reportDate)}`}</Text>
          <Column style={{ width: 90 }}>
            <Text style={{ fontSize: 7.5, color: MUTED, textAlign: "right" }}>
              {t.page} <PageNumber /> {t.of} <PageNumber total />
            </Text>
          </Column>
        </Row>
      </PageFooter>
    </Document>
  );
}
