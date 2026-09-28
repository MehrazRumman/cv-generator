import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { accentOf, fitFontSize, headingFont, PdfDocument, PdfLink, tint, type Kit, untracked } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { academicLinks, ACADEMIC_TITLES, renderAcademicSections, type AcademicExtras } from "./blocks";

const SIDEBAR = 172;

/**
 * Tinted left column with profiles, research interests, skills and memberships; the academic record
 * on the right. Modelled on AltaCV (LaTeX, LPPL). Not ATS-optimised.
 */
export function AcademicSidebar({ doc }: { doc: PreparedAcademic }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.3, { entrySubtitle: { color: accent }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1.2, borderBottomColor: accent, marginBottom: 6, paddingBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</Text>
      </View>
    ),
  };
  const x: AcademicExtras = {
    subheading: { fontSize: 9.4, fontWeight: 700, color: p.muted, marginTop: 4, marginBottom: 3 },
    citation: { fontSize: 9.1, lineHeight: 1.4, color: p.text },
  };
  const side = {
    heading: { ...hf, fontSize: 9.8, fontWeight: 700 as const, color: accent, textTransform: "uppercase" as const, letterSpacing: 0.8, marginTop: 14, marginBottom: 5 },
    label: { fontSize: 7.8, color: p.muted, marginTop: 3 },
    text: { fontSize: 8.8, color: "#2f2f2f", lineHeight: 1.4 },
  };
  const h = doc.data.header;
  const d = doc.data;
  return (
    <PdfDocument
      title={`${h.fullName} — Curriculum Vitae`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: 34, paddingBottom: 42, color: p.text }}
      background={<View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR, backgroundColor: tint(accent, 0.9) }} />}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDEBAR, paddingHorizontal: 16 }}>
          <Text style={[side.heading, { marginTop: 2 }]}>Contact</Text>
          {academicLinks(doc).map((l) => (
            <View key={l.key} wrap={false}>
              <Text style={side.label}>{l.label}</Text>
              {l.href ? (
                <PdfLink href={l.href}>
                  <Text style={[side.text, { fontSize: fitFontSize(l.text, SIDEBAR - 32, 8.8) }]}>{l.text}</Text>
                </PdfLink>
              ) : (
                <Text style={[side.text, { fontSize: fitFontSize(l.text, SIDEBAR - 32, 8.8) }]}>{l.text}</Text>
              )}
            </View>
          ))}
          {doc.show.researchInterests ? (
            <View wrap={false}>
              <Text style={side.heading}>{ACADEMIC_TITLES.researchInterests}</Text>
              {d.researchInterests.map((r, i) => (
                <Text key={i} style={[side.text, { marginBottom: 2 }]}>
                  {r}
                </Text>
              ))}
            </View>
          ) : null}
          {doc.show.skills
            ? d.skills.map((g) => (
                <View key={g.id} wrap={false}>
                  <Text style={[side.heading, untracked(g.category)]}>{g.category}</Text>
                  <Text style={side.text}>{g.items.join(", ")}</Text>
                </View>
              ))
            : null}
          {doc.show.memberships ? (
            <View wrap={false}>
              <Text style={side.heading}>Memberships</Text>
              {d.memberships.map((m) => (
                <Text key={m.id} style={[side.text, { marginBottom: 2 }]}>
                  {m.organization}
                  {hasText(m.role) ? <Text style={{ color: p.muted }}>{` — ${m.role}`}</Text> : null}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, paddingLeft: 22, paddingRight: 34 }}>
          <Text style={{ ...hf, fontSize: 24, fontWeight: 700, color: "#1d1d1d" }}>{h.fullName}</Text>
          {hasText(h.designation) ? <Text style={{ fontSize: 11.5, color: accent, marginTop: 2 }}>{h.designation}</Text> : null}
          {hasText(h.department) || hasText(h.institution) ? (
            <Text style={{ fontSize: 9.5, color: p.muted, marginTop: 1 }}>{[h.department, h.institution].filter(hasText).join(", ")}</Text>
          ) : null}
          {renderAcademicSections(kit, x, doc, ["education", "teaching", "research", "publications", "grants", "awards", "presentations", "service", "referees"])}
        </View>
      </View>
    </PdfDocument>
  );
}
