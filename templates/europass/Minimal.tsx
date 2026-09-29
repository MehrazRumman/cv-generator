import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactDetails, DetailLine, personalDetails, renderEuropassSections, type EuropassExtras } from "./blocks";

/** Europass content in a quiet single column: black text, grey rules, prints well in black and white. */
export function EuropassMinimal({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#1a1a1a", muted: "#666666", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.8, { entrySubtitle: { fontStyle: "italic" }, section: { marginTop: 12 } }),
    bulletChar: "–",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 0.6, borderBottomColor: "#bbbbbb", marginBottom: 6, paddingBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 9.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: trackFor(title, 1.2) }}>
          {title}
        </Text>
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: "#c8c8c8", headBackground: "#f3f3f3", headText: "#333333", text: p.text, muted: p.muted },
  };

  const h = doc.data.header;
  const photo = doc.show.photo && doc.data.photo ? doc.data.photo : null;
  const details = { style: { fontSize: 9, color: p.text, marginTop: 2 }, labelStyle: { color: p.muted }, linkColor: p.text };
  return (
    <PdfDocument title={`${h.fullName} — Europass CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 2 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, 380, 21), fontWeight: 700, letterSpacing: trackFor(h.fullName, 0.2) }}>{h.fullName}</Text>
          {hasText(h.headline) ? <Text style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>{h.headline}</Text> : null}
          <View style={{ marginTop: 5 }}>
            <DetailLine items={contactDetails(doc)} {...details} />
            <DetailLine items={personalDetails(doc)} {...details} />
          </View>
        </View>
        {photo ? <Photo src={photo.dataUrl} aspect={photo.aspect} width={64} style={{ marginLeft: 14 }} /> : null}
      </View>
      {renderEuropassSections(kit, x, doc)}
    </PdfDocument>
  );
}
