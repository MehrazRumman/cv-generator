import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, shade, tint, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactDetails, DetailLine, personalDetails, renderEuropassSections, type EuropassExtras } from "./blocks";

const PHOTO_WIDTH = 76;

/** The current Europass editor look: photo beside the name, labelled details, headings over a full-width rule. */
export function EuropassModern({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const dark = shade(accent, 0.35);
  const p = { text: "#1f2328", muted: "#5b6270", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, {
      entryTitle: { color: dark },
      entrySubtitle: { color: p.muted },
      entryDate: { color: accent, fontWeight: 700, fontSize: 8.8 },
      bullet: { color: accent },
      section: { marginTop: 13 },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1, borderBottomColor: accent, marginBottom: 7, paddingBottom: 2.5 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: trackFor(title, 0.6) }}>
          {title}
        </Text>
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: tint(accent, 0.6), headBackground: tint(accent, 0.9), headText: dark, text: p.text, muted: p.muted },
  };

  const h = doc.data.header;
  const photo = doc.show.photo && doc.data.photo ? doc.data.photo : null;
  const nameWidth = 595 - PAGE_MARGIN.paddingHorizontal * 2 - (photo ? PHOTO_WIDTH + 16 : 0);
  const details = { style: { fontSize: 8.8, color: p.text, marginTop: 3 }, labelStyle: { fontWeight: 700, color: dark }, linkColor: p.text };
  return (
    <PdfDocument title={`${h.fullName} — Europass CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: accent }}>
        {photo ? <Photo src={photo.dataUrl} aspect={photo.aspect} width={PHOTO_WIDTH} style={{ marginRight: 16 }} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, nameWidth, 22), fontWeight: 700, color: dark, letterSpacing: trackFor(h.fullName, 0.3) }}>
            {h.fullName}
          </Text>
          {hasText(h.headline) ? <Text style={{ fontSize: 11, color: accent, marginTop: 2 }}>{h.headline}</Text> : null}
          <View style={{ marginTop: 4 }}>
            <DetailLine items={personalDetails(doc)} {...details} />
            <DetailLine items={contactDetails(doc)} {...details} />
          </View>
        </View>
      </View>
      {renderEuropassSections(kit, x, doc)}
    </PdfDocument>
  );
}
