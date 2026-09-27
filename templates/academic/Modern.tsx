import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

/** Left-aligned header with an accent rule, coloured headings. Modelled on Awesome-CV (LaTeX, LPPL). */
export function AcademicModern({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#666666", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.7, {
      entrySubtitle: { color: p.muted },
      entryDate: { color: accent },
      bullet: { color: accent },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 12.5, fontWeight: 700, color: accent }}>{title}</Text>
        <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: tint(accent, 0.55), marginLeft: 8 }} />
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9.8, fontWeight: 700, color: p.muted, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.5, lineHeight: 1.4, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — Curriculum Vitae`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ borderLeftWidth: 4, borderLeftColor: accent, paddingLeft: 12, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{h.fullName}</Text>
        {hasText(h.designation) ? <Text style={{ fontSize: 11.5, color: accent, marginTop: 2 }}>{h.designation}</Text> : null}
        {hasText(h.department) || hasText(h.institution) ? (
          <Text style={{ fontSize: 10, color: p.muted, marginTop: 1 }}>{joinParts([h.department, h.institution], ", ")}</Text>
        ) : null}
        <View style={{ marginTop: 5 }}>
          <LinkRow links={academicLinks(doc)} style={{ fontSize: 9, color: p.muted }} linkColor={accent} align="flex-start" />
        </View>
      </View>
      {renderAcademicSections(kit, x, doc)}
    </PdfDocument>
  );
}
