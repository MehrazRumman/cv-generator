import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint, fitWords } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

/** Double-ruled page frame, centred small-caps headings — the classic marriage-biodata card look. */
export function BiodataElegant({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const text = "#2a2320";
  const soft = tint(accent, 0.55);
  const lang = doc.settings.labelLanguage;
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: soft }} />
        <Text style={{ ...hf, fontSize: 11.5, color: accent, marginHorizontal: 10, letterSpacing: tracking(1.2, lang), fontWeight: 600 }}>{title}</Text>
        <View style={{ flex: 1, borderBottomWidth: 0.5, borderBottomColor: soft }} />
      </View>
    ),
    labelWidth: 135,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 2.3, paddingHorizontal: 18 },
      kvLabel: { fontSize: 10, color: accent },
      kvColon: { width: 12, fontSize: 10, color: soft },
      kvValue: { flex: 1, fontSize: 10, color: text, lineHeight: 1.35 },
      paragraph: { fontSize: 10, lineHeight: 1.55, color: text, paddingHorizontal: 18, textAlign: "justify" },
      table: { marginHorizontal: 18, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: soft },
      headRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: soft },
      headCell: { fontSize: 9, color: accent, paddingVertical: 4, paddingHorizontal: 4, fontWeight: 600 },
      row: { flexDirection: "row" },
      cell: { fontSize: 9.5, paddingVertical: 3.5, paddingHorizontal: 4, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10.5, fontWeight: 600, color: text, paddingHorizontal: 18 },
      entryMeta: { fontSize: 9.5, color: accent, paddingHorizontal: 18, marginTop: 1, fontStyle: "italic" },
      bulletRow: { flexDirection: "row", paddingHorizontal: 22, marginTop: 2, fontSize: 9.5 },
      bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4, color: text },
      subheading: { fontSize: 10, color: accent, marginTop: 7, marginBottom: 3, paddingHorizontal: 18, fontWeight: 600 },
      sectionGap: { marginTop: 13 },
    },
  };
  const h = headerInfo(doc);
  const frame = (
    <View fixed style={{ position: "absolute", top: 18, left: 18, right: 18, bottom: 18, borderWidth: 1.6, borderColor: accent }}>
      <View style={{ position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderWidth: 0.5, borderColor: accent }} />
    </View>
  );
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: 44, paddingBottom: 50, paddingHorizontal: 44, color: text }}
      background={frame}
      numberColor={accent}
      numberBottom={27}
    >
      <View style={{ alignItems: "center" }}>
        <Text style={{ ...hf, fontSize: 22, color: accent, letterSpacing: tracking(4, lang), fontWeight: 600 }}>{h.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <View style={{ width: 50, borderBottomWidth: 0.6, borderBottomColor: accent }} />
          <View style={{ width: 5, height: 5, backgroundColor: accent, transform: "rotate(45deg)", marginHorizontal: 6 }} />
          <View style={{ width: 50, borderBottomWidth: 0.6, borderBottomColor: accent }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, paddingHorizontal: 18 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.name, 351, 19), fontWeight: 700, color: text }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: accent, marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: "#5a504b", marginTop: 6 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? (
          <View style={{ padding: 3, borderWidth: 0.8, borderColor: accent, marginLeft: 12 }}>
            <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={100} />
          </View>
        ) : null}
      </View>
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
