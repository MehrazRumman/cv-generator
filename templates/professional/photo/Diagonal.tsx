import { Polygon, Svg, Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, Icon, SECTION_ICON, SideContact, SideLanguages, SideSkills, SideSummary, type IconName, type SideStyle } from "./parts";

const LEFT = 190;

/** A diagonal colour block behind the photo, serif name, icon headings and a dotted timeline. */
export function Diagonal({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#333333", muted: "#737373", accent };
  const iconHeading = (title: string, icon: IconName) => (
    <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 0.8, borderBottomColor: "#cfcfcf", paddingBottom: 3, marginBottom: 7 }}>
      <View style={{ marginRight: 6 }}>
        <Icon name={icon} size={10.5} color="#444444" strokeWidth={2.2} />
      </View>
      <Text style={{ ...hf, fontSize: 11, fontWeight: 600, color: "#333333" }}>{title}</Text>
    </View>
  );
  const kit: Kit = {
    s: baseKitStyles(p, 9, { entryTitle: { fontSize: 9.3 }, entrySubtitle: { color: accent, fontStyle: "italic" }, section: { marginTop: 10 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title, id }) => iconHeading(title, id && id in SECTION_ICON ? SECTION_ICON[id as keyof typeof SECTION_ICON] : "star"),
    rail: {
      style: { borderLeftWidth: 0.8, borderLeftColor: tint(accent, 0.5), paddingLeft: 12, marginLeft: 4 },
      marker: <View style={{ position: "absolute", left: -4, top: 2.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: accent }} />,
      gap: 8,
    },
  };
  const st: SideStyle = {
    heading: (title, icon) => iconHeading(title, icon),
    text: { fontSize: 8.5, color: "#444444", lineHeight: 1.45 },
    strong: { fontSize: 8.7, color: "#222222", fontWeight: 700 },
    muted: { fontSize: 8, color: "#7a7a7a" },
    iconColor: accent,
    gap: 14,
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ paddingTop: 30, paddingBottom: 42, paddingHorizontal: 34, color: p.text }}>
      {/* Ends above the name so the accent-coloured name never sits on the accent block. */}
      <Svg width={270} height={185} viewBox="0 0 270 185" style={{ position: "absolute", top: 0, left: 0 }}>
        <Polygon points="0,0 270,0 0,172" fill={accent} />
        <Polygon points="0,172 270,0 288,0 0,185" fill={tint(accent, 0.55)} />
      </Svg>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: LEFT, paddingRight: 16 }}>
          <Avatar doc={doc} size={124} ring={4} ringColor="#ffffff" fallbackBg={tint(accent, 0.3)} style={{ alignSelf: "center", marginTop: 6 }} />
          <View style={{ alignItems: "center", marginTop: 12, marginBottom: 18 }}>
            <Text style={{ ...hf, fontSize: 21, color: accent, textAlign: "center" }}>{h.fullName}</Text>
            {hasText(h.jobTitle) ? <Text style={{ fontSize: 10, color: p.muted, marginTop: 3, textAlign: "center" }}>{h.jobTitle}</Text> : null}
          </View>
          <SideContact doc={doc} st={st} width={LEFT - 16} />
          <SideSummary doc={doc} st={st} />
          <SideSkills doc={doc} st={st} />
          <SideLanguages doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 14, paddingTop: 34 }}>{renderSections(kit, doc, ["education", "experience", "projects", "certifications", "references"])}</View>
      </View>
    </PdfDocument>
  );
}
