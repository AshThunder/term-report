/**
 * Term Report: the award certificate, 1600 by 1131 (A4 landscape in proportion).
 *
 * One per award the rules in the class file give: the top result in a subject, full attendance,
 * the most improved, the best average. Made as an image so it can be printed, posted to the
 * parents' portal or shared by a family, with a frame and the school's shield drawn in Svg, the
 * pupil's name set large in the serif, and lines for the two signatures.
 */
import { Canvas, Column, Heading, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { context, type TemplateProps } from "../src/context";
import { LABEL, LetteredShield } from "../src/parts";
import { INK, MUTED, SERIF, tint } from "../src/theme";

export const meta = {
  title: "Term Report award certificate",
  description: "A certificate for each award the class file's rules give, 1600 by 1131, with a drawn frame and shield.",
  root: "Canvas",
};

const W = 1600;
const H = 1131;

export default function Certificate(props: TemplateProps & { award?: string }) {
  const { file, p, fmt, theme, accent, lang } = context(props);
  const { t } = fmt;
  const s = file.school;
  const award = (props.award ? p.awards.find((a) => a.code === props.award) : p.awards[0]) ?? { code: "none", title: t.certificate, description: file.term.name, pupilId: p.pupil.id };
  const subject = award.subject ? file.subjects.find((x) => x.code === award.subject)?.name : undefined;
  return (
    <Canvas theme={theme} width={W} height={H} lang={lang} title={`${award.title} · ${p.pupil.name}`} style={{ padding: 0, backgroundColor: "#FBFAF6", fontFamily: "Inter" }}>
      <Column style={{ width: W, height: H, padding: 44 }}>
        <Column style={{ height: H - 88, border: `3px solid ${accent}`, padding: 14 }}>
          <Column style={{ height: H - 88 - 34, border: `1px solid ${accent}`, padding: [72, 120, 64], alignItems: "center", justifyContent: "space-between" }}>
            <Column style={{ alignItems: "center", gap: 18 }}>
              <LetteredShield color={accent} size={92} letters={s.monogram} />
              <Text style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, letterSpacing: 0.3, textAlign: "center" }}>{s.name}</Text>
              <Svg width={260} height={3}>
                <Rect width={120} height={3} style={{ fill: accent }} />
                <Rect x={140} width={120} height={3} style={{ fill: tint(accent, 0.6) }} />
              </Svg>
            </Column>
            <Column style={{ alignItems: "center", gap: 20 }}>
              <Text style={{ ...LABEL, fontSize: 20, letterSpacing: 4, color: accent, textAlign: "center" }}>{award.title}</Text>
              {subject ? <Text style={{ fontFamily: SERIF, fontSize: 40, fontStyle: "italic", textAlign: "center", color: INK }}>{subject}</Text> : null}
              <Text style={{ fontSize: 22, color: MUTED, textAlign: "center" }}>{t.awardTo}</Text>
              <Heading level={1} style={{ fontFamily: SERIF, fontSize: 104, lineHeight: 1.05, letterSpacing: -1.5, textAlign: "center" }}>
                {p.pupil.name}
              </Heading>
              <Text style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", color: INK, maxWidth: 1000 }}>{award.description}</Text>
            </Column>
            <Row style={{ gap: 120, alignItems: "end", width: 1100 }}>
              <Column style={{ gap: 10, padding: [14, 0, 0], border: { top: `2px solid ${INK}` } }}>
                <Text style={{ fontSize: 20, fontWeight: 600 }}>{s.head.name}</Text>
                <Text style={{ fontSize: 18, color: MUTED }}>{s.head.title}</Text>
              </Column>
              <Column style={{ gap: 10, alignItems: "center", width: 260 }}>
                <Text style={{ fontSize: 20, fontWeight: 600, textAlign: "center" }}>{`${file.class.year} · ${file.class.name}`}</Text>
                <Text style={{ fontSize: 18, color: MUTED, textAlign: "center" }}>{fmt.date(file.term.reportDate)}</Text>
              </Column>
              <Column style={{ gap: 10, padding: [14, 0, 0], border: { top: `2px solid ${INK}` } }}>
                <Text style={{ fontSize: 20, fontWeight: 600, textAlign: "right" }}>{file.class.tutor}</Text>
                <Text style={{ fontSize: 18, color: MUTED, textAlign: "right" }}>{t.tutor}</Text>
              </Column>
            </Row>
          </Column>
        </Column>
      </Column>
    </Canvas>
  );
}
