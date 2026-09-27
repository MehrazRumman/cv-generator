import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, PdfDocument, Photo, tint } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

/** Traditional biodata: centred title, photo top-right, heading bands and ruled tables. */
export function BiodataClassic({ doc }: { doc: PreparedBiodata }) {
  const accent = accentOf(doc.settings.accentColor);
  const text = "#1f1f1f";
  const border = "#9a9a9a";
  const lang = doc.settings.labelLanguage;
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ backgroundColor: accent, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 6 }}>
        <Text style={{ color: "#ffffff", fontSize: 10.5, fontWeight: 700, letterSpacing: tracking(0.5, lang) }}>{title}</Text>
      </View>
    ),
    labelWidth: 130,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 2, paddingHorizontal: 4 },
      kvLabel: { fontSize: 10, fontWeight: 600, color: text },
      kvColon: { width: 12, fontSize: 10, color: text },
      kvValue: { flex: 1, fontSize: 10, color: text, lineHeight: 1.35 },
      paragraph: { fontSize: 10, lineHeight: 1.5, color: text, paddingHorizontal: 4 },
      table: { borderLeftWidth: 0.6, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: border },
      headRow: { flexDirection: "row", backgroundColor: tint(accent, 0.88), borderBottomWidth: 0.6, borderBottomColor: border },
      headCell: { fontSize: 9, fontWeight: 700, padding: 4, borderRightWidth: 0.6, borderRightColor: border, color: text },
      row: { flexDirection: "row" },
      cell: { fontSize: 9.5, padding: 4, borderRightWidth: 0.6, borderRightColor: border, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10.5, fontWeight: 700, color: text, paddingHorizontal: 4 },
      entryMeta: { fontSize: 9.5, color: "#555555", paddingHorizontal: 4, marginTop: 1 },
      bulletRow: { flexDirection: "row", paddingHorizontal: 8, marginTop: 2, fontSize: 9.5 },
      bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.35, color: text },
      subheading: { fontSize: 10, fontWeight: 700, color: accent, marginTop: 6, marginBottom: 3, paddingHorizontal: 4 },
      sectionGap: { marginTop: 12 },
    },
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument title={`${h.name} — ${h.title}`} author={h.name} settings={doc.settings} pageStyle={{ paddingTop: 36, paddingBottom: 44, paddingHorizontal: 42, color: text }}>
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 700, color: accent, letterSpacing: tracking(3, lang), textTransform: "uppercase" }}>{h.title}</Text>
        <View style={{ width: 90, borderBottomWidth: 1.5, borderBottomColor: accent, marginTop: 3 }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingTop: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: 700 }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 11, color: "#444444", marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 10, color: "#444444", marginTop: 6 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? (
          <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={108} style={{ borderWidth: 2, borderColor: tint(accent, 0.3), marginLeft: 16 }} />
        ) : null}
      </View>
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
