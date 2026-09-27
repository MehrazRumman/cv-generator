import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

const MARGIN_X = 44;
const MARGIN_TOP = 36;

/** Full-width colour banner with the name and contacts, clean single column below. Modelled on JSON Resume's "flat" theme (MIT). */
export function Banner({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.8, { entrySubtitle: { color: accent }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ marginBottom: 6 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</Text>
        <View style={{ width: 28, borderBottomWidth: 2, borderBottomColor: accent, marginTop: 2 }} />
      </View>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: MARGIN_TOP, paddingBottom: 44, paddingHorizontal: MARGIN_X, color: p.text }}
    >
      <View
        style={{
          marginTop: -MARGIN_TOP,
          marginHorizontal: -MARGIN_X,
          paddingHorizontal: MARGIN_X,
          paddingVertical: 24,
          backgroundColor: accent,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 26, fontWeight: 700, color: "#ffffff" }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 12, color: tint(accent, 0.72), marginTop: 3 }}>{h.jobTitle}</Text> : null}
          <ContactLine items={contactItems(doc)} separator="   " style={{ fontSize: 9, color: "#ffffff", marginTop: 9 }} align="flex-start" />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo
            src={doc.data.photo.dataUrl}
            aspect={doc.data.photo.aspect}
            width={76}
            style={{ marginLeft: 16, borderWidth: 2.5, borderColor: "#ffffff", borderRadius: doc.data.photo.aspect === "square" ? 38 : 3 }}
          />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
