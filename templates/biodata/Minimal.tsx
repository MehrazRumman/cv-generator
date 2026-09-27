import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

/** Quiet and airy: hairline rules, grey labels, no fills. Prints well in black & white. */
export function BiodataMinimal({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const text = "#222222";
  const muted = "#7a7a7a";
  const rule = "#d4d4d4";
  const lang = doc.settings.labelLanguage;
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ borderBottomWidth: 0.6, borderBottomColor: rule, paddingBottom: 3, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: accent, letterSpacing: tracking(0.8, lang) }}>{title}</Text>
      </View>
    ),
    labelWidth: 125,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 1.8 },
      kvLabel: { fontSize: 9.5, color: muted },
      kvColon: { width: 8, fontSize: 9.5, color: "#ffffff" },
      kvValue: { flex: 1, fontSize: 9.8, color: text, lineHeight: 1.35 },
      paragraph: { fontSize: 9.8, lineHeight: 1.5, color: text },
      table: { borderBottomWidth: 0.5, borderColor: rule },
      headRow: { flexDirection: "row", borderBottomWidth: 0.8, borderBottomColor: text },
      headCell: { fontSize: 8.8, color: muted, paddingVertical: 3, paddingRight: 6 },
      row: { flexDirection: "row" },
      cell: { fontSize: 9.3, paddingVertical: 3.5, paddingRight: 6, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10.2, fontWeight: 600, color: text },
      entryMeta: { fontSize: 9.2, color: muted, marginTop: 1 },
      bulletRow: { flexDirection: "row", marginTop: 2, fontSize: 9.3, color: muted },
      bulletText: { flex: 1, fontSize: 9.3, lineHeight: 1.35, color: text },
      subheading: { fontSize: 9.5, color: muted, marginTop: 6, marginBottom: 2 },
      sectionGap: { marginTop: 14 },
    },
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument title={`${h.name} — ${h.title}`} author={h.name} settings={doc.settings} pageStyle={{ paddingTop: 48, paddingBottom: 48, paddingHorizontal: 54, color: text }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 9, color: muted, letterSpacing: tracking(2.5, lang), textTransform: "uppercase" }}>{h.title}</Text>
          <Text style={{ ...hf, fontSize: 22, fontWeight: 600, color: "#111111", marginTop: 6 }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: accent, marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: muted, marginTop: 8 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={96} style={{ marginLeft: 16 }} /> : null}
      </View>
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
