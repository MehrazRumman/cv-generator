import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { Fragment, type ReactNode } from "react";
import { formatDateRange, formatPartialDate } from "@/lib/format/dates";
import { displayUrl, hasText, hrefFor, joinParts } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import type { ProfessionalSection } from "@/lib/schemas";
import { Entry, LabeledLine, PdfLink, Section, type Kit } from "../shared/kit";

export const SECTION_TITLES: Record<ProfessionalSection, string> = {
  photo: "Photo",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
  languages: "Languages",
  references: "References",
};

export const LEVEL_LABEL = {
  native: "Native",
  fluent: "Fluent",
  professional: "Professional",
  intermediate: "Intermediate",
  basic: "Basic",
} as const;

export interface ContactItem {
  key: string;
  text: string;
  href?: string;
}

/** Header contact line items in a stable order, skipping empty fields. */
export function contactItems(doc: PreparedProfessional): ContactItem[] {
  const h = doc.data.header;
  const items: ContactItem[] = [];
  if (hasText(h.phone)) items.push({ key: "phone", text: h.phone.trim(), href: `tel:${h.phone.replace(/[^\d+]/g, "")}` });
  if (hasText(h.email)) items.push({ key: "email", text: h.email.trim(), href: `mailto:${h.email.trim()}` });
  if (hasText(h.location)) items.push({ key: "location", text: h.location.trim() });
  if (hasText(h.linkedin)) items.push({ key: "linkedin", text: displayUrl(h.linkedin), href: hrefFor(h.linkedin) });
  if (hasText(h.github)) items.push({ key: "github", text: displayUrl(h.github), href: hrefFor(h.github) });
  if (hasText(h.portfolio)) items.push({ key: "portfolio", text: displayUrl(h.portfolio), href: hrefFor(h.portfolio) });
  return items;
}

/** Contact items that wrap as whole units (never mid-item), separated by `separator`; links are clickable. */
export function ContactLine({
  items,
  separator,
  style,
  linkColor,
  align = "center",
}: {
  items: ContactItem[];
  separator: string;
  style: Style;
  linkColor?: string;
  align?: "center" | "flex-start" | "flex-end";
}) {
  const color = linkColor ?? (typeof style.color === "string" ? style.color : undefined);
  // react-pdf trims leading/trailing spaces of a text run, so the separator's spaces become padding.
  const mark = separator.trim();
  const gap = ((separator.length - mark.length) / 2) * 2.6;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: align, marginTop: style.marginTop }}>
      {items.map((item, i) => (
        <View key={item.key} style={{ flexDirection: "row" }}>
          {item.href ? (
            <PdfLink href={item.href}>
              <Text style={[style, { marginTop: 0, color }]}>{item.text}</Text>
            </PdfLink>
          ) : (
            <Text style={[style, { marginTop: 0 }]}>{item.text}</Text>
          )}
          {i < items.length - 1 ? <Text style={[style, { marginTop: 0, paddingHorizontal: gap }]}>{mark}</Text> : null}
        </View>
      ))}
    </View>
  );
}

type Block = (kit: Kit, doc: PreparedProfessional) => ReactNode;

const summary: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.summary}>
    <Text style={kit.s.paragraph}>{doc.data.summary.trim()}</Text>
  </Section>
);

const experience: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.experience}>
    {doc.data.experience.map((e) => (
      <Entry
        key={e.id}
        kit={kit}
        title={e.position}
        subtitle={joinParts([e.organization, e.location], " · ")}
        date={formatDateRange(e.period)}
        bullets={e.bullets}
      />
    ))}
  </Section>
);

const education: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.education}>
    {doc.data.education.map((e) => (
      <Entry
        key={e.id}
        kit={kit}
        title={joinParts([e.degree, e.fieldOfStudy], " in ")}
        subtitle={joinParts([e.institution, e.location], " · ")}
        date={formatDateRange(e.period, "Expected")}
        meta={e.result}
      />
    ))}
  </Section>
);

const skills: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.skills}>
    {doc.data.skills.map((g) => (
      <LabeledLine key={g.id} kit={kit} label={g.category} value={g.items.join(", ")} />
    ))}
  </Section>
);

const certifications: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.certifications}>
    {doc.data.certifications.map((c) => (
      <Entry
        key={c.id}
        kit={kit}
        title={c.name}
        subtitle={c.issuer}
        date={formatPartialDate(c.date)}
        meta={joinParts([hasText(c.credentialId) ? `Credential ID ${c.credentialId}` : "", displayUrl(c.url)], " · ")}
      />
    ))}
  </Section>
);

const projects: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.projects}>
    {doc.data.projects.map((p) => (
      <Entry
        key={p.id}
        kit={kit}
        title={joinParts([p.name, p.role], " — ")}
        subtitle={p.technologies.join(", ")}
        date={formatDateRange(p.period)}
        bullets={p.bullets}
      >
        {hasText(p.url) ? (
          <PdfLink href={hrefFor(p.url)} style={kit.s.link}>
            <Text style={kit.s.link}>{displayUrl(p.url)}</Text>
          </PdfLink>
        ) : null}
      </Entry>
    ))}
  </Section>
);

const languages: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.languages}>
    <Text style={kit.s.paragraph}>
      {doc.data.languages.map((l, i) => (
        <Text key={l.id}>
          {i > 0 ? " · " : ""}
          <Text style={kit.s.label}>{l.name}</Text> ({LEVEL_LABEL[l.level]})
        </Text>
      ))}
    </Text>
  </Section>
);

const references: Block = (kit, doc) => (
  <Section kit={kit} title={SECTION_TITLES.references}>
    {doc.data.references.mode === "on-request" ? (
      <Text style={kit.s.paragraph}>Available on request.</Text>
    ) : (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {doc.data.references.items.map((r) => (
          <View key={r.id} style={{ width: "50%", paddingRight: 12, marginBottom: 6 }} wrap={false}>
            <Text style={kit.s.entryTitle}>{r.name}</Text>
            {hasText(r.designation) || hasText(r.organization) ? (
              <Text style={kit.s.entrySubtitle}>{joinParts([r.designation, r.organization], ", ")}</Text>
            ) : null}
            {hasText(r.relationship) ? <Text style={kit.s.entryMeta}>{r.relationship}</Text> : null}
            {hasText(r.email) || hasText(r.phone) ? (
              <Text style={kit.s.entryMeta}>{joinParts([r.email, r.phone], " · ")}</Text>
            ) : null}
          </View>
        ))}
      </View>
    )}
  </Section>
);

export const PROFESSIONAL_BLOCKS: Record<Exclude<ProfessionalSection, "photo">, Block> = {
  summary,
  experience,
  education,
  skills,
  certifications,
  projects,
  languages,
  references,
};

/** Standard ATS order. Templates may pass a subset (e.g. the sidebar template moves skills aside). */
export const DEFAULT_ORDER: Exclude<ProfessionalSection, "photo">[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "references",
];

export function renderSections(kit: Kit, doc: PreparedProfessional, order = DEFAULT_ORDER): ReactNode {
  // Fragments, not Views: sections must stay flat for correct pagination (see <Section>).
  return order.filter((key) => doc.show[key]).map((key) => <Fragment key={key}>{PROFESSIONAL_BLOCKS[key](kit, doc)}</Fragment>);
}
