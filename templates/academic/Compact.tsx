import { Text, View } from "@react-pdf/renderer";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { academicLinks, LinkRow, renderAcademicSections, type AcademicExtras } from "./blocks";

/** Dense layout with tinted heading bands — fits long publication lists on fewer pages. Modelled on sb2nov/resume (LaTeX, MIT). */
export function AcademicCompact({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#222222", muted: "#5f5f5f", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 8.8, {
      paragraph: { lineHeight: 1.35 },
      entry: { marginBottom: 5 },
      bulletRow: { marginTop: 1 },
      bulletText: { lineHeight: 1.3 },
      section: { marginTop: 5 },
      entrySubtitle: { fontStyle: "italic" },
    }),
    bulletChar: "›",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ backgroundColor: tint(accent, 0.86), paddingVertical: 2.5, paddingHorizontal: 6, marginBottom: 5, borderLeftWidth: 3, borderLeftColor: accent }}>
        <Text style={{ ...hf, fontSize: 9.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</Text>
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9, fontWeight: 700, color: accent, marginTop: 3, marginBottom: 2 },
    citation: { fontSize: 8.8, lineHeight: 1.35, color: p.text },
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — Curriculum Vitae`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 28, paddingBottom: 34, paddingHorizontal: 34, color: p.text }}
    >
      <View style={{ marginBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 20, fontWeight: 700, color: accent }}>
          {h.fullName}
          {hasText(h.designation) ? <Text style={{ fontSize: 11, fontWeight: 400, color: p.muted }}>{` · ${h.designation}`}</Text> : null}
        </Text>
        {hasText(h.department) || hasText(h.institution) ? (
          <Text style={{ fontSize: 9.3, color: p.muted, marginTop: 1 }}>{joinParts([h.department, h.institution], ", ")}</Text>
        ) : null}
        <View style={{ marginTop: 3 }}>
          <LinkRow links={academicLinks(doc)} style={{ fontSize: 8.5, color: p.muted }} linkColor={accent} align="flex-start" />
        </View>
      </View>
      {renderAcademicSections(kit, x, doc)}
    </PdfDocument>
  );
}
