import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

const MARGIN_X = 44;
const MARGIN_TOP = 36;

/** Full-width colour banner with name, position and profile links. Modelled on JSON Resume's "flat" theme (MIT). */
export function AcademicBanner({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#666666", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.7, { entrySubtitle: { color: accent }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</Text>
        <View style={{ width: 28, borderBottomWidth: 2, borderBottomColor: accent, marginTop: 2 }} />
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9.8, fontWeight: 700, color: p.muted, marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.5, lineHeight: 1.4, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — Curriculum Vitae`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: MARGIN_TOP, paddingBottom: 44, paddingHorizontal: MARGIN_X, color: p.text }}
    >
      <View style={{ marginTop: -MARGIN_TOP, marginHorizontal: -MARGIN_X, paddingHorizontal: MARGIN_X, paddingVertical: 24, backgroundColor: accent, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 25, fontWeight: 700, color: "#ffffff" }}>{h.fullName}</Text>
        {hasText(h.designation) || hasText(h.department) || hasText(h.institution) ? (
          <Text style={{ fontSize: 11, color: tint(accent, 0.72), marginTop: 3 }}>{joinParts([h.designation, h.department, h.institution], ", ")}</Text>
        ) : null}
        <View style={{ marginTop: 8 }}>
          <LinkRow links={academicLinks(doc)} style={{ fontSize: 9, color: "#ffffff" }} linkColor="#ffffff" align="flex-start" />
        </View>
      </View>
      {renderAcademicSections(kit, x, doc)}
    </PdfDocument>
  );
}
