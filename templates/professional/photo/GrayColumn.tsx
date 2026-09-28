import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit, trackFor, fitWords } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, SideContact, SideEducation, SideLanguages, SideSkills, type SideStyle } from "./parts";

const SIDE = 186;
/** Width of the name beside the side column. */
const NAME_W = 595 - SIDE - 24 - 34;

/** Light grey column with a ringed photo; letter-spaced accent headings and a dotted timeline for experience. */
export function GrayColumn({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2e2e2e", muted: "#6f6f6f", accent };
  const heading = (title: string, size: number) => (
    <Text style={{ ...hf, fontSize: size, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.8, marginBottom: 7 }}>{title}</Text>
  );
  const kit: Kit = {
    s: baseKitStyles(p, 9.2, { entryTitle: { fontSize: 9.3, textTransform: "uppercase", letterSpacing: 0.3 }, entrySubtitle: { color: p.muted }, section: { marginTop: 10 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => heading(title, 11),
    rail: {
      style: { borderLeftWidth: 1, borderLeftColor: tint(accent, 0.55), paddingLeft: 13, marginLeft: 4 },
      marker: <View style={{ position: "absolute", left: -4.5, top: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />,
      gap: 9,
    },
  };
  const st: SideStyle = {
    heading: (title) => heading(title, 10),
    text: { fontSize: 8.6, color: "#333333", lineHeight: 1.4 },
    strong: { fontSize: 8.7, color: "#222222", fontWeight: 700 },
    muted: { fontSize: 8, color: "#777777" },
    iconColor: accent,
    gap: 16,
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 34, paddingBottom: 40, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE, backgroundColor: "#eef0f3" }} />}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDE, paddingHorizontal: 20 }}>
          <Avatar doc={doc} size={116} ring={3} ringColor={accent} gap={4} fallbackBg={tint(accent, 0.2)} style={{ alignSelf: "center", marginBottom: 22 }} />
          <SideContact doc={doc} st={st} width={SIDE - 40} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
          <SideEducation doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 24, paddingRight: 34 }}>
          <View style={{ marginTop: 24, marginBottom: 14 }}>
            <Text style={{ ...hf, fontSize: fitWords(h.fullName, NAME_W, 21, { upper: true, tracking: 2 }), fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: trackFor(h.fullName, 2) }}>{h.fullName}</Text>
            {hasText(h.jobTitle) ? <Text style={{ fontSize: 10.5, color: p.muted, letterSpacing: trackFor(h.jobTitle, 1.5), marginTop: 4 }}>{h.jobTitle}</Text> : null}
          </View>
          {renderSections(kit, doc, ["summary", "experience", "projects", "certifications", "references"])}
        </View>
      </View>
    </PdfDocument>
  );
}
