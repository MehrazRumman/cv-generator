import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, tint, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactDetails, DetailLine, personalDetails, renderEuropassSections, type EuropassExtras } from "./blocks";

/** Entries hang on a vertical rail with a dot per entry; square-marked headings. */
export function EuropassTimeline({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#23262b", muted: "#646a73", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, {
      entrySubtitle: { color: p.muted },
      entryDate: { color: accent, fontWeight: 700, fontSize: 8.8 },
      bullet: { color: accent },
      section: { marginTop: 13 },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    rail: {
      style: { borderLeftWidth: 1, borderLeftColor: tint(accent, 0.55), paddingLeft: 13, marginLeft: 4 },
      marker: <View style={{ position: "absolute", left: -4.5, top: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />,
      gap: 9,
    },
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ width: 9, height: 9, backgroundColor: accent, marginRight: 8 }} />
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: p.text, textTransform: "uppercase", letterSpacing: trackFor(title, 0.6) }}>
          {title}
        </Text>
        <View style={{ flex: 1, height: 0.6, marginLeft: 8, backgroundColor: tint(accent, 0.6) }} />
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: tint(accent, 0.6), headBackground: tint(accent, 0.9), headText: accent, text: p.text, muted: p.muted },
  };

  const h = doc.data.header;
  const photo = doc.show.photo && doc.data.photo ? doc.data.photo : null;
  const details = { style: { fontSize: 8.8, color: p.text, marginTop: 3 }, labelStyle: { color: accent, fontWeight: 700 }, linkColor: p.text };
  return (
    <PdfDocument title={`${h.fullName} — Europass CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 2 }}>
        {photo ? <Photo src={photo.dataUrl} aspect={photo.aspect} width={70} style={{ marginRight: 16, borderRadius: 4 }} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, 400, 24), fontWeight: 700, color: accent, letterSpacing: trackFor(h.fullName, 0.2) }}>
            {h.fullName}
          </Text>
          {hasText(h.headline) ? <Text style={{ fontSize: 11.5, color: p.muted, marginTop: 1 }}>{h.headline}</Text> : null}
          <View style={{ marginTop: 5 }}>
            <DetailLine items={personalDetails(doc)} {...details} />
            <DetailLine items={contactDetails(doc)} {...details} />
          </View>
        </View>
      </View>
      {renderEuropassSections(kit, x, doc)}
    </PdfDocument>
  );
}
