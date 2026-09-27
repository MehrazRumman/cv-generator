import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

const GUTTER = 86;

/** Dates in a left gutter with accent bars — the moderncv "classic" look (LaTeX, LPPL). */
export function AcademicTimeline({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#6f6f6f", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, { entryDate: { fontSize: 9 }, entrySubtitle: { fontStyle: "italic" }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "dateColumn",
    dateColumnWidth: GUTTER,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ width: GUTTER - 8, height: 5, backgroundColor: tint(accent, 0.35), marginRight: 8 }} />
        <Text style={{ ...hf, fontSize: 12.5, color: accent }}>{title}</Text>
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9.8, fontStyle: "italic", color: accent, marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.4, lineHeight: 1.4, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — Curriculum Vitae`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ ...hf, fontSize: 26, color: accent }}>{h.fullName}</Text>
        {hasText(h.designation) ? <Text style={{ fontSize: 12, color: p.muted, fontStyle: "italic", marginTop: 1 }}>{h.designation}</Text> : null}
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
