import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { Fragment, type ReactNode } from "react";
import { formatDateRange, formatNumericIsoDate, formatNumericPartialDate } from "@/lib/format/dates";
import { displayUrl, hasText, hrefFor, joinParts } from "@/lib/format/text";
import type { PreparedEuropass } from "@/lib/documents/prepare";
import { CEFR_SKILLS, type CefrSkill, type EuropassAdditional, type EuropassLanguage, type EuropassSection } from "@/lib/schemas";
import { Bullets, Entry, LabeledLine, PdfLink, Section, type Kit } from "../shared/kit";

export const EUROPASS_TITLES: Record<Exclude<EuropassSection, "photo" | "skills" | "additional">, string> = {
  aboutMe: "About me",
  experience: "Work experience",
  education: "Education and training",
  languages: "Language skills",
  digitalSkills: "Digital skills",
  drivingLicence: "Driving licence",
  hobbies: "Hobbies and interests",
};

const SKILL_LABEL: Record<CefrSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  spokenProduction: "Spoken production",
  spokenInteraction: "Spoken interaction",
  writing: "Writing",
};

/** The Europass grid's column groups, each spanning some of CEFR_SKILLS. */
const SKILL_GROUPS = [
  { label: "Understanding", span: 2 },
  { label: "Speaking", span: 2 },
  { label: "Writing", span: 1 },
] as const;

export const CEFR_LEGEND = "Levels: A1 and A2: Basic user; B1 and B2: Independent user; C1 and C2: Proficient user";

/** Europass dates: "08/2021 – Current". */
export const europassRange = (range: { start: string; end: string; current: boolean }) =>
  formatDateRange(range, "Current", formatNumericPartialDate);

export interface EuropassExtras {
  /** Colours of the language grid. */
  grid: { line: string; headBackground: string; headText: string; text: string; muted: string };
}

export interface Detail {
  key: string;
  label: string;
  text: string;
  href?: string;
}

/** Personal details for the header (date of birth, nationality, gender), skipping empty fields. */
export function personalDetails(doc: PreparedEuropass): Detail[] {
  const h = doc.data.header;
  const out: Detail[] = [];
  if (hasText(h.dateOfBirth)) out.push({ key: "dob", label: "Date of birth", text: formatNumericIsoDate(h.dateOfBirth) });
  if (hasText(h.nationality)) out.push({ key: "nationality", label: "Nationality", text: h.nationality.trim() });
  if (hasText(h.gender)) out.push({ key: "gender", label: "Gender", text: h.gender.trim() });
  return out;
}

/** Contact details for the header, skipping empty fields. The address is last: it is usually the longest. */
export function contactDetails(doc: PreparedEuropass): Detail[] {
  const h = doc.data.header;
  const out: Detail[] = [];
  if (hasText(h.phone)) out.push({ key: "phone", label: "Phone", text: h.phone.trim(), href: `tel:${h.phone.replace(/[^\d+]/g, "")}` });
  if (hasText(h.email)) out.push({ key: "email", label: "Email", text: h.email.trim(), href: `mailto:${h.email.trim()}` });
  if (hasText(h.website)) out.push({ key: "website", label: "Website", text: displayUrl(h.website), href: hrefFor(h.website) });
  if (hasText(h.linkedin)) out.push({ key: "linkedin", label: "LinkedIn", text: displayUrl(h.linkedin), href: hrefFor(h.linkedin) });
  if (hasText(h.address)) out.push({ key: "address", label: "Address", text: h.address.trim() });
  return out;
}

/** "Label: value" items that wrap as whole units; links are clickable. */
export function DetailLine({
  items,
  style,
  labelStyle,
  linkColor,
  gap = 12,
}: {
  items: Detail[];
  style: Style;
  labelStyle: Style;
  linkColor?: string;
  gap?: number;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: style.marginTop }}>
      {items.map((item, i) => {
        const value = <Text style={[style, { marginTop: 0 }, item.href && linkColor ? { color: linkColor } : {}]}>{item.text}</Text>;
        return (
          <View key={item.key} style={{ flexDirection: "row", marginRight: i < items.length - 1 ? gap : 0 }}>
            <Text style={[style, { marginTop: 0 }, labelStyle]}>{item.label}: </Text>
            {item.href ? <PdfLink href={item.href}>{value}</PdfLink> : value}
          </View>
        );
      })}
    </View>
  );
}

