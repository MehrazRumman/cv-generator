import { Text, View } from "@react-pdf/renderer";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { hasText } from "@/lib/format/text";
import { accentOf, headingFont, PdfDocument, Photo, type Kit, trackFor, fitWords } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

const LEFT = 168;

/**
 * Big two-weight name, then a narrow left column (education, skills, languages, certifications)
 * beside the main column. Modelled on Deedy-Resume (LaTeX, Apache-2.0). Not ATS-optimised.
 */
export function TwoColumn({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2a2a2a", muted: "#707070", accent };
  const heading: Kit["Heading"] = ({ title }) => (
    <Text style={{ ...hf, fontSize: 10.5, color: accent, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>{title}</Text>
  );
  const main: Kit = {
    s: baseKitStyles(p, 9.4, { entrySubtitle: { color: p.muted }, entryDate: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: heading,
  };
  const side: Kit = {
    ...main,
    s: baseKitStyles(p, 8.8, { entrySubtitle: { color: p.muted }, entryDate: { color: accent }, entryTitle: { fontSize: 9.2 } }),
    entryLayout: "dateBelow",
  };
  const h = doc.data.header;
  const parts = h.fullName.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 36, paddingBottom: 42, paddingHorizontal: 38, color: p.text }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ ...hf, fontSize: fitWords(h.fullName, 519, 30, { upper: true, tracking: 2 }), letterSpacing: trackFor(h.fullName, 2), textTransform: "uppercase" }}>
            <Text style={{ color: "#8a8a8a" }}>{parts.join(" ")} </Text>
            <Text style={{ fontWeight: 700, color: "#1d1d1d" }}>{last}</Text>
          </Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 10.5, color: accent, marginTop: 2, letterSpacing: trackFor(h.jobTitle, 1) }}>{h.jobTitle}</Text> : null}
          <ContactLine items={contactItems(doc)} separator="  |  " style={{ fontSize: 8.8, color: p.muted, marginTop: 5 }} />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={62} style={{ marginLeft: 16 }} />
        ) : null}
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: LEFT, paddingRight: 14, borderRightWidth: 0.6, borderRightColor: "#d4d4d4" }}>
          {renderSections(side, doc, ["education", "skills", "languages", "certifications"])}
        </View>
        <View style={{ flex: 1, paddingLeft: 16 }}>{renderSections(main, doc, ["summary", "experience", "projects", "references"])}</View>
      </View>
    </PdfDocument>
  );
}
