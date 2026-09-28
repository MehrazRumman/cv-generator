import { Polygon, Svg, Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit, trackFor } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, fitText, SideContact, SideLanguages, SideSummary, type SideStyle } from "./parts";

const SIDE = 176;
const BAND = 150;
const PEACH = "#f3dccf";
/** Width available for the name inside the band. */
const NAME_W = 595 - SIDE - 40 - 36 - 18;

function Arrow({ color }: { color: string }) {
  return (
    <Svg width={8} height={8} viewBox="0 0 10 10" style={{ marginRight: 6 }}>
      <Polygon points="0,0 10,5 0,10" fill={color} />
    </Svg>
  );
}

/** Coloured column and a pastel name band with the photo straddling both; arrow-marked headings. */
export function PastelSplit({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2f2f2f", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.4, { entryTitle: { textTransform: "uppercase", fontSize: 9.4, letterSpacing: 0.4 }, entrySubtitle: { color: p.muted }, section: { marginTop: 12 } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <Arrow color="#3a3a3a" />
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: 1.4 }}>{title}</Text>
      </View>
    ),
  };
  const st: SideStyle = {
    heading: (title) => (
      <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 7 }}>{title}</Text>
    ),
    text: { fontSize: 8.8, color: "#ffffff", lineHeight: 1.45 },
    strong: { fontSize: 9, color: "#ffffff", fontWeight: 700 },
    muted: { fontSize: 8.2, color: tint(accent, 0.7) },
    iconColor: "#ffffff",
    barColor: "#ffffff",
    barTrack: tint(accent, 0.45),
    gap: 18,
  };
  const h = doc.data.header;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 30, paddingBottom: 40, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE, backgroundColor: accent }} />}
    >
      {/* Page-1 decorations: the pastel band and the photo straddling column and band. */}
      <View style={{ position: "absolute", top: 0, left: SIDE, right: 0, height: BAND, backgroundColor: PEACH }} />
      <Avatar
        doc={doc}
        size={124}
        ring={4}
        ringColor="#ffffff"
        fallbackBg={tint(accent, 0.3)}
        style={{ position: "absolute", top: 34, left: SIDE / 2 - 62 + 18 }}
      />
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDE, paddingHorizontal: 20, paddingTop: 140 }}>
          <SideSummary doc={doc} st={st} title="Profile" />
          <SideContact doc={doc} st={st} width={SIDE - 40} title="Contact Me" />
          <SideLanguages doc={doc} st={st} bars />
        </View>
        <View style={{ flex: 1, paddingLeft: 40, paddingRight: 36 }}>
          <View style={{ height: BAND - 30, justifyContent: "center", paddingLeft: 18 }}>
            <Text style={{ ...hf, fontSize: fitText(h.fullName, NAME_W, 26, { upper: true, tracking: 1.5 }), fontWeight: 700, color: "#2b2b2b", textTransform: "uppercase", letterSpacing: trackFor(h.fullName, 1.5), lineHeight: 1.05 }}>
              {h.fullName}
            </Text>
            {hasText(h.jobTitle) ? (
              <Text style={{ fontSize: fitText(h.jobTitle, NAME_W, 11, { lines: 1, tracking: 1, min: 8 }), color: "#4a4a4a", marginTop: 5, letterSpacing: trackFor(h.jobTitle, 1) }}>{h.jobTitle}</Text>
            ) : null}
          </View>
          {renderSections(kit, doc, ["education", "experience", "skills", "projects", "certifications", "references"])}
        </View>
      </View>
    </PdfDocument>
  );
}
