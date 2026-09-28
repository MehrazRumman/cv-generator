import { Text, View } from "@react-pdf/renderer";
import { formatPartialDate } from "@/lib/format/dates";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, fitFontSize, headingFont, PdfDocument, PdfLink, Photo, tint, type Kit, untracked } from "../shared/kit";
import { baseKitStyles } from "../shared/presets";
import { contactItems, LEVEL_LABEL, renderSections } from "./blocks";

const SIDEBAR = 185;
const PAD_Y = 36;

/** Tinted left column with photo, contact, skills and languages. Modelled on AltaCV / Deedy (LaTeX). Not ATS-optimised. */
export function Sidebar({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#262626", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.5, { entrySubtitle: { color: accent }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1.2, borderBottomColor: accent, marginBottom: 7, paddingBottom: 2 }}>
        <Text style={{ ...hf, fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</Text>
      </View>
    ),
  };
  const side = { heading: { fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 5, marginTop: 14 }, text: { fontSize: 8.8, color: "#2f2f2f", lineHeight: 1.4 } };
  const h = doc.data.header;
  const d = doc.data;
  return (
    <PdfDocument
      title={`${h.fullName} — CV`}
      author={h.fullName}
      settings={doc.settings}
      pageStyle={{ paddingTop: PAD_Y, paddingBottom: PAD_Y + 6, color: p.text }}
      background={
        <View fixed style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR, backgroundColor: tint(accent, 0.9) }} />
      }
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: SIDEBAR, paddingHorizontal: 18 }}>
          {doc.show.photo && d.photo ? (
            <Photo src={d.photo.dataUrl} aspect={d.photo.aspect} width={110} style={{ alignSelf: "center", borderRadius: d.photo.aspect === "square" ? 55 : 4, marginBottom: 4 }} />
          ) : null}
          <Text style={[side.heading, { marginTop: 4 }]}>Contact</Text>
          {contactItems(doc).map((c) =>
            c.href ? (
              <PdfLink key={c.key} href={c.href}>
                <Text style={[side.text, { marginBottom: 3, fontSize: fitFontSize(c.text, SIDEBAR - 36, side.text.fontSize) }]}>{c.text}</Text>
              </PdfLink>
            ) : (
              <Text key={c.key} style={[side.text, { marginBottom: 3, fontSize: fitFontSize(c.text, SIDEBAR - 36, side.text.fontSize) }]}>
                {c.text}
              </Text>
            ),
          )}
          {doc.show.skills
            ? d.skills.map((g) => (
                <View key={g.id} wrap={false}>
                  <Text style={[side.heading, untracked(g.category)]}>{g.category}</Text>
                  {g.items.map((item, i) => (
                    <Text key={i} style={[side.text, { marginBottom: 1.5 }]}>
                      {item}
                    </Text>
                  ))}
                </View>
              ))
            : null}
          {doc.show.languages ? (
            <View wrap={false}>
              <Text style={side.heading}>Languages</Text>
              {d.languages.map((l) => (
                <Text key={l.id} style={[side.text, { marginBottom: 1.5 }]}>
                  <Text style={{ fontWeight: 700 }}>{l.name}</Text> — {LEVEL_LABEL[l.level]}
                </Text>
              ))}
            </View>
          ) : null}
          {doc.show.certifications ? (
            <View>
              <Text style={side.heading}>Certifications</Text>
              {d.certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 4 }} wrap={false}>
                  <Text style={[side.text, { fontWeight: 700 }]}>{c.name}</Text>
                  <Text style={[side.text, { color: p.muted }]}>
                    {[c.issuer, formatPartialDate(c.date)].filter(hasText).join(", ")}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1, paddingLeft: 22, paddingRight: 32 }}>
          <Text style={{ ...hf, fontSize: 26, fontWeight: 700, color: "#1d1d1d" }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 12, color: accent, marginTop: 2, marginBottom: 4 }}>{h.jobTitle}</Text> : <View style={{ height: 4 }} />}
          {renderSections(kit, doc, ["summary", "experience", "projects", "education", "references"])}
        </View>
      </View>
    </PdfDocument>
  );
}
