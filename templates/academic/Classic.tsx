import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

/** Traditional academic CV: centred header, small-caps headings over a rule. Modelled on the Harvard/OCS academic CV guide. */
export function AcademicClassic({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#1a1a1a", muted: "#555555", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 10, { entrySubtitle: { fontStyle: "italic" }, entryDate: { color: p.text } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 0.7, borderBottomColor: accent, marginBottom: 6, paddingBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</Text>
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 10, fontWeight: 700, fontStyle: "italic", marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.8, lineHeight: 1.4, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — Curriculum Vitae`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ alignItems: "center", marginBottom: 4 }}>
        <Text style={{ ...hf, fontSize: 22, fontWeight: 700 }}>{h.fullName}</Text>
        {hasText(h.designation) ? <Text style={{ fontSize: 11.5, marginTop: 3 }}>{h.designation}</Text> : null}
        {hasText(h.department) || hasText(h.institution) ? (
          <Text style={{ fontSize: 10.5, color: p.muted, marginTop: 1, textAlign: "center" }}>{joinParts([h.department, h.institution], ", ")}</Text>
        ) : null}
        <View style={{ marginTop: 5 }}>
          <LinkRow links={academicLinks(doc)} style={{ fontSize: 9.3, color: p.muted }} linkColor={accent} separator="|" />
        </View>
      </View>
      {renderAcademicSections(kit, x, doc)}
    </PdfDocument>
  );
}
