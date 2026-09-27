import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { PdfDocument, Photo, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/** Black-and-white, centred header, ruled headings. Modelled on the widely used "Jake's Resume" LaTeX layout. */
export function Classic({ doc }: { doc: PreparedProfessional }) {
  const p = { text: "#111111", muted: "#444444", accent: "#111111" };
  const kit: Kit = {
    s: baseKitStyles(p, 10, {
      entrySubtitle: { fontStyle: "italic" },
      entryDate: { color: p.text },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 0.8, borderBottomColor: p.text, marginBottom: 6, paddingBottom: 2 }}>
        <Text style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</Text>
      </View>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 11.5, marginTop: 3 }}>{h.jobTitle}</Text> : null}
          <ContactLine items={contactItems(doc)} separator="  |  " style={{ fontSize: 9.5, marginTop: 5, textAlign: "center", color: p.text }} />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={68} style={{ marginLeft: 12 }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
