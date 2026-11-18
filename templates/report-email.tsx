/**
 * Term Report: the email to parents.
 *
 * Sent the evening reports go out. It gives a family the shape of the term in one screen (the
 * average and its grade, attendance, any awards), every subject as a grade chip, the tutor's
 * comment in full and the dates that matter next, then links to the full report. Chips are boxes
 * of text, not images, so the summary reads with images off and in classic Outlook.
 */
import { Button, Column, Divider, Email, Heading, Row, Section, Text, token } from "@hyper-elements/react";
import { context, type TemplateProps } from "../src/context";
import { Crest, Fact, GradeChip, LABEL } from "../src/parts";
import { MUTED, SERIF } from "../src/theme";

export const meta = {
  title: "Term Report parent email",
  description: "The report-day email to a family: average, attendance and awards first, every subject as a grade, the tutor's comment and what's next.",
  root: "Email",
};

export default function ReportEmail(props: TemplateProps) {
  const { file, p, fmt, theme, accent, lang, chip } = context(props);
  const { t, fill } = fmt;
  const s = file.school;
  const first = p.pupil.firstName;
  return (
    <Email theme={theme} width={600} lang={lang} title={`${fill(t.reportFor, { name: p.pupil.name })} · ${s.name}`} previewText={`${fill(t.readyLine, { name: first, term: file.term.name })} ${t.attendance}: ${fmt.percent(p.attendance.percent)}.`}>
      <Section style={{ padding: [32, 24, 20], mobile: { padding: [24, 16, 16] } }}>
        <Row style={{ alignItems: "center", gap: 14 }} stackOnMobile={false}>
          <Column style={{ width: 44 }}>
            <Crest letters={s.monogram} color={accent} size={44} />
          </Column>
          <Column style={{ width: 300, gap: 2 }}>
            <Text style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 18, lineHeight: 1.2 }}>{s.name}</Text>
            <Text style={{ fontSize: 13, color: MUTED }}>{`${file.class.year} · ${file.class.name}`}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ padding: [0, 24], mobile: { padding: [0, 12] } }}>
        <Column style={{ apply: ["card"], gap: 26, mobile: { padding: 20 } }}>
          <Column style={{ gap: 10 }}>
            <Text>{fill(t.greeting, { name: p.pupil.guardian.name })}</Text>
            <Heading level={1} style={{ fontSize: 28, mobile: { fontSize: 24 } }}>
              {fill(t.readyLine, { name: first, term: file.term.name })}
            </Heading>
          </Column>

          <Row style={{ gap: 16, padding: [18, 0], border: { top: `2px solid ${accent}`, bottom: { width: 1, style: "solid", color: token("colors.border") } } }}>
            <Column style={{ width: 150 }}>
              <Fact label={t.average} value={`${fmt.score(p.average, 1)} · ${p.grade}`} size={22} color={accent} serif />
            </Column>
            <Column style={{ width: 140 }}>
              <Fact label={t.attendance} value={fmt.percent(p.attendance.percent)} size={22} serif />
            </Column>
            <Column style={{ width: 120 }}>
              <Fact label={t.awards} value={String(p.awards.length)} size={22} serif />
            </Column>
          </Row>

          {p.awards.length ? (
            <Column style={{ backgroundColor: token("colors.wash"), padding: [14, 16], gap: 4 }}>
              {p.awards.map((a) => (
                <Text key={a.code} style={{ fontSize: 15 }}>
                  {`${a.title}: ${a.description}`}
                </Text>
              ))}
            </Column>
          ) : null}

          <Column style={{ gap: 0 }}>
            <Text style={{ ...LABEL, color: "#1B1D22", padding: [0, 0, 8], border: { bottom: "1px solid #1B1D22" } }}>{t.subjects}</Text>
            {p.results.map((r) => (
              <Row key={r.code} style={{ gap: 12, padding: [9, 0], alignItems: "center", border: { bottom: { width: 1, style: "solid", color: token("colors.border") } } }} stackOnMobile={false}>
                <Column style={{ width: 300 }}>
                  <Text style={{ fontSize: 15 }}>{r.name}</Text>
                </Column>
                <Column style={{ width: 106 }}>
                  <Text style={{ fontSize: 14, color: MUTED, textAlign: "right" }}>{r.gradeLabel}</Text>
                </Column>
                <Column style={{ width: 40 }}>
                  <GradeChip grade={r.grade} background={chip(r.band).bg} color={chip(r.band).fg} size={13} width={40} />
                </Column>
              </Row>
            ))}
          </Column>

          <Column style={{ gap: 8 }}>
            <Text style={LABEL}>{`${t.tutorComment} · ${file.class.tutor}`}</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.5 }}>{p.pupil.tutorComment}</Text>
          </Column>

          <Column style={{ gap: 12 }}>
            <Button href={p.url} style={{ mobile: { width: "100%" } }}>
              {t.openReport}
            </Button>
            <Text style={{ fontSize: 14, color: MUTED }}>{t.pdfAttached}</Text>
          </Column>
        </Column>
      </Section>

      <Section style={{ padding: [24, 24, 40], mobile: { padding: [20, 16, 32] } }}>
        <Column style={{ gap: 10 }}>
          <Text style={{ ...LABEL }}>{t.dates}</Text>
          {file.term.dates.map((d) => (
            <Text key={d.date} style={{ fontSize: 14 }}>
              {`${fmt.weekday(d.date)} · ${d.label}`}
            </Text>
          ))}
          <Divider />
          <Text style={{ fontSize: 14, color: MUTED }}>{fill(t.questions, { email: s.email })}</Text>
          <Text style={{ fontSize: 13, color: MUTED }}>{`${s.name}, ${s.address.join(", ")} · ${s.phone}`}</Text>
        </Column>
      </Section>
    </Email>
  );
}
