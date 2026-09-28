import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, fitFontSize, headingFont, PdfDocument, Photo, tint, fitWords } from "../shared/kit";
import { labelsFor, renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

const SIDEBAR = 178;

/** Tinted left column with photo, contact and hobbies; details on the right. Layout modelled on AltaCV (LaTeX, LPPL). */
export function BiodataSidebar({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const lang = doc.settings.labelLanguage;
  const { t } = labelsFor(doc);
  const text = "#262626";
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ borderBottomWidth: 1.2, borderBottomColor: accent, paddingBottom: 2, marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, letterSpacing: tracking(0.5, lang) }}>{title}</Text>
      </View>
    ),
    labelWidth: 112,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 2 },
      kvLabel: { fontSize: 9.4, color: "#666666" },
      kvColon: { width: 10, fontSize: 9.4, color: "#999999" },
      kvValue: { flex: 1, fontSize: 9.6, color: text, lineHeight: 1.35 },
      paragraph: { fontSize: 9.6, lineHeight: 1.5, color: text },
      table: { borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: tint(accent, 0.5) },
      headRow: { flexDirection: "row", backgroundColor: tint(accent, 0.88) },
      headCell: { fontSize: 8.6, fontWeight: 700, color: accent, paddingVertical: 3.5, paddingHorizontal: 4 },
      row: { flexDirection: "row" },
      rowAlt: { backgroundColor: "#f6f6f6" },
      cell: { fontSize: 9, paddingVertical: 3.5, paddingHorizontal: 4, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10, fontWeight: 700, color: text },
      entryMeta: { fontSize: 9, color: accent, marginTop: 1 },
      bulletRow: { flexDirection: "row", marginTop: 2, fontSize: 9, color: accent },
      bulletText: { flex: 1, fontSize: 9, lineHeight: 1.35, color: text },
      subheading: { fontSize: 9.6, fontWeight: 700, color: text, marginTop: 6, marginBottom: 3 },
      sectionGap: { marginTop: 13 },
    },
  };
  const h = headerInfo(doc);
  const c = doc.data.contact;
  const side = {
    heading: { ...hf, fontSize: 10, fontWeight: 700 as const, color: accent, marginTop: 16, marginBottom: 5, letterSpacing: tracking(0.8, lang) },
    label: { fontSize: 8.3, color: "#6b6b6b", marginTop: 4 },
    value: { fontSize: 9.2, color: text, lineHeight: 1.35 },
  };
  const contactRows = [
    { label: t.fields.phone, value: c.phone },
    { label: t.fields.email, value: c.email },
    { label: t.fields.presentAddress, value: c.presentAddress },
    { label: t.fields.permanentAddress, value: c.permanentAddress },
  ].filter((r) => hasText(r.value));
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: 34, paddingBottom: 42, color: text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR, backgroundColor: tint(accent, 0.9) }} />}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDEBAR, paddingHorizontal: 16 }}>
          {h.photo ? <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={SIDEBAR - 52} style={{ alignSelf: "center", borderWidth: 3, borderColor: "#ffffff" }} /> : null}
          {doc.show.contact && contactRows.length ? (
            <View>
              <Text style={side.heading}>{t.sections.contact}</Text>
              {contactRows.map((r) => (
                <View key={r.label} wrap={false}>
                  <Text style={side.label}>{r.label}</Text>
                  <Text style={[side.value, { fontSize: r.label === t.fields.email ? fitFontSize(r.value, SIDEBAR - 32, 9.2) : 9.2 }]}>{r.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {doc.show.hobbies ? (
            <View wrap={false}>
              <Text style={side.heading}>{t.sections.hobbies}</Text>
              {doc.data.hobbies.map((hobby, i) => (
                <Text key={i} style={[side.value, { marginBottom: 1.5 }]}>
                  • {hobby}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, paddingLeft: 22, paddingRight: 36 }}>
          <Text style={{ ...hf, fontSize: 9, color: accent, letterSpacing: tracking(2.5, lang), textTransform: "uppercase", fontWeight: 700 }}>{h.title}</Text>
          <Text style={{ ...hf, fontSize: fitWords(h.name, 595 - SIDEBAR - 58, 23), fontWeight: 700, color: "#1a1a1a", marginTop: 4 }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: "#555555", marginTop: 2 }}>{h.subtitle}</Text> : null}
          {renderBiodataSections(kit, doc, ["contact", "hobbies"])}
        </View>
      </View>
    </PdfDocument>
  );
}