/** Additional-information entries grouped by category (case-insensitive), in first-seen order. */
export function groupByCategory(items: EuropassAdditional[]): { category: string; items: EuropassAdditional[] }[] {
  const groups = new Map<string, { category: string; items: EuropassAdditional[] }>();
  for (const item of items) {
    const category = item.category.trim() || "Additional information";
    const key = category.toLowerCase();
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { category, items: [item] });
  }
  return [...groups.values()];
}

/* ------------------------------------------------------------------ */
/* Language grid                                                       */
/* ------------------------------------------------------------------ */

const NAME_WIDTH = "25%";
const LEVEL_WIDTH = "15%";

/**
 * The Europass self-assessment grid as separate unbreakable blocks, so a long grid can continue on the
 * next page between languages: the column headings travel with the first language, the legend with the last.
 */
function languageGrid(kit: Kit, x: EuropassExtras, languages: EuropassLanguage[]): ReactNode[] {
  const g = x.grid;
  const size = typeof kit.s.paragraph.fontSize === "number" ? kit.s.paragraph.fontSize : 10;
  const line = { width: 0.6, color: g.line };
  // Every row draws its own side borders: rows on different pages must each look framed.
  const row: Style = {
    flexDirection: "row",
    borderBottomWidth: line.width,
    borderBottomColor: line.color,
    borderLeftWidth: line.width,
    borderLeftColor: line.color,
    borderRightWidth: line.width,
    borderRightColor: line.color,
  };
  const cell: Style = { paddingVertical: 3, paddingHorizontal: 2, textAlign: "center", borderLeftWidth: line.width, borderLeftColor: line.color };
  const headRow = [row, { backgroundColor: g.headBackground }];

  const header = (
    <>
      <View style={[...headRow, { borderTopWidth: line.width, borderTopColor: line.color }]}>
        <View style={{ width: NAME_WIDTH }} />
        {SKILL_GROUPS.map((group) => (
          <Text
            key={group.label}
            style={[cell, { width: `${15 * group.span}%`, fontSize: size - 2.5, fontWeight: 700, color: g.headText, textTransform: "uppercase", letterSpacing: 0.3 }]}
          >
            {group.label}
          </Text>
        ))}
      </View>
      <View style={headRow}>
        <View style={{ width: NAME_WIDTH }} />
        {CEFR_SKILLS.map((skill) => (
          <Text key={skill} style={[cell, { width: LEVEL_WIDTH, fontSize: size - 2.3, color: g.headText }]}>
            {SKILL_LABEL[skill]}
          </Text>
        ))}
      </View>
    </>
  );
  const legend = <Text style={{ marginTop: 3, fontSize: size - 2.5, color: g.muted }}>{CEFR_LEGEND}</Text>;

  return languages.map((l, i) => (
    <View key={l.id} wrap={false} style={i === 0 ? { marginTop: 3 } : undefined}>
      {i === 0 ? header : null}
      <View style={row}>
        <Text style={{ width: NAME_WIDTH, paddingVertical: 3, paddingHorizontal: 4, fontSize: size - 0.5, fontWeight: 700, color: g.text }}>{l.name}</Text>
        {CEFR_SKILLS.map((skill) => (
          <Text key={skill} style={[cell, { width: LEVEL_WIDTH, fontSize: size - 0.5, fontWeight: 700, color: g.text }]}>
            {l[skill] || "–"}
          </Text>
        ))}
      </View>
      {hasText(l.certificate) ? (
        <View style={row}>
          <View style={{ width: NAME_WIDTH }} />
          <Text style={[cell, { width: "75%", textAlign: "left", paddingHorizontal: 4, fontSize: size - 1.5, fontStyle: "italic", color: g.muted }]}>
            {l.certificate}
          </Text>
        </View>
      ) : null}
      {i === languages.length - 1 ? legend : null}
    </View>
  ));
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

type Block = (kit: Kit, x: EuropassExtras, doc: PreparedEuropass) => ReactNode;

const aboutMe: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.aboutMe} id="aboutMe">
    <Text style={kit.s.paragraph}>{doc.data.aboutMe.trim()}</Text>
  </Section>
);

