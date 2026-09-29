import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, tint, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactDetails, DetailLine, personalDetails, renderEuropassSections, type EuropassExtras } from "./blocks";

const MARGIN_X = 44;
const MARGIN_TOP = 36;
const PHOTO_WIDTH = 74;

/** Full-width colour band with photo, name and details; short accent underlines under the headings. */
export function EuropassBanner({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#24272c", muted: "#626873", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.6, { entrySubtitle: { color: accent }, entryDate: { color: p.muted }, bullet: { color: accent }, section: { marginTop: 13 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ marginBottom: 7 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: trackFor(title, 1) }}>{title}</Text>
        <View style={{ width: 30, borderBottomWidth: 2, borderBottomColor: accent, marginTop: 2.5 }} />
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: tint(accent, 0.6), headBackground: tint(accent, 0.9), headText: accent, text: p.text, muted: p.muted },
  };

  const h = doc.data.header;
  const photo = doc.show.photo && doc.data.photo ? doc.data.photo : null;
  const nameWidth = 595 - MARGIN_X * 2 - (photo ? PHOTO_WIDTH + 18 : 0);
  const details = { style: { fontSize: 8.8, color: "#ffffff", marginTop: 3 }, labelStyle: { color: tint(accent, 0.65) }, linkColor: "#ffffff" };
  return (
    <PdfDocument
      title={`${h.fullName} — Europass CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: MARGIN_TOP, paddingBottom: 44, paddingHorizontal: MARGIN_X, color: p.text }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: -MARGIN_TOP,
          marginHorizontal: -MARGIN_X,
          paddingHorizontal: MARGIN_X,
          paddingVertical: 22,
          backgroundColor: accent,
          marginBottom: 2,
        }}
      >
        {photo ? (
          <Photo src={photo.dataUrl} aspect={photo.aspect} width={PHOTO_WIDTH} style={{ marginRight: 18, borderWidth: 2.5, borderColor: "#ffffff" }} />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, nameWidth, 24), fontWeight: 700, color: "#ffffff", letterSpacing: trackFor(h.fullName, 0.3) }}>
            {h.fullName}
          </Text>
          {hasText(h.headline) ? <Text style={{ fontSize: 11.5, color: tint(accent, 0.75), marginTop: 2 }}>{h.headline}</Text> : null}
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
