import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, SideContact, SideEducation, SideLanguages, SideSkills, splitName, type SideStyle } from "./parts";

const SIDE = 190;

/** Dark column with a round photo, contact icons, education, skills and languages; experience on the right. */
export function NavySidebar({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2b2b2b", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.3, { entrySubtitle: { color: p.muted }, entryDate: { color: p.text }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1.2, borderBottomColor: accent, paddingBottom: 3, marginBottom: 7 }}>
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.6 }}>{title}</Text>
      </View>
    ),
  };
  const st: SideStyle = {
    heading: (title) => (
      <View style={{ borderBottomWidth: 0.8, borderBottomColor: tint(accent, 0.55), paddingBottom: 3, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: 1.4 }}>{title}</Text>
      </View>
    ),
    text: { fontSize: 8.6, color: "#e8edf3", lineHeight: 1.35 },
    strong: { fontSize: 8.8, color: "#ffffff", fontWeight: 700 },
    muted: { fontSize: 8, color: tint(accent, 0.6) },
    iconColor: "#ffffff",
  };
  const h = doc.data.header;
  const { first, last } = splitName(h.fullName);
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 34, paddingBottom: 40, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE, backgroundColor: accent }} />}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDE, paddingHorizontal: 20 }}>
          <Avatar doc={doc} size={118} ring={3} ringColor="#ffffff" gap={3} fallbackBg={tint(accent, 0.25)} style={{ alignSelf: "center", marginBottom: 22 }} />
          <SideContact doc={doc} st={st} width={SIDE - 40} />
          <SideEducation doc={doc} st={st} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 24, paddingRight: 34 }}>
          <View style={{ marginTop: 26, marginBottom: 12 }}>
            <Text style={{ ...hf, fontSize: 25, color: "#1f1f1f", textTransform: "uppercase", letterSpacing: 1 }}>
              <Text style={{ fontWeight: 700 }}>{first} </Text>
              <Text>{last}</Text>
            </Text>
            {hasText(h.jobTitle) ? (
              <Text style={{ fontSize: 10.5, color: p.muted, textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>{h.jobTitle}</Text>
            ) : null}
          </View>
          {renderSections(kit, doc, ["summary", "experience", "projects", "certifications", "references"])}
        </View>
      </View>
    </PdfDocument>
  );
}