const experience: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.experience} id="experience">
    {doc.data.experience.map((e) => (
      <Entry
        key={e.id}
        kit={kit}
        title={e.position}
        subtitle={joinParts([e.organization, e.location], " · ")}
        date={europassRange(e.period)}
        meta={hasText(e.sector) ? `Business or sector: ${e.sector.trim()}` : undefined}
        bullets={e.bullets}
      />
    ))}
  </Section>
);

const education: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.education} id="education">
    {doc.data.education.map((e) => (
      <Entry
        key={e.id}
        kit={kit}
        title={joinParts([e.degree, e.fieldOfStudy], " in ")}
        subtitle={joinParts([e.institution, e.location], " · ")}
        date={europassRange(e.period)}
        meta={joinParts([hasText(e.result) ? `Final grade: ${e.result.trim()}` : "", e.eqfLevel ? `EQF level ${e.eqfLevel}` : ""], " · ")}
        bullets={e.subjects}
      />
    ))}
  </Section>
);

const languages: Block = (kit, x, doc) => {
  const { motherTongues, other } = doc.data.languages;
  return (
    <Section kit={kit} title={EUROPASS_TITLES.languages} id="languages">
      {motherTongues.length > 0 ? (
        <LabeledLine kit={kit} label={motherTongues.length > 1 ? "Mother tongues" : "Mother tongue"} value={motherTongues.join(", ")} />
      ) : null}
      {languageGrid(kit, x, other)}
    </Section>
  );
};

const digitalSkills: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.digitalSkills} id="digitalSkills">
    <Text style={kit.s.paragraph}>{doc.data.digitalSkills.join(" | ")}</Text>
  </Section>
);

/** Each skill group is its own section, titled by the group ("Organisational skills"), as on a Europass CV. */
const skills: Block = (kit, _x, doc) =>
  doc.data.skills.map((g) => (
    <Section key={g.id} kit={kit} title={g.category} id="skills">
      {g.items.map((item, i) => (
        <Bullets key={i} kit={kit} items={[item]} />
      ))}
    </Section>
  ));

const drivingLicence: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.drivingLicence} id="drivingLicence">
    <LabeledLine kit={kit} label={doc.data.drivingLicence.length > 1 ? "Categories" : "Category"} value={doc.data.drivingLicence.join(", ")} />
  </Section>
);

/** One section per category ("Honours and awards", "Publications", …). */
const additional: Block = (kit, _x, doc) =>
  groupByCategory(doc.data.additional).map((group) => (
    <Section key={group.category} kit={kit} title={group.category} id="additional">
      {group.items.map((a) => (
        <Entry key={a.id} kit={kit} title={a.title} subtitle={a.organization} date={formatNumericPartialDate(a.date)}>
          {hasText(a.description) ? <Text style={[kit.s.paragraph, { marginTop: 1 }]}>{a.description.trim()}</Text> : null}
        </Entry>
      ))}
    </Section>
  ));

const hobbies: Block = (kit, _x, doc) => (
  <Section kit={kit} title={EUROPASS_TITLES.hobbies} id="hobbies">
    <Text style={kit.s.paragraph}>{doc.data.hobbies.join(", ")}</Text>
  </Section>
);

export const EUROPASS_BLOCKS: Record<Exclude<EuropassSection, "photo">, Block> = {
  aboutMe,
  experience,
  education,
  languages,
  digitalSkills,
  skills,
  drivingLicence,
  additional,
  hobbies,
};

/** The order of the Europass CV editor. */
export const EUROPASS_ORDER: Exclude<EuropassSection, "photo">[] = [
  "aboutMe",
  "experience",
  "education",
  "languages",
  "digitalSkills",
  "skills",
  "drivingLicence",
  "additional",
  "hobbies",
];

export function renderEuropassSections(kit: Kit, x: EuropassExtras, doc: PreparedEuropass, order = EUROPASS_ORDER): ReactNode {
  // Fragments, not Views: sections must stay flat for correct pagination (see <Section>).
  return order.filter((key) => doc.show[key]).map((key) => <Fragment key={key}>{EUROPASS_BLOCKS[key](kit, x, doc)}</Fragment>);
}
