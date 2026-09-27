import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/**
 * Dense, left-aligned and strictly single-column — the layout recommended by the r/EngineeringResumes
 * wiki. Modelled on RenderCV's "engineeringresumes" theme (MIT).
 */
export function Engineering({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#000000", muted: "#333333", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.5, {
      entry: { marginBottom: 6 },
      entryTitle: { fontSize: 9.8 },
      entryDate: { color: p.text },
      entrySubtitle: { fontStyle: "italic", marginTop: 0 },
      bulletRow: { marginTop: 1.2, paddingLeft: 6 },
      bulletText: { lineHeight: 1.3 },
      paragraph: { lineHeight: 1.35 },
      section: { marginTop: 7 },
      link: { color: accent },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 0.6, borderBottomColor: "#000000", marginBottom: 4, paddingBottom: 1 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent }}>{title}</Text>
      </View>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 34, paddingBottom: 38, paddingHorizontal: 40, color: p.text }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 22, fontWeight: 700, color: accent }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 10.5, marginTop: 1 }}>{h.jobTitle}</Text> : null}
          <ContactLine items={contactItems(doc)} separator="  |  " style={{ fontSize: 9, color: p.muted, marginTop: 4 }} linkColor={accent} align="flex-start" />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={56} style={{ marginLeft: 10 }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
