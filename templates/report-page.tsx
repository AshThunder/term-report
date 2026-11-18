/**
 * Term Report: the report on the web.
 *
 * What the email's button opens, on the parents' portal. The term in a band at the top (average,
 * attendance, awards), then one card per subject: the grade chip, the result against the class
 * average as a bar, effort, and the teacher's comment in full. On a phone the cards are a single
 * column and the bars shorten.
 */
import { Button, Column, Grid, Heading, Page, Row, Section, Text, token } from "@hyper-elements/react";
import { context, type TemplateProps } from "../src/context";
import { Crest, Fact, GradeChip, KeyRow, LABEL, ResultBar } from "../src/parts";
import { INK, MUTED, SERIF } from "../src/theme";

export const meta = {
  title: "Term Report web report",
  description: "A pupil's term report as a responsive page: the term at a glance, then a card per subject with grade, bar, effort and comment.",
  root: "Page",
};

const FONTS = [
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2", format: "woff2", weight: "100 900" },
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-ext-wght-normal.woff2", format: "woff2", weight: "100 900" },
  { family: "Source Serif Pro", src: "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-pro@latest/latin-400-normal.woff2", format: "woff2", weight: 400 },
  { family: "Source Serif Pro", src: "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-pro@latest/latin-600-normal.woff2", format: "woff2", weight: 600 },
] as const;

