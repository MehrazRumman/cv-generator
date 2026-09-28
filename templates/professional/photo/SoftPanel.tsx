import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit, trackFor } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, fitText, SideContact, SideEducation, SideLanguages, SideSkills, type SideStyle } from "./parts";

const LEFT = 182;
const BAND = 112;
/** Width available for the name inside the band. */
const NAME_W = 595 - 64 - 170;

/** A soft header band with a spaced-out name, the photo overlapping it, and a rounded side panel. */
export function SoftPanel({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2f2f2f", muted: "#6b6b6b", accent };
  const panel = tint(accent, 0.9);
  const kit: Kit = {
    s: baseKitStyles(p, 9.2, { entrySubtitle: { color: p.muted }, section: { marginTop: 12 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 0.8, borderBottomColor: "#bfbfbf", paddingBottom: 3, marginBottom: 7 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 600, color: "#333333", textTransform: "uppercase", letterSpacing: 1.6 }}>{title}</Text>
      </View>
    ),
  };
  const st: SideStyle = {
    heading: (title) => (
      <Text style={{ ...hf, fontSize: 10, fontWeight: 600, color: "#333333", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>{title}</Text>
    ),
    text: { fontSize: 8.5, color: "#3a3a3a", lineHeight: 1.4 },
    strong: { fontSize: 8.7, color: "#222222", fontWeight: 700 },
    muted: { fontSize: 8, color: "#777777" },
    iconColor: accent,
    gap: 15,
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ paddingTop: 30, paddingBottom: 42, paddingHorizontal: 32, color: p.text }}>
      {/* Page-1 header band and overlapping photo */}
      <View style={{ position: "absolute", top: 34, left: 150, right: 0, height: BAND, backgroundColor: panel }} />
      <Avatar doc={doc} size={130} ring={5} ringColor="#ffffff" fallbackBg={accent} style={{ position: "absolute", top: 24, left: 40 }} />
      <View style={{ height: BAND - 4, justifyContent: "center", paddingLeft: 170 }}>
        <Text style={{ ...hf, fontSize: fitText(h.fullName, NAME_W, 24, { upper: true, tracking: 4 }), color: "#2b2b2b", textTransform: "uppercase", letterSpacing: trackFor(h.fullName, 4) }}>{h.fullName}</Text>
        {hasText(h.jobTitle) ? (
          <Text style={{ fontSize: fitText(h.jobTitle, NAME_W, 10.5, { lines: 1, tracking: 1.2, min: 8 }), color: p.muted, marginTop: 5, letterSpacing: trackFor(h.jobTitle, 1.2) }}>{h.jobTitle}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", marginTop: 30 }}>
        <View style={{ width: LEFT, backgroundColor: panel, borderRadius: 14, paddingHorizontal: 16, paddingTop: 34, paddingBottom: 10 }}>
          <SideContact doc={doc} st={st} width={LEFT - 32} />
          <SideEducation doc={doc} st={st} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 20 }}>{renderSections(kit, doc, ["summary", "experience", "projects", "certifications", "references"])}</View>
      </View>
    </PdfDocument>
  );
}
