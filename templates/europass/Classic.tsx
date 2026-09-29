import { Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, tint, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactDetails, DetailLine, personalDetails, renderEuropassSections, type EuropassExtras } from "./blocks";

const GUTTER = 130;
const CONTENT_WIDTH = 595 - PAGE_MARGIN.paddingHorizontal * 2 - GUTTER;

/** A row with `left` right-aligned in the label column and `right` in the content column. */
function Row({ left, right, marginTop = 0 }: { left?: ReactNode; right: ReactNode; marginTop?: number }) {
  return (
    <View style={{ flexDirection: "row", marginTop }}>
      <View style={{ width: GUTTER - 8, marginRight: 8, alignItems: "flex-end" }}>{left}</View>
      <View style={{ flex: 1 }}>{right}</View>
    </View>
  );
}

/**
 * The traditional Europass layout: labels and dates right-aligned in a left column, section
 * headings followed by a rule across the content column, photo under "Personal information".
 */
export function EuropassClassic({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#26262a", muted: "#5f6168", accent };
  const label = { ...hf, fontSize: 8.6, color: accent, textTransform: "uppercase" as const, letterSpacing: 0.4, textAlign: "right" as const };

  const kit: Kit = {
    s: baseKitStyles(p, 9.6, {
      entryTitle: { color: accent },
      entryDate: { color: p.muted, fontSize: 8.8 },
      bullet: { color: accent },
      section: { marginTop: 12 },
    }),
    bulletChar: "•",
    entryLayout: "dateColumn",
    dateColumnWidth: GUTTER,
    dateColumnAlign: "right",
    Heading: ({ title }) => (
      // Rule level with the middle of the last line, so a two-line label still reads as one heading.
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 6 }}>
        <Text style={[label, { width: GUTTER - 8, marginRight: 8, letterSpacing: trackFor(title, 0.4) }]}>{title}</Text>
        <View style={{ flex: 1, height: 0.8, marginBottom: 5, backgroundColor: tint(accent, 0.3) }} />
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: tint(accent, 0.55), headBackground: tint(accent, 0.9), headText: accent, text: p.text, muted: p.muted },
  };

  const h = doc.data.header;
  const photo = doc.show.photo && doc.data.photo ? doc.data.photo : null;
  const details = { style: { fontSize: 9, color: p.text, marginTop: 3 }, labelStyle: { color: p.muted }, linkColor: p.text };
  return (
    <PdfDocument title={`${h.fullName} — Europass CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <Row
        left={<Text style={[label, { marginTop: 5 }]}>Personal information</Text>}
        right={
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, CONTENT_WIDTH, 18), fontWeight: 700, color: accent, lineHeight: 1.1 }}>
            {h.fullName}
          </Text>
        }
      />
      <Row
        marginTop={4}
        left={photo ? <Photo src={photo.dataUrl} aspect={photo.aspect} width={72} style={{ marginTop: 2 }} /> : null}
        right={
          <>
            <DetailLine items={contactDetails(doc)} {...details} />
            <DetailLine items={personalDetails(doc)} {...details} />
          </>
        }
      />
      {hasText(h.headline) ? (
        <Row
          marginTop={12}
          left={<Text style={[label, { marginTop: 2 }]}>Position</Text>}
          right={<Text style={{ ...hf, fontSize: 12.5, fontWeight: 700, color: accent }}>{h.headline}</Text>}
        />
      ) : null}
      {renderEuropassSections(kit, x, doc)}
    </PdfDocument>
  );
}
