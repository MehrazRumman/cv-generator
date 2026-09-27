import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { Fragment, type ReactNode } from "react";
import { formatCitation, selfAuthors } from "@/lib/format/citation";
import { formatDateRange, formatPartialDate } from "@/lib/format/dates";
import { displayUrl, hasText, hrefFor, joinParts } from "@/lib/format/text";
import type { PreparedAcademic } from "@/lib/documents/prepare";
import { PUBLICATION_KINDS, type AcademicSection, type Publication, type PublicationKind } from "@/lib/schemas";
import { Bullets, Entry, LabeledLine, PdfLink, Rich, Section, type Kit } from "../shared/kit";

export const ACADEMIC_TITLES: Record<AcademicSection, string> = {
  researchInterests: "Research Interests",
  education: "Education",
  teaching: "Teaching Experience",
  research: "Research Experience",
  publications: "Publications",
  grants: "Grants & Funding",
  awards: "Awards, Honors & Scholarships",
  presentations: "Conferences & Presentations",
  service: "Professional Service",
  memberships: "Professional Memberships",
  skills: "Skills",
  referees: "Referees",
};

const KIND_TITLES: Record<PublicationKind, string> = {
  journal: "Journal Articles",
  conference: "Conference Papers",
  chapter: "Book Chapters",
  preprint: "Preprints",
};

const PRESENTATION_LABEL = { talk: "Talk", poster: "Poster", invited: "Invited talk", keynote: "Keynote", panel: "Panel" } as const;

export interface AcademicExtras {
  /** Style for publication-group subheadings ("Journal Articles"). */
  subheading: Style;
  /** Style for a citation paragraph. */
  citation: Style;
}

export interface HeaderLink {
  key: string;
  label: string;
  text: string;
  href?: string;
}

/** Contact and profile links for the header, in a stable order. */
export function academicLinks(doc: PreparedAcademic): HeaderLink[] {
  const h = doc.data.header;
  const out: HeaderLink[] = [];
  if (hasText(h.email)) out.push({ key: "email", label: "Email", text: h.email.trim(), href: `mailto:${h.email.trim()}` });
  if (hasText(h.phone)) out.push({ key: "phone", label: "Phone", text: h.phone.trim() });
  if (hasText(h.website)) out.push({ key: "web", label: "Web", text: displayUrl(h.website), href: hrefFor(h.website) });
  if (hasText(h.orcid)) out.push({ key: "orcid", label: "ORCID", text: h.orcid.trim(), href: `https://orcid.org/${h.orcid.trim()}` });
  if (hasText(h.googleScholar)) out.push({ key: "scholar", label: "Google Scholar", text: "Google Scholar", href: hrefFor(h.googleScholar) });
  if (hasText(h.researchGate)) out.push({ key: "rg", label: "ResearchGate", text: "ResearchGate", href: hrefFor(h.researchGate) });
  return out;
}

/** Links rendered inline as whole units (never split mid-item). */
export function LinkRow({ links, style, linkColor, separator = "·", align = "center" }: { links: HeaderLink[]; style: Style; linkColor: string; separator?: string; align?: "center" | "flex-start" }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: align }}>
      {links.map((l, i) => (
        <View key={l.key} style={{ flexDirection: "row" }}>
          {l.href ? (
            <PdfLink href={l.href}>
              <Text style={[style, { color: linkColor }]}>{l.text}</Text>
            </PdfLink>
          ) : (
            <Text style={style}>{l.text}</Text>
          )}
          {i < links.length - 1 ? <Text style={[style, { paddingHorizontal: 5 }]}>{separator}</Text> : null}
        </View>
      ))}
    </View>
  );
}

type Block = (kit: Kit, x: AcademicExtras, doc: PreparedAcademic) => ReactNode;

const researchInterests: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.researchInterests}>
    <Text style={kit.s.paragraph}>{doc.data.researchInterests.join(" · ")}</Text>
  </Section>
);

const education: Block = (kit, x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.education}>
    {doc.data.education.map((e) => (
      <Entry
        key={e.id}
        kit={kit}
        title={joinParts([e.degree, e.fieldOfStudy], " in ")}
        subtitle={joinParts([e.institution, e.location], ", ")}
        date={formatDateRange(e.period, "Expected")}
        meta={e.result}
      >
        {hasText(e.thesisTitle) ? (
          <Text style={[kit.s.paragraph, { marginTop: 1 }]}>
            <Text style={kit.s.label}>Thesis: </Text>
            <Text style={{ fontStyle: "italic" }}>{e.thesisTitle.trim()}</Text>
          </Text>
        ) : null}
        {hasText(e.supervisor) ? (
          <Text style={kit.s.paragraph}>
            <Text style={kit.s.label}>Supervisor: </Text>
            {e.supervisor.trim()}
          </Text>
        ) : null}
      </Entry>
    ))}
  </Section>
);

const teaching: Block = (kit, x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.teaching}>
    {doc.data.teaching.map((t) => (
      <Entry key={t.id} kit={kit} title={t.position} subtitle={joinParts([t.organization, t.location], ", ")} date={formatDateRange(t.period)} bullets={t.bullets}>
        {t.courses.length ? (
          <View>
            <Text style={[kit.s.paragraph, kit.s.label, { marginTop: 2 }]}>Courses taught</Text>
            <Bullets kit={kit} items={t.courses} />
          </View>
        ) : null}
      </Entry>
    ))}
  </Section>
);

