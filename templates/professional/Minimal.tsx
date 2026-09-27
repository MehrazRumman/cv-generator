import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/** Generous whitespace, letter-spaced grey headings, no rules. Modelled on JSON Resume's minimalist themes (MIT). */
export function Minimal({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#333333", muted: "#8a8a8a", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, {
      entryTitle: { fontWeight: 600 },
      section: { marginTop: 14 },
      bullet: { color: "#bbbbbb" },
      label: { fontWeight: 600 },
    }),
    bulletChar: "–",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <Text style={{ ...hf, fontSize: 8.5, color: p.muted, textTransform: "uppercase", letterSpacing: 2.2, marginBottom: 8 }}>{title}</Text>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 52, paddingBottom: 50, paddingHorizontal: 56, color: p.text }}
    >
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 22, fontWeight: 600, color: "#111111" }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 11, color: accent, marginTop: 3 }}>{h.jobTitle}</Text> : null}
          <ContactLine items={contactItems(doc)} separator="   " style={{ fontSize: 8.8, color: p.muted, marginTop: 8 }} align="flex-start" />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={62} style={{ marginLeft: 16, borderRadius: 31 }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
