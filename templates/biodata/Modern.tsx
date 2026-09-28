import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint, fitWords } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

const BAND = 118;

/** Colour header band with the photo, two-column personal details and zebra tables. */
export function BiodataModern({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const text = "#262626";
  const lang = doc.settings.labelLanguage;
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <View style={{ width: 4, height: 13, backgroundColor: accent, marginRight: 6 }} />
        <Text style={{ ...hf, fontSize: 12, fontWeight: 700, color: accent }}>{title}</Text>
        <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: tint(accent, 0.6), marginLeft: 8 }} />
      </View>
    ),
    labelWidth: 118,
    twoColumnPersonal: true,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 2.2 },
      kvLabel: { fontSize: 9.5, color: "#6b6b6b" },
      kvColon: { width: 10, fontSize: 9.5, color: "#9a9a9a" },
      kvValue: { flex: 1, fontSize: 9.8, color: text, fontWeight: 600, lineHeight: 1.35 },
      paragraph: { fontSize: 9.8, lineHeight: 1.5, color: text },
      table: { borderRadius: 2 },
      headRow: { flexDirection: "row", backgroundColor: accent },
      headCell: { fontSize: 8.8, fontWeight: 700, color: "#ffffff", paddingVertical: 4, paddingHorizontal: 5 },
      row: { flexDirection: "row" },
      rowAlt: { backgroundColor: tint(accent, 0.93) },
      cell: { fontSize: 9.3, paddingVertical: 4, paddingHorizontal: 5, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10.3, fontWeight: 700, color: text },
      entryMeta: { fontSize: 9.2, color: accent, marginTop: 1 },
      bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 4, fontSize: 9.3, color: accent },
      bulletText: { flex: 1, fontSize: 9.3, lineHeight: 1.35, color: text },
      subheading: { fontSize: 9.8, fontWeight: 700, color: text, marginTop: 6, marginBottom: 3 },
      sectionGap: { marginTop: 13 },
    },
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: 36, paddingBottom: 44, paddingHorizontal: 40, color: text }}
    >
      <View style={{ marginHorizontal: -40, marginTop: -36, minHeight: BAND, backgroundColor: accent, paddingHorizontal: 40, paddingVertical: 16, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: h.photo ? 120 : 0 }}>
          <Text style={{ ...hf, fontSize: 9, color: tint(accent, 0.6), letterSpacing: tracking(3, lang), textTransform: "uppercase" }}>{h.title}</Text>
          <Text style={{ ...hf, fontSize: fitWords(h.name, 395, 22), fontWeight: 700, color: "#ffffff", marginTop: 4 }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: tint(accent, 0.75), marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: "#ffffff", marginTop: 7 }}>{h.contact}</Text> : null}
        </View>
      </View>
      {h.photo ? (
        <Photo
          src={h.photo.dataUrl}
          aspect={h.photo.aspect}
          width={100}
          style={{ position: "absolute", top: 34, right: 40, borderWidth: 3, borderColor: "#ffffff", borderRadius: 3 }}
        />
      ) : null}
      <View style={{ height: h.photo ? 30 : 4 }} />
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
