import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, type Kit, trackFor, fitWords } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/** Small-caps name between double rules, centred headings flanked by lines. Modelled on the "Harvard" / OCS résumé style. */
export function Executive({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#1c1c1c", muted: "#5a5a5a", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 10, {
      entryTitle: { textTransform: "uppercase", fontSize: 9.8, letterSpacing: 0.4 },
      entrySubtitle: { fontStyle: "italic", color: accent },
      entryDate: { color: p.text },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: accent }} />
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 2, marginHorizontal: 10 }}>
          {title}
        </Text>
        <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: accent }} />
      </View>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ borderTopWidth: 2, borderBottomWidth: 0.6, borderColor: accent, paddingVertical: 10, marginBottom: 6 }}>
        <View style={{ borderTopWidth: 0.6, borderColor: accent, position: "absolute", top: 2, left: 0, right: 0 }} />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ ...hf, fontSize: fitWords(h.fullName, 507, 24, { upper: true, tracking: 3 }), letterSpacing: trackFor(h.fullName, 3), textTransform: "uppercase", color: "#111111" }}>{h.fullName}</Text>
            {hasText(h.jobTitle) ? <Text style={{ fontSize: 10.5, color: accent, marginTop: 4, letterSpacing: trackFor(h.jobTitle, 1) }}>{h.jobTitle}</Text> : null}
            <ContactLine items={contactItems(doc)} separator="   •   " style={{ fontSize: 8.8, color: p.muted, marginTop: 6 }} />
          </View>
          {doc.show.photo && doc.data.photo ? (
            <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={64} style={{ marginLeft: 12 }} />
          ) : null}
        </View>
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
