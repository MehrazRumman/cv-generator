import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, shade, tint, type Kit } from "../../shared/kit";
import { baseKitStyles } from "../../shared/presets";
import { renderSections } from "../blocks";
import { Avatar, fitText, SideContact, SideLanguages, SideSkills, SideSummary, splitName, type SideStyle } from "./parts";

const SIDE = 178;
const BANNER = 96;
/** Width available for the name inside the banner. */
const NAME_W = 595 - SIDE - 26 - 32;

/** Dark column, bold colour banner with the name, rounded "pill" section labels and language bars. */
export function BoldPills({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const dark = shade(accent, 0.62);
  const p = { text: "#2b2b2b", muted: "#6b6b6b", accent };
  const pill = (title: string, bg: string) => (
    <View style={{ alignSelf: "flex-start", backgroundColor: bg, borderRadius: 9, paddingVertical: 2.5, paddingHorizontal: 12, marginBottom: 7 }}>
      <Text style={{ ...hf, fontSize: 9.5, fontWeight: 700, color: "#ffffff", letterSpacing: 0.6 }}>{title}</Text>
    </View>
  );
  const kit: Kit = {
    s: baseKitStyles(p, 9.2, { entryTitle: { color: "#1f1f1f" }, entrySubtitle: { color: accent, fontWeight: 700 }, section: { marginTop: 11 }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => pill(title, accent),
  };
  const st: SideStyle = {
    heading: (title) => <View style={{ alignItems: "center" }}>{pill(title, accent)}</View>,
    text: { fontSize: 8.5, color: "#e6e9f0", lineHeight: 1.45 },
    strong: { fontSize: 8.7, color: "#ffffff", fontWeight: 700 },
    muted: { fontSize: 8, color: tint(accent, 0.6) },
    iconColor: tint(accent, 0.55),
    barColor: tint(accent, 0.35),
    barTrack: shade(accent, 0.35),
    gap: 16,
  };
  const h = doc.data.header;
  const { first, last } = splitName(h.fullName);
  // First and last name each get one line of the banner; size both to fit the longer one.
  const nameSize = fitText(first.length > last.length ? first : last, NAME_W, 27, { lines: 1, upper: true });
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 30, paddingBottom: 40, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDE, backgroundColor: dark }} />}
    >
      {/* Page-1 banner across the top */}
      <View style={{ position: "absolute", top: 36, left: SIDE - 30, right: 0, height: BANNER, backgroundColor: accent }} />
      <Avatar doc={doc} size={128} ring={4} ringColor={accent} gap={3} fallbackBg={accent} style={{ position: "absolute", top: 20, left: SIDE / 2 - 64 }} />
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDE, paddingHorizontal: 18, paddingTop: 136 }}>
          <SideSummary doc={doc} st={st} />
          <SideContact doc={doc} st={st} width={SIDE - 36} />
          <SideLanguages doc={doc} st={st} bars />
          <SideSkills doc={doc} st={st} />
        </View>
        <View style={{ flex: 1, paddingLeft: 26, paddingRight: 32 }}>
          <View style={{ height: BANNER, marginTop: 6, justifyContent: "center" }}>
            <Text style={{ ...hf, fontSize: nameSize, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", lineHeight: 1.05 }}>{first}</Text>
            {last ? <Text style={{ ...hf, fontSize: nameSize, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", lineHeight: 1.05 }}>{last}</Text> : null}
            {hasText(h.jobTitle) ? (
              <Text style={{ fontSize: fitText(h.jobTitle, NAME_W, 10, { lines: 1, min: 7.5 }), color: tint(accent, 0.75), marginTop: 3 }}>{h.jobTitle}</Text>
            ) : null}
          </View>
          <View style={{ height: 12 }} />
          {renderSections(kit, doc, ["experience", "education", "projects", "certifications", "references"])}
        </View>
      </View>
    </PdfDocument>
  );
}