const research: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.research}>
    {doc.data.research.map((r) => (
      <Entry
        key={r.id}
        kit={kit}
        title={r.position}
        subtitle={joinParts([r.organization, r.location], ", ")}
        date={formatDateRange(r.period)}
        meta={hasText(r.supervisor) ? `Supervisor: ${r.supervisor.trim()}` : undefined}
        bullets={r.bullets}
      />
    ))}
  </Section>
);

const publications: Block = (kit, x, doc) => {
  const style = doc.settings.citationStyle;
  const selves = selfAuthors(doc.data.header.fullName, doc.data.authorAliases);
  const groups = PUBLICATION_KINDS.map((kind) => ({ kind, items: doc.data.publications.filter((p) => p.kind === kind) })).filter(
    (g) => g.items.length > 0,
  );
  let n = 0;
  const cite = (p: Publication) => {
    n += 1;
    const segments = formatCitation(p, style, selves);
    return style === "ieee" ? (
      <View key={p.id} style={{ flexDirection: "row", marginBottom: 4 }} wrap={false}>
        <Text style={[x.citation, { width: 24 }]}>[{n}]</Text>
        <Rich segments={segments} style={[x.citation, { flex: 1 }]} />
      </View>
    ) : (
      <View key={p.id} style={{ marginBottom: 4, paddingLeft: 16 }} wrap={false}>
        {/* APA hanging indent: the first line starts 16pt left of the rest. */}
        <Rich segments={segments} style={x.citation} textIndent={-16} />
      </View>
    );
  };
  // Each group's subheading travels with its first citation.
  const children = groups.flatMap((g) => {
    const [first, ...rest] = g.items;
    return [
      <View key={`${g.kind}-head`} wrap={false}>
        <Text style={x.subheading}>{KIND_TITLES[g.kind]}</Text>
        {cite(first)}
      </View>,
      ...rest.map(cite),
    ];
  });
  return (
    <Section kit={kit} title={ACADEMIC_TITLES.publications}>
      {children}
    </Section>
  );
};

const grants: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.grants}>
    {doc.data.grants.map((g) => (
      <Entry key={g.id} kit={kit} title={g.title} subtitle={g.funder} date={formatDateRange(g.period)} meta={joinParts([g.role, g.amount], " · ")} />
    ))}
  </Section>
);

const awards: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.awards}>
    {doc.data.awards.map((a) => (
      <Entry key={a.id} kit={kit} title={a.title} subtitle={a.issuer} date={formatPartialDate(a.date)} meta={a.description} />
    ))}
  </Section>
);

const presentations: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.presentations}>
    {doc.data.presentations.map((p) => (
      <Entry
        key={p.id}
        kit={kit}
        title={`“${p.title.trim()}”`}
        subtitle={joinParts([p.event, p.location], ", ")}
        date={formatPartialDate(p.date)}
        meta={PRESENTATION_LABEL[p.kind]}
      />
    ))}
  </Section>
);

const service: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.service}>
    {doc.data.service.map((s) => (
      <Entry key={s.id} kit={kit} title={s.role} subtitle={s.organization} date={formatDateRange(s.period)} />
    ))}
  </Section>
);

const memberships: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.memberships}>
    {doc.data.memberships.map((m) => (
      <Entry key={m.id} kit={kit} title={m.organization} subtitle={m.role} date={formatDateRange(m.period)} />
    ))}
  </Section>
);

const skills: Block = (kit, _x, doc) => (
  <Section kit={kit} title={ACADEMIC_TITLES.skills}>
    {doc.data.skills.map((g) => (
      <LabeledLine key={g.id} kit={kit} label={g.category} value={g.items.join(", ")} />
    ))}
  </Section>
);

const referees: Block = (kit, _x, doc) => {
  const cards = doc.data.referees.map((r) => (
    <View key={r.id} style={{ width: "50%", paddingRight: 14, marginBottom: 8 }} wrap={false}>
      <Text style={kit.s.entryTitle}>{r.name}</Text>
      {hasText(r.designation) ? <Text style={kit.s.entrySubtitle}>{r.designation}</Text> : null}
      {hasText(r.organization) ? <Text style={kit.s.entrySubtitle}>{r.organization}</Text> : null}
      {hasText(r.relationship) ? <Text style={kit.s.entryMeta}>{r.relationship}</Text> : null}
      {hasText(r.email) ? <Text style={kit.s.entryMeta}>{r.email}</Text> : null}
      {hasText(r.phone) ? <Text style={kit.s.entryMeta}>{r.phone}</Text> : null}
    </View>
  ));
  const rows: ReactNode[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    rows.push(
      <View key={i} style={{ flexDirection: "row" }} wrap={false}>
        {cards.slice(i, i + 2)}
      </View>,
    );
  }
  return (
    <Section kit={kit} title={ACADEMIC_TITLES.referees}>
      {rows}
    </Section>
  );
};

const BLOCKS: Record<AcademicSection, Block> = {
  researchInterests,
  education,
  teaching,
  research,
  publications,
  grants,
  awards,
  presentations,
  service,
  memberships,
  skills,
  referees,
};

/** Conventional order for faculty applications. */
export const ACADEMIC_ORDER: AcademicSection[] = [
  "researchInterests",
  "education",
  "teaching",
  "research",
  "publications",
  "grants",
  "awards",
  "presentations",
  "service",
  "memberships",
  "skills",
  "referees",
];

export function renderAcademicSections(kit: Kit, x: AcademicExtras, doc: PreparedAcademic): ReactNode {
  return ACADEMIC_ORDER.filter((k) => doc.show[k]).map((k) => <Fragment key={k}>{BLOCKS[k](kit, x, doc)}</Fragment>);
}
