import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, fitFontSize, PdfDocument, Photo, tint, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

const GUTTER = 88;

/** Dates in a left gutter, accent bar headings. Modelled on moderncv's "classic" style (LaTeX, LPPL). */
export function Timeline({ doc }: { doc: PreparedProfessional }) {
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#6f6f6f", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, {
      entryDate: { color: p.muted, fontSize: 9, textAlign: "right" },
      entrySubtitle: { fontStyle: "italic" },
      bullet: { color: accent },
    }),
    bulletChar: "•",
    entryLayout: "dateColumn",
    dateColumnWidth: GUTTER,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ width: GUTTER - 8, height: 5, backgroundColor: tint(accent, 0.35), marginRight: 8 }} />
        <Text style={{ fontSize: 13, color: accent }}>{title}</Text>
      </View>
    ),
  };
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, color: accent }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 13, color: p.muted, fontStyle: "italic", marginTop: 2 }}>{h.jobTitle}</Text> : null}
        </View>
        <View style={{ width: 200, alignItems: "flex-end" }}>
          {contactItems(doc).map((c) => (
            <ContactLine key={c.key} items={[c]} separator="" style={{ fontSize: fitFontSize(c.text, 200, 8.8), color: p.muted }} align="flex-end" />
          ))}
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={64} style={{ marginLeft: 12, borderWidth: 1, borderColor: tint(accent, 0.5) }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
