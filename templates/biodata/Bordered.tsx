import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

/**
 * Everything in a ruled grid — the traditional Bangladeshi office biodata format: each section is a
 * titled box, labels sit in shaded cells.
 */
export function BiodataBordered({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const lang = doc.settings.labelLanguage;
  const text = "#1a1a1a";
  const line = "#6b6b6b";
  const shade = tint(accent, 0.9);
  const border = { borderLeftWidth: 0.7, borderRightWidth: 0.7, borderBottomWidth: 0.7, borderColor: line };
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ borderWidth: 0.7, borderColor: line, backgroundColor: accent, paddingVertical: 3.5, paddingHorizontal: 7 }}>
        <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: "#ffffff", letterSpacing: tracking(0.6, lang) }}>{title}</Text>
      </View>
    ),
    labelWidth: 150,
    colon: false,
    s: {
      kvRow: { flexDirection: "row", ...border },
      kvLabel: { fontSize: 9.8, fontWeight: 600, color: text, backgroundColor: shade, paddingVertical: 3.5, paddingHorizontal: 6, borderRightWidth: 0.7, borderRightColor: line },
      kvColon: {},
      kvValue: { flex: 1, fontSize: 9.8, color: text, paddingVertical: 3.5, paddingHorizontal: 6, lineHeight: 1.3 },
      paragraph: { fontSize: 9.8, lineHeight: 1.45, color: text, padding: 6, ...border },
      table: { borderLeftWidth: 0.7, borderBottomWidth: 0.7, borderColor: line },
      headRow: { flexDirection: "row", backgroundColor: shade, borderBottomWidth: 0.7, borderBottomColor: line },
      headCell: { fontSize: 9, fontWeight: 700, padding: 4, borderRightWidth: 0.7, borderRightColor: line, color: text },
      row: { flexDirection: "row" },
      cell: { fontSize: 9.3, padding: 4, borderRightWidth: 0.7, borderRightColor: line, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10, fontWeight: 700, color: text, paddingHorizontal: 6, paddingTop: 5, borderLeftWidth: 0.7, borderRightWidth: 0.7, borderColor: line },
      entryMeta: { fontSize: 9.3, color: "#555555", paddingHorizontal: 6, paddingBottom: 5, borderLeftWidth: 0.7, borderRightWidth: 0.7, borderBottomWidth: 0.7, borderColor: line },
      bulletRow: { flexDirection: "row", paddingHorizontal: 10, paddingBottom: 3, fontSize: 9.3, borderLeftWidth: 0.7, borderRightWidth: 0.7, borderColor: line },
      bulletText: { flex: 1, fontSize: 9.3, lineHeight: 1.3, color: text },
      subheading: { fontSize: 9.8, fontWeight: 700, color: text, backgroundColor: shade, paddingVertical: 3, paddingHorizontal: 6, ...border },
      sectionGap: { marginTop: 11 },
      signature: { fontSize: 9.8, lineHeight: 1.45, color: text },
    },
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument title={`${h.name} — ${h.title}`} author={h.name} settings={doc.settings} pageStyle={{ paddingTop: 34, paddingBottom: 44, paddingHorizontal: 40, color: text }}>
      <View style={{ flexDirection: "row", borderWidth: 1.2, borderColor: accent }}>
        <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
          <Text style={{ ...hf, fontSize: 11, color: accent, fontWeight: 700, letterSpacing: tracking(3, lang), textTransform: "uppercase" }}>{h.title}</Text>
          <Text style={{ ...hf, fontSize: 21, fontWeight: 700, marginTop: 6 }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: "#444444", marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.8, color: "#444444", marginTop: 5 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? (
          <View style={{ borderLeftWidth: 1.2, borderLeftColor: accent, padding: 6 }}>
            <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={96} />
          </View>
        ) : null}
      </View>
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
