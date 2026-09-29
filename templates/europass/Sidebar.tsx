import { Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { hasText } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { accentOf, fitFontSize, fitWords, headingFont, PdfDocument, PdfLink, Photo, shade, tint, trackFor, type Kit } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactDetails, EUROPASS_TITLES, personalDetails, renderEuropassSections, type Detail, type EuropassExtras } from "./blocks";

const SIDEBAR = 178;
const SIDE_PAD = 18;
const PAD_Y = 36;

/**
 * Tinted left column with photo, personal details, contact, digital skills, driving licence and
 * hobbies; the main column carries the rest. Not ATS-optimised (two columns).
 */
export function EuropassSidebar({ doc }: { doc: PreparedEuropass }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const dark = shade(accent, 0.3);
  const p = { text: "#24272c", muted: "#626873", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.4, { entrySubtitle: { color: accent }, entryDate: { color: p.muted }, bullet: { color: accent }, section: { marginTop: 12 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1.2, borderBottomColor: accent, marginBottom: 7, paddingBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: trackFor(title, 0.6) }}>{title}</Text>
      </View>
    ),
  };
  const x: EuropassExtras = {
    grid: { line: tint(accent, 0.6), headBackground: tint(accent, 0.9), headText: dark, text: p.text, muted: p.muted },
  };

  const side = {
    heading: { ...hf, fontSize: 9.5, fontWeight: 700, color: dark, textTransform: "uppercase" as const, letterSpacing: 0.8, marginTop: 14, marginBottom: 5 },
    label: { fontSize: 7.8, color: p.muted, textTransform: "uppercase" as const, letterSpacing: 0.4 },
    text: { fontSize: 8.8, color: "#2b2e33", lineHeight: 1.4 },
  };
  const width = SIDEBAR - SIDE_PAD * 2;
  const detailList = (items: Detail[]) =>
    items.map((d) => {
      // Shrink only unbreakable values (emails, links); anything with spaces wraps instead.
      const size = /\s/.test(d.text) ? side.text.fontSize : fitFontSize(d.text, width, side.text.fontSize);
      const value = <Text style={[side.text, { fontSize: size }]}>{d.text}</Text>;
      return (
        <View key={d.key} style={{ marginBottom: 4 }} wrap={false}>
          <Text style={side.label}>{d.label}</Text>
          {d.href ? <PdfLink href={d.href}>{value}</PdfLink> : value}
        </View>
      );
    });
  const sideBlock = (title: string, children: ReactNode) => (
    <View wrap={false}>
      <Text style={side.heading}>{title}</Text>
      {children}
    </View>
  );

  const h = doc.data.header;
  const d = doc.data;
  const photo = doc.show.photo && d.photo ? d.photo : null;
  const personal = personalDetails(doc);
  const contact = contactDetails(doc);
  return (
    <PdfDocument
      title={`${h.fullName} — Europass CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: PAD_Y, paddingBottom: PAD_Y + 6, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR, backgroundColor: tint(accent, 0.9) }} />}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDEBAR, paddingHorizontal: SIDE_PAD }}>
          {photo ? <Photo src={photo.dataUrl} aspect={photo.aspect} width={104} style={{ alignSelf: "center", borderRadius: 4, marginBottom: 2 }} /> : null}
          {personal.length > 0 ? sideBlock("Personal details", detailList(personal)) : null}
          {contact.length > 0 ? sideBlock("Contact", detailList(contact)) : null}
          {doc.show.digitalSkills
            ? sideBlock(
                EUROPASS_TITLES.digitalSkills,
                d.digitalSkills.map((s, i) => (
                  <Text key={i} style={[side.text, { marginBottom: 1.5 }]}>
                    {s}
                  </Text>
                )),
              )
            : null}
          {doc.show.drivingLicence ? sideBlock(EUROPASS_TITLES.drivingLicence, <Text style={side.text}>{d.drivingLicence.join(", ")}</Text>) : null}
          {doc.show.hobbies ? sideBlock(EUROPASS_TITLES.hobbies, <Text style={side.text}>{d.hobbies.join(", ")}</Text>) : null}
        </View>

        <View style={{ flex: 1, paddingLeft: 22, paddingRight: 32 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, 595 - SIDEBAR - 54, 24), fontWeight: 700, color: dark, letterSpacing: trackFor(h.fullName, 0.2) }}>
            {h.fullName}
          </Text>
          {hasText(h.headline) ? <Text style={{ fontSize: 11.5, color: accent, marginTop: 2 }}>{h.headline}</Text> : null}
          {renderEuropassSections(kit, x, doc, ["aboutMe", "experience", "education", "languages", "skills", "additional"])}
        </View>
      </View>
    </PdfDocument>
  );
}
