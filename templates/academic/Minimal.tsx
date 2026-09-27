import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, PdfDocument, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

/** Quiet, generous spacing and letter-spaced grey headings. Modelled on JSON Resume minimalist themes (MIT). */
export function AcademicMinimal({ doc }: { doc: PreparedAcademic }) {
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#303030", muted: "#8a8a8a", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.5, { entryTitle: { fontWeight: 600 }, section: { marginTop: 14 }, bullet: { color: "#bbbbbb" }, label: { fontWeight: 600 } }),
    bulletChar: "–",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <Text style={{ fontSize: 8.5, color: p.muted, textTransform: "uppercase", letterSpacing: 2.2, marginBottom: 8 }}>{title}</Text>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9.3, color: accent, marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.3, lineHeight: 1.45, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — Curriculum Vitae`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 52, paddingBottom: 50, paddingHorizontal: 56, color: p.text }}
    >
      <View style={{ marginBottom: 6 }}>
        <Text style={{ fontSize: 22, fontWeight: 600, color: "#111111" }}>{h.fullName}</Text>
        {hasText(h.designation) || hasText(h.institution) ? (
          <Text style={{ fontSize: 10.5, color: accent, marginTop: 3 }}>{joinParts([h.designation, h.department, h.institution], ", ")}</Text>
        ) : null}
        <View style={{ marginTop: 7 }}>
          <LinkRow links={academicLinks(doc)} style={{ fontSize: 8.8, color: p.muted }} linkColor={p.muted} separator=" " align="flex-start" />
        </View>
      </View>
      {renderAcademicSections(kit, x, doc)}
    </PdfDocument>
  );
}