export default function ReportPage(props: TemplateProps & { pdfHref?: string }) {
  const { file, p, fmt, theme, accent, lang, chip, key } = context(props);
  const { t, fill } = fmt;
  const s = file.school;
  const max = file.settings.scale.max;
  const pdfHref = props.pdfHref ?? "report.pdf";
  const card = (r: (typeof p.results)[number], barWidth: number) => (
    <Column key={r.code} style={{ apply: ["card"], padding: 24, gap: 14, mobile: { padding: 18 } }}>
      <Row style={{ gap: 12, alignItems: "start" }} stackOnMobile={false}>
        <Column style={{ gap: 2 }}>
          <Heading level={3} style={{ fontSize: 19 }}>
            {r.name}
          </Heading>
          <Text style={{ fontSize: 14, color: MUTED }}>{r.teacher}</Text>
        </Column>
        <Column style={{ width: 46 }}>
          <GradeChip grade={r.grade} background={chip(r.band).bg} color={chip(r.band).fg} size={16} width={46} />
        </Column>
      </Row>
      <Row style={{ gap: 12, alignItems: "center" }} stackOnMobile={false}>
        <ResultBar score={r.score} average={r.classAverage} max={max} width={barWidth} color={chip(r.band).bg === "#F1E4D3" ? "#B98A5E" : accent} />
        <Column style={{ width: 64 }}>
          <Text style={{ fontSize: 15, fontWeight: 600, textAlign: "right" }}>{fmt.score(r.score)}</Text>
        </Column>
      </Row>
      <Text style={{ fontSize: 13, color: MUTED }}>{`${t.classAverage} ${fmt.score(r.classAverage, 1)} · ${t.effort}: ${r.effortLabel}`}</Text>
      <Text style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.55 }}>{r.comment}</Text>
    </Column>
  );
  return (
    <Page theme={theme} width={1080} lang={lang} title={`${fill(t.reportFor, { name: p.pupil.name })} · ${s.name}`} description={`${t.termReport}, ${file.term.name}`} fonts={[...FONTS]} style={{ gap: 0 }}>
      <Section style={{ backgroundColor: token("colors.card"), padding: [18, 32], border: { bottom: { width: 1, style: "solid", color: token("colors.border") } }, mobile: { padding: [14, 16] } }}>
        <Row style={{ alignItems: "center", gap: 14 }} stackOnMobile={false}>
          <Column style={{ width: 44 }}>
            <Crest letters={s.monogram} color={accent} size={44} />
          </Column>
          <Column style={{ gap: 0 }}>
            <Text style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 18, lineHeight: 1.2 }}>{s.name}</Text>
            <Text style={{ fontSize: 13, color: MUTED }}>{t.parentsPortal}</Text>
          </Column>
          <Column style={{ width: 200, alignItems: "end" }} hidden={{ mobile: true }}>
            <Button href={pdfHref} style={{ padding: [10, 18], fontSize: 14 }}>
              PDF
            </Button>
          </Column>
        </Row>
      </Section>

      <Section style={{ padding: [48, 32, 32], gap: 28, mobile: { padding: [28, 16, 20], gap: 20 } }}>
        <Column style={{ gap: 8 }}>
          <Text style={{ ...LABEL, color: accent }}>{`${t.termReport} · ${file.term.name}`}</Text>
          <Heading level={1} style={{ fontSize: 48, letterSpacing: -0.8, mobile: { fontSize: 34 } }}>
            {p.pupil.name}
          </Heading>
          <Text style={{ fontSize: 15, color: MUTED }}>{`${file.class.year} · ${file.class.name} · ${t.tutor}: ${file.class.tutor} · ${t.reportDate}: ${fmt.date(file.term.reportDate)}`}</Text>
        </Column>
        <Grid columns={4} style={{ gap: 0, backgroundColor: token("colors.card"), border: `1px solid ${INK}` }}>
          <Column style={{ padding: [20, 22], backgroundColor: accent, color: "#FFFFFF", gap: 6 }}>
            <Text style={{ ...LABEL, color: "#FFFFFF" }}>{t.average}</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.1, fontWeight: 600 }}>{`${fmt.score(p.average, 1)}`}</Text>
            <Text style={{ fontSize: 14 }}>{`${p.grade} · ${p.gradeLabel}`}</Text>
          </Column>
          <Column style={{ padding: [20, 22] }}>
            <Fact label={t.attendance} value={fmt.percent(p.attendance.percent)} size={30} serif />
            <Text style={{ fontSize: 14, color: MUTED }}>{`${fill(t.sessionsOf, { present: String(p.attendance.present), total: String(p.attendance.total) })} · ${t.late}: ${p.attendance.late}`}</Text>
          </Column>
          <Column style={{ padding: [20, 22] }}>
            <Fact label={t.topSubject} value={p.strongest.name} size={22} serif />
            <Text style={{ fontSize: 14, color: MUTED }}>{`${fmt.score(p.strongest.score)} · ${p.strongest.grade}`}</Text>
          </Column>
          <Column style={{ padding: [20, 22] }}>
            <Fact label={t.awards} value={String(p.awards.length)} size={30} serif />
            <Text style={{ fontSize: 14, color: MUTED }}>{p.awards.length ? p.awards.map((a) => (a.subject ? file.subjects.find((x) => x.code === a.subject)?.name : a.title)).join(", ") : t.noAwards}</Text>
          </Column>
        </Grid>
      </Section>

      <Section style={{ padding: [0, 32, 32], gap: 16, mobile: { padding: [0, 16, 20] } }}>
        <Heading level={2} style={{ ...LABEL, fontSize: 12, color: INK, fontFamily: undefined }}>
          {t.subjects}
        </Heading>
        <Column hidden={{ mobile: true }}>
          <Grid columns={3} style={{ gap: 20 }}>
            {p.results.map((r) => card(r, 180))}
          </Grid>
        </Column>
        <Column hidden={{ desktop: true }} style={{ gap: 14 }}>
          {p.results.map((r) => card(r, 220))}
        </Column>
      </Section>

      <Section style={{ padding: [0, 32, 56], mobile: { padding: [0, 16, 32] } }}>
        <Row style={{ gap: 20 }}>
          <Column style={{ apply: ["card"], gap: 16, width: 640, mobile: { padding: 20 } }}>
            <Heading level={2}>{t.tutorComment}</Heading>
            <Text style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.55 }}>{p.pupil.tutorComment}</Text>
            <Text style={{ fontSize: 14, color: MUTED }}>{file.class.tutor}</Text>
            <Column style={{ gap: 6, padding: [12, 0, 0], border: { top: { width: 1, style: "solid", color: token("colors.border") } } }}>
              <Text style={LABEL}>{t.targets}</Text>
              {p.pupil.targets.map((x) => (
                <Text key={x} style={{ fontSize: 15 }}>{`– ${x}`}</Text>
              ))}
            </Column>
          </Column>
          <Column style={{ gap: 20 }}>
            <Column style={{ apply: ["card"], gap: 10, padding: 24, mobile: { padding: 20 } }}>
              <Heading level={2} style={{ fontSize: 17 }}>
                {t.dates}
              </Heading>
              {file.term.dates.map((d) => (
                <Text key={d.date} style={{ fontSize: 15 }}>
                  {`${fmt.weekday(d.date)}: ${d.label}`}
                </Text>
              ))}
            </Column>
            <Column style={{ gap: 10, padding: [0, 4] }}>
              <Text style={LABEL}>{t.gradingKey}</Text>
              <KeyRow items={key} bands={chip} size={13} columns={1} />
            </Column>
          </Column>
        </Row>
        <Column style={{ padding: [24, 0, 0], gap: 6 }}>
          <Text style={{ fontSize: 14, color: MUTED }}>{fill(t.questions, { email: s.email })}</Text>
          <Text style={{ fontSize: 14, color: MUTED }}>{`${s.name}, ${s.address.join(", ")} · ${s.phone}`}</Text>
        </Column>
        <Column hidden={{ desktop: true }} style={{ padding: [16, 0, 0] }}>
          <Button href={pdfHref} style={{ width: "100%" }}>
            PDF
          </Button>
        </Column>
      </Section>
    </Page>
  );
}
