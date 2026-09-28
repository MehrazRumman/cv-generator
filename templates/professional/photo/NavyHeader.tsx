import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit, trackFor } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, fitText, IconBadge, SECTION_ICON, SideContact, SideLanguages, SideReferences, SideSkills, type SideStyle } from "./parts";

const LEFT = 176;
const BAND = 104;
const BADGE = 16;
/** Width available for the name inside the header band. */
const NAME_W = 595 - 64 - LEFT - 14;

/** Dark header band with the photo overlapping it; icon badges on a timeline in the main column. */
export function NavyHeader({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2b2b2b", muted: "#6b6b6b", accent };
  const line = tint(accent, 0.55);
  const kit: Kit = {
    s: baseKitStyles(p, 9.2, { entrySubtitle: { color: p.muted }, section: { marginTop: 10 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title, id }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <IconBadge name={id && id in SECTION_ICON ? SECTION_ICON[id as keyof typeof SECTION_ICON] : "star"} size={BADGE} bg={accent} color="#ffffff" />
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2, marginLeft: 8 }}>{title}</Text>
      </View>
    ),
    rail: {
      style: { borderLeftWidth: 1, borderLeftColor: line, paddingLeft: 16, marginLeft: BADGE / 2 - 0.5 },
      marker: <View style={{ position: "absolute", left: -3.5, top: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />,
      gap: 8,
    },
  };
  const st: SideStyle = {
    heading: (title) => (
      <View style={{ borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 2, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</Text>
      </View>
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
      {/* Page-1 header band */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAND + 30, backgroundColor: accent }} />
      <View style={{ flexDirection: "row", height: BAND }}>
        <View style={{ width: LEFT }} />
        <View style={{ flex: 1, justifyContent: "center", paddingLeft: 14 }}>
          <Text style={{ ...hf, fontSize: fitText(h.fullName, NAME_W, 26, { upper: true, tracking: 1 }), fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: trackFor(h.fullName, 1) }}>
            {h.fullName}
          </Text>
          {hasText(h.jobTitle) ? (
            <Text style={{ fontSize: fitText(h.jobTitle, NAME_W, 10.5, { upper: true, tracking: 2, min: 7.5 }), color: tint(accent, 0.7), textTransform: "uppercase", letterSpacing: trackFor(h.jobTitle, 2), marginTop: 4 }}>
              {h.jobTitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Avatar doc={doc} size={132} ring={5} ringColor="#ffffff" fallbackBg={tint(accent, 0.3)} style={{ position: "absolute", top: 64, left: 44 }} />
      <View style={{ flexDirection: "row", marginTop: 18 }}>
        <View style={{ width: LEFT, paddingRight: 16, paddingTop: 76, borderRightWidth: 0.6, borderRightColor: "#d6d6d6" }}>
          <SideContact doc={doc} st={st} width={LEFT - 16} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
          <SideReferences doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 16 }}>{renderSections(kit, doc, ["summary", "experience", "education", "projects", "certifications"])}</View>
      </View>
    </PdfDocument>
  );
}
