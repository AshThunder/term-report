/**
 * Term Report: the report card, A4, two pages.
 *
 * The document a family files and a school keeps on record. Page one is the term at a glance:
 * pupil details, average, attendance and awards, then every subject as a row with its result
 * drawn against the class average, and the grading key. Page two is the teachers' comments,
 * subject by subject, then the form tutor and head, targets, the dates ahead and signatures. Each page is its own Document.Page, so nothing depends on content flowing over.
 */
import { Column, Document, Grid, Heading, PageFooter, PageHeader, PageNumber, Row, Text, token } from "@hyper-elements/react";
import { context, type TemplateProps } from "../src/context";
import { Fact, GradeChip, KeyRow, LABEL, ResultBar, SectionHead, Shield, hair } from "../src/parts";
import { INK, MUTED, SERIF } from "../src/theme";

export const meta = {
  title: "Term Report report card",
  description: "A two-page A4 report card: the term at a glance with result bars, then every teacher's comment, tutor and head, targets and signatures.",
  root: "Document",
};

/** A4 is 794 px wide; 48 px margins leave 698. */
const WIDTH = 698;

export default function ReportCard(props: TemplateProps) {
  const { file, p, fmt, theme, accent, lang, chip, key } = context(props);
  const { t, fill } = fmt;
  const s = file.school;
  const max = file.settings.scale.max;

  const header = (
    <PageHeader style={{ padding: [0, 0, 14], border: { bottom: `1px solid ${INK}` } }}>
      <Row style={{ alignItems: "center", gap: 14 }}>
        <Column style={{ width: 34 }}>
          <Shield color={accent} size={34} />
        </Column>
        <Column style={{ gap: 1 }}>
          <Text style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{s.name}</Text>
          <Text style={{ fontSize: 8.5, color: MUTED }}>{`${s.address.join(" · ")} · ${s.phone} · ${s.email}`}</Text>
        </Column>
        <Column style={{ width: 190 }}>
          <Text style={{ fontSize: 9, textAlign: "right", fontWeight: 600 }}>{p.pupil.name}</Text>
          <Text style={{ fontSize: 8.5, color: MUTED, textAlign: "right" }}>{`${file.class.name} · ${file.term.name}`}</Text>
        </Column>
      </Row>
    </PageHeader>
  );
  const footer = (
    <PageFooter style={{ padding: [10, 0, 0], border: { top: hair } }}>
      <Row>
        <Text style={{ fontSize: 8, color: MUTED }}>{`${t.termReport} · ${p.pupil.name} · ${p.pupil.id}`}</Text>
        <Column style={{ width: 90 }}>
          <Text style={{ fontSize: 8, color: MUTED, textAlign: "right" }}>
            {t.page} <PageNumber /> {t.of} <PageNumber total />
          </Text>
        </Column>
      </Row>
    </PageFooter>
  );

  const BAR = 220;
  return (
    <Document theme={theme} size="A4" margin={[36, 48, 36, 48]} lang={lang} title={`${fill(t.reportFor, { name: p.pupil.name })} · ${file.term.name}`}>
      {header}
      <Document.Page style={{ gap: 20 }}>
        <Column style={{ gap: 4, padding: [8, 0, 0] }}>
          <Text style={{ ...LABEL, fontSize: 9, color: accent }}>{`${t.termReport} · ${file.term.name}`}</Text>
          <Heading level={1} style={{ fontSize: 34 }}>
            {p.pupil.name}
          </Heading>
        </Column>

        <Grid columns={4} style={{ gap: 16, backgroundColor: token("colors.wash"), padding: [12, 14] }}>
          <Fact label={t.className} value={`${file.class.year} · ${file.class.name}`} size={10.5} labelSize={7.5} />
          <Fact label={t.tutor} value={file.class.tutor} size={10.5} labelSize={7.5} />
          <Fact label={t.pupilNo} value={p.pupil.id} size={10.5} labelSize={7.5} />
          <Fact label={t.reportDate} value={fmt.date(file.term.reportDate)} size={10.5} labelSize={7.5} />
        </Grid>

        <Row style={{ border: `1px solid ${INK}` }}>
          <Column style={{ width: 190, backgroundColor: accent, color: "#FFFFFF", padding: [14, 16], gap: 4 }}>
            <Text style={{ ...LABEL, fontSize: 8, color: "#FFFFFF" }}>{t.average}</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, lineHeight: 1.05 }}>{fmt.score(p.average, 1)}</Text>
            <Text style={{ fontSize: 9.5 }}>{`${p.grade} · ${p.gradeLabel}`}</Text>
          </Column>
          <Column style={{ padding: [14, 16], gap: 4 }}>
            <Text style={{ ...LABEL, fontSize: 8 }}>{t.attendance}</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{fmt.percent(p.attendance.percent)}</Text>
            <Text style={{ fontSize: 9, color: MUTED }}>{`${fill(t.sessionsOf, { present: String(p.attendance.present), total: String(p.attendance.total) })} · ${t.absent} ${p.attendance.absent} · ${t.late} ${p.attendance.late}`}</Text>
          </Column>
          <Column style={{ padding: [14, 16], gap: 4, border: { left: hair } }}>
            <Text style={{ ...LABEL, fontSize: 8 }}>{t.awards}</Text>
            {p.awards.length ? (
              p.awards.slice(0, 5).map((a) => (
                <Text key={a.code} style={{ fontSize: 9.5, lineHeight: 1.35 }}>
                  {a.subject ? `${a.title}: ${file.subjects.find((x) => x.code === a.subject)?.name}` : a.title}
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 9.5, color: MUTED }}>{t.noAwards}</Text>
            )}
          </Column>
        </Row>

        <Column style={{ gap: 0 }}>
          <Row style={{ gap: 12, padding: [0, 0, 6], border: { bottom: `1px solid ${INK}` } }}>
            <Text style={{ ...LABEL, fontSize: 8, color: INK }}>{t.subject}</Text>
            <Column style={{ width: BAR }}>
              <Text style={{ ...LABEL, fontSize: 8 }}>{`${t.result} · | ${t.classAverage.toLowerCase()}`}</Text>
            </Column>
            <Column style={{ width: 48 }}>
              <Text style={{ ...LABEL, fontSize: 8, textAlign: "right" }}>{t.result}</Text>
            </Column>
            <Column style={{ width: 36 }}>
              <Text style={{ ...LABEL, fontSize: 8, textAlign: "center" }}>{t.grade}</Text>
            </Column>
            <Column style={{ width: 82 }}>
              <Text style={{ ...LABEL, fontSize: 8 }}>{t.effort}</Text>
            </Column>
          </Row>
          {p.results.map((r) => (
            <Row key={r.code} style={{ gap: 12, padding: [10, 0], alignItems: "center", border: { bottom: hair } }}>
              <Column style={{ gap: 1 }}>
                <Text style={{ fontSize: 10.5, fontWeight: 500 }}>{r.name}</Text>
                <Text style={{ fontSize: 8.5, color: MUTED }}>{r.teacher}</Text>
              </Column>
              <Column style={{ width: BAR }}>
                <ResultBar score={r.score} average={r.classAverage} max={max} width={BAR} height={8} color={r.band >= file.settings.scale.bands.length - 1 ? "#B98A5E" : accent} />
              </Column>
              <Column style={{ width: 48 }}>
                <Text style={{ fontSize: 10.5, fontWeight: 600, textAlign: "right" }}>{fmt.score(r.score)}</Text>
              </Column>
              <Column style={{ width: 36 }}>
                <GradeChip grade={r.grade} background={chip(r.band).bg} color={chip(r.band).fg} size={9.5} width={36} />
              </Column>
              <Column style={{ width: 82 }}>
                <Text style={{ fontSize: 9, color: MUTED }}>{r.effortLabel}</Text>
              </Column>
            </Row>
          ))}
        </Column>
        <KeyRow items={key} bands={chip} size={8} />
      </Document.Page>

      <Document.Page style={{ gap: 18 }}>
        <Column style={{ gap: 10, padding: [8, 0, 0] }}>
          <SectionHead>{t.comment}</SectionHead>
          <Grid columns={2} style={{ gap: 18, rowGap: 12 }}>
            {p.results.map((r) => (
              <Column key={r.code} style={{ gap: 4, padding: [8, 0, 0], border: { top: `2px solid ${chip(r.band).bg === "#F1E4D3" ? "#B98A5E" : chip(r.band).bg}` } }}>
                <Row style={{ gap: 8, alignItems: "center" }}>
                  <Text style={{ fontFamily: SERIF, fontSize: 11.5, fontWeight: 600 }}>{r.name}</Text>
                  <Column style={{ width: 72 }}>
                    <Text style={{ fontSize: 9, textAlign: "right", fontWeight: 600 }}>{`${fmt.score(r.score)} · ${r.grade}`}</Text>
                  </Column>
                </Row>
                <Text style={{ fontFamily: SERIF, fontSize: 9.5, lineHeight: 1.45 }}>{r.comment}</Text>
                <Text style={{ fontSize: 7.5, color: MUTED }}>{`${r.teacher} · ${t.effort}: ${r.effortLabel}`}</Text>
              </Column>
            ))}
          </Grid>
        </Column>
        <Row style={{ gap: 24 }}>
          <Column style={{ gap: 6, width: 420 }}>
            <SectionHead>{t.tutorComment}</SectionHead>
            <Text style={{ fontFamily: SERIF, fontSize: 11, lineHeight: 1.5 }}>{p.pupil.tutorComment}</Text>
            <Text style={{ fontSize: 8.5, color: MUTED }}>{file.class.tutor}</Text>
          </Column>
          <Column style={{ gap: 6 }}>
            <SectionHead>{t.headComment}</SectionHead>
            <Text style={{ fontFamily: SERIF, fontSize: 11, lineHeight: 1.5 }}>{p.pupil.headComment}</Text>
            <Text style={{ fontSize: 8.5, color: MUTED }}>{`${s.head.name}, ${s.head.title}`}</Text>
          </Column>
        </Row>
        <Row style={{ gap: 24 }}>
          <Column style={{ gap: 6, width: 420 }}>
            <SectionHead>{t.targets}</SectionHead>
            {p.pupil.targets.map((x, i) => (
              <Row key={x} style={{ gap: 8 }}>
                <Column style={{ width: 14 }}>
                  <Text style={{ fontSize: 10, fontWeight: 600, color: accent }}>{String(i + 1)}</Text>
                </Column>
                <Text style={{ fontSize: 10 }}>{x}</Text>
              </Row>
            ))}
          </Column>
          <Column style={{ gap: 6 }}>
            <SectionHead>{t.dates}</SectionHead>
            {file.term.dates.map((d) => (
              <Text key={d.date} style={{ fontSize: 9.5 }}>
                {`${fmt.weekday(d.date)} · ${d.label}`}
              </Text>
            ))}
          </Column>
        </Row>
        <Row style={{ gap: 32, padding: [22, 0, 0] }}>
          {[file.class.tutor, `${s.head.name}, ${s.head.title}`, p.pupil.guardian.name].map((who) => (
            <Column key={who} style={{ gap: 6, padding: [8, 0, 0], border: { top: `1px solid ${INK}` } }}>
              <Text style={{ fontSize: 8, color: MUTED }}>{`${t.signedBy} · ${who}`}</Text>
            </Column>
          ))}
        </Row>
        <Text style={{ fontSize: 8, color: MUTED }}>{`${t.effortKey}: ${file.settings.effort.map((e, i) => `${i + 1} ${e}`).join(" · ")}`}</Text>
      </Document.Page>
      {footer}
    </Document>
  );
}
