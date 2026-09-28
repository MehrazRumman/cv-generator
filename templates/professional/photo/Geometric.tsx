import { Polygon, Svg, Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit, fitWords } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, Icon, SECTION_ICON, SideContact, SideLanguages, SideSkills, SideSummary, splitName, type IconName, type SideStyle } from "./parts";

const LEFT = 176;
const GOLD = "#f5c542";

/** Bold corner shapes, a gold-ringed photo, icon headings and a dotted timeline. */
export function Geometric({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2b2b2b", muted: "#6b6b6b", accent };
  const iconHeading = (title: string, icon: IconName, size: number) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
      <View style={{ marginRight: 6 }}>
        <Icon name={icon} size={size} color={accent} strokeWidth={2.2} />
      </View>
      <Text style={{ ...hf, fontSize: size, fontWeight: 700, color: accent }}>{title}</Text>
    </View>
  );
  const kit: Kit = {
    s: baseKitStyles(p, 9.2, { entryTitle: { textTransform: "uppercase", fontSize: 9.2 }, entryDate: { color: accent, fontWeight: 700 }, section: { marginTop: 10 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title, id }) => iconHeading(title, id && id in SECTION_ICON ? SECTION_ICON[id as keyof typeof SECTION_ICON] : "star", 11.5),
    rail: {
      style: { borderLeftWidth: 1, borderLeftColor: tint(accent, 0.6), paddingLeft: 12, marginLeft: 4 },
      marker: <View style={{ position: "absolute", left: -4.5, top: 2, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: accent, backgroundColor: "#ffffff" }} />,
      gap: 8,
    },
  };
  const st: SideStyle = {
    heading: (title, icon) => iconHeading(title, icon, 10.5),
    text: { fontSize: 8.6, color: "#3a3a3a", lineHeight: 1.4 },
    strong: { fontSize: 8.8, color: "#222222", fontWeight: 700 },
    muted: { fontSize: 8, color: "#777777" },
    iconColor: accent,
    gap: 15,
  };
  const h = doc.data.header;
  const { first, last } = splitName(h.fullName);
  // Beside the photo, left of the corner shapes.
  const nameSize = fitWords(h.fullName, 595 - 72 - 90 - 128 - 22, 28);
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ paddingTop: 36, paddingBottom: 60, paddingHorizontal: 36, color: p.text }}
      background={
        <Svg fixed width={120} height={56} viewBox="0 0 120 56" style={{ position: "absolute", bottom: 0, left: 0 }}>
          <Polygon points="0,12 0,56 80,56" fill={accent} />
          <Polygon points="0,0 0,6 104,56 120,56" fill={GOLD} />
        </Svg>
      }
    >
      {/* Page-1 corner shapes */}
      <Svg width={250} height={130} viewBox="0 0 250 130" style={{ position: "absolute", top: 0, right: 0 }}>
        <Polygon points="70,0 250,0 250,130" fill={accent} />
        <Polygon points="30,0 58,0 250,118 250,130 232,130" fill={GOLD} />
      </Svg>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingRight: 90 }}>
        <Avatar doc={doc} size={128} ring={6} ringColor={GOLD} gap={0} fallbackBg={accent} />
        <View style={{ marginLeft: 22, flex: 1 }}>
          <Text style={{ ...hf, fontSize: nameSize, fontWeight: 700, color: accent, lineHeight: 1.05 }}>{first}</Text>
          {last ? <Text style={{ ...hf, fontSize: nameSize, fontWeight: 700, color: accent, lineHeight: 1.05 }}>{last}</Text> : null}
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 11, color: p.muted, marginTop: 6 }}>{h.jobTitle}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: LEFT, paddingRight: 16, borderRightWidth: 0.6, borderRightColor: "#dddddd" }}>
          <SideSummary doc={doc} st={st} />
          <SideContact doc={doc} st={st} width={LEFT - 16} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 18 }}>{renderSections(kit, doc, ["education", "experience", "projects", "certifications", "references"])}</View>
      </View>
    </PdfDocument>
  );
}
