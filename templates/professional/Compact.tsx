import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/** Dense one-pager: tinted heading bands, tight spacing, 9pt text. Modelled on the "Sb2nov" résumé (LaTeX, MIT). */
export function Compact({ doc }: { doc: PreparedProfessional }) {
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
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 28, paddingBottom: 34, paddingHorizontal: 34, color: p.text }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 20, fontWeight: 700, color: accent }}>
            {h.fullName}
            {hasText(h.jobTitle) ? <Text style={{ fontSize: 11, fontWeight: 400, color: p.muted }}>{` · ${h.jobTitle}`}</Text> : null}
          </Text>
          <ContactLine items={contactItems(doc)} separator="  ·  " style={{ fontSize: 8.5, color: p.muted, marginTop: 3 }} align="flex-start" />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={52} style={{ marginLeft: 10 }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
