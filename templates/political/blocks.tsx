import { Text, View } from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import { ageInYears, rangeEndYear } from "@/lib/format/dates";
import { displayUrl, hasText, joinParts } from "@/lib/format/text";
import { partyName, PARTIES } from "@/lib/documents/parties";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import type { PoliticalSection } from "@/lib/schemas";
import { Glued, KVList, KVRow, present, Table, type BioKit, type Column, type KV } from "../biodata/blocks";
import { formatBiodataDate, formatBiodataRange, localizeDigits, type LabelLanguage } from "../biodata/labels";
import { POLITICAL_LABELS, type PoliticalLabels } from "./labels";

export function labelsFor(doc: PreparedPolitical): { t: PoliticalLabels; lang: LabelLanguage } {
  const lang = doc.settings.labelLanguage;
  return { t: POLITICAL_LABELS[lang], lang };
}

/** Title, name, party and one-line position shared by all political headers. */
export function headerInfo(doc: PreparedPolitical) {
  const { t, lang } = labelsFor(doc);
  const r = doc.data.partyRole;
  const c = doc.data.contact;
  return {
    title: t.title,
    name: doc.data.personal.fullName.trim(),
    party: partyName(doc.data.party, doc.data.partyName, lang),
    role: joinParts([r.position, r.committee], ", "),
    contact: joinParts([c.phone, c.email], " · "),
    photo: doc.show.photo ? doc.data.photo : null,
    lang,
  };
}

type Block = (kit: BioKit, doc: PreparedPolitical) => ReactNode;

const personal: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  const p = doc.data.personal;
  const age = ageInYears(p.dateOfBirth);
  const rows = present([
    { label: t.fields.fullName, value: p.fullName },
    { label: t.fields.fathersName, value: p.fathersName },
    { label: t.fields.mothersName, value: p.mothersName },
    { label: t.fields.spouseName, value: p.spouseName },
    { label: t.fields.dateOfBirth, value: hasText(p.dateOfBirth) ? formatBiodataDate(p.dateOfBirth, lang) : "" },
    { label: t.fields.age, value: age !== null ? t.years(age) : "" },
    { label: t.fields.religion, value: p.religion },
    { label: t.fields.nid, value: p.nid },
  ]);
  return <Glued kit={kit} title={t.sections.personal}>{KVList({ kit, rows, columns: kit.twoColumnPersonal ? 2 : 1 })}</Glued>;
};

const rowsOf = (kit: BioKit, rows: KV[]) => rows.map((r, i) => <KVRow key={i} kit={kit} row={r} />);

const contact: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  const c = doc.data.contact;
  const rows = present([
    { label: t.fields.presentAddress, value: c.presentAddress },
    { label: t.fields.permanentAddress, value: c.permanentAddress },
    { label: t.fields.phone, value: c.phone },
    { label: t.fields.email, value: c.email },
    { label: t.fields.facebook, value: hasText(c.facebook) ? displayUrl(c.facebook) : "" },
  ]);
  return <Glued kit={kit} title={t.sections.contact}>{rowsOf(kit, rows)}</Glued>;
};

const partyRole: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  const r = doc.data.partyRole;
  const rows = present([
    { label: t.fields.party, value: partyName(doc.data.party, doc.data.partyName, lang) },
    { label: t.fields.position, value: r.position },
    { label: t.fields.committee, value: r.committee },
    { label: t.fields.memberSince, value: localizeDigits(r.memberSince, lang) },
    { label: t.fields.membershipNo, value: r.membershipNo },
  ]);
  return <Glued kit={kit} title={t.sections.partyRole}>{rowsOf(kit, rows)}</Glued>;
};

const nomination: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  const n = doc.data.nomination;
  const symbol = PARTIES[doc.data.party].symbol;
  const rows = present([
    { label: t.fields.election, value: n.election },
    { label: t.fields.constituency, value: n.constituency },
    { label: t.fields.area, value: n.area },
    { label: t.fields.symbol, value: symbol ? symbol[lang] : "" },
  ]);
  return <Glued kit={kit} title={t.sections.nomination}>{rowsOf(kit, rows)}</Glued>;
};

const positions: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  type Row = PreparedPolitical["data"]["positions"][number];
  const columns: Column<Row>[] = [
    { title: t.table.position, width: 1.3, value: (r) => r.position },
    { title: t.table.organization, width: 2.2, value: (r) => r.organization },
    { title: t.table.level, width: 1.1, value: (r) => (r.level ? t.level[r.level] : "") },
    { title: t.table.period, width: 1.3, value: (r) => formatBiodataRange(r.period, lang) },
  ];
  return <Glued kit={kit} title={t.sections.positions}>{Table({ kit, columns, rows: doc.data.positions })}</Glued>;
};

const elections: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  type Row = PreparedPolitical["data"]["elections"][number];
  const columns: Column<Row>[] = [
    { title: t.table.election, width: 2, value: (r) => r.election },
    { title: t.table.post, width: 1.3, value: (r) => r.post },
    { title: t.table.constituency, width: 1.4, value: (r) => r.constituency },
    { title: t.table.year, width: 0.7, value: (r) => localizeDigits(r.year, lang) },
    { title: t.table.result, width: 0.9, value: (r) => (r.result ? t.result[r.result] : "") },
    { title: t.table.votes, width: 0.9, value: (r) => r.votes },
  ];
  return <Glued kit={kit} title={t.sections.elections}>{Table({ kit, columns, rows: doc.data.elections })}</Glued>;
};

const movements: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  return (
    <Glued kit={kit} title={t.sections.movements}>
      {doc.data.movements.map((m) => (
        <View key={m.id} style={{ marginBottom: 5 }} wrap={false}>
          <Text style={kit.s.entryTitle}>{joinParts([m.title, hasText(m.year) ? `(${m.year.trim()})` : ""], " ")}</Text>
          {hasText(m.description) ? <Text style={kit.s.entryMeta}>{m.description.trim()}</Text> : null}
        </View>
      ))}
    </Glued>
  );
};

const cases: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  type Row = PreparedPolitical["data"]["cases"][number];
  const columns: Column<Row>[] = [
    { title: t.table.description, width: 3, value: (r) => r.description },
    { title: t.table.year, width: 0.8, value: (r) => r.year },
    { title: t.table.status, width: 1.2, value: (r) => r.status },
  ];
  return <Glued kit={kit} title={t.sections.cases}>{Table({ kit, columns, rows: doc.data.cases })}</Glued>;
};

const education: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  type Row = PreparedPolitical["data"]["education"][number];
  const columns: Column<Row>[] = [
    { title: t.table.degree, width: 1.4, value: (r) => joinParts([r.degree, r.fieldOfStudy], lang === "bn" ? " – " : " in ") },
    { title: t.table.institution, width: 2, value: (r) => r.institution },
    { title: t.table.board, width: 1.3, value: (r) => r.board },
    { title: t.table.passingYear, width: 0.8, value: (r) => localizeDigits(rangeEndYear(r.period, t.running), lang) },
    { title: t.table.result, width: 1, value: (r) => r.result },
  ];
  return <Glued kit={kit} title={t.sections.education}>{Table({ kit, columns, rows: doc.data.education })}</Glued>;
};

const occupation: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  return (
    <Glued kit={kit} title={t.sections.occupation}>
      {doc.data.occupation.map((o) => (
        <View key={o.id} style={{ marginBottom: 6 }} wrap={false}>
          <Text style={kit.s.entryTitle}>{joinParts([o.position, o.organization], ", ")}</Text>
          {hasText(joinParts([o.location, formatBiodataRange(o.period, lang)], "")) ? (
            <Text style={kit.s.entryMeta}>{joinParts([o.location, formatBiodataRange(o.period, lang)], " · ")}</Text>
          ) : null}
          {o.bullets.map((b, i) => (
            <View key={i} style={kit.s.bulletRow}>
              <Text style={{ width: 9 }}>•</Text>
              <Text style={kit.s.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ))}
    </Glued>
  );
};

const socialWork: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  type Row = PreparedPolitical["data"]["socialWork"][number];
  const columns: Column<Row>[] = [
    { title: t.table.role, width: 1.3, value: (r) => r.role },
    { title: t.table.organization, width: 2.6, value: (r) => r.organization },
    { title: t.table.period, width: 1.3, value: (r) => formatBiodataRange(r.period, lang) },
  ];
  return <Glued kit={kit} title={t.sections.socialWork}>{Table({ kit, columns, rows: doc.data.socialWork })}</Glued>;
};

const declaration: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  const d = doc.data.declaration;
  const sig = kit.s.signature ?? kit.s.paragraph;
  return (
    <View wrap={false} style={kit.s.sectionGap}>
      {kit.heading(t.sections.declaration)}
      <Text style={kit.s.paragraph}>{d.text.trim()}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
        <View>
          {hasText(d.place) ? (
            <Text style={sig}>
              {t.fields.place}: {d.place}
            </Text>
          ) : null}
          {hasText(d.date) ? (
            <Text style={sig}>
              {t.fields.date}: {formatBiodataDate(d.date, lang)}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 170, alignItems: "center" }}>
          <View style={{ width: "100%", borderTopWidth: 0.8, borderTopColor: "#444444", marginBottom: 3 }} />
          <Text style={sig}>{t.fields.signature}</Text>
          <Text style={[sig, { fontSize: 8.5 }]}>({doc.data.personal.fullName})</Text>
        </View>
      </View>
    </View>
  );
};

export const POLITICAL_BLOCKS: Record<Exclude<PoliticalSection, "photo">, Block> = {
  personal,
  contact,
  partyRole,
  nomination,
  positions,
  elections,
  movements,
  cases,
  education,
  occupation,
  socialWork,
  declaration,
};

/** The usual order of a Bangladeshi party nomination CV. */
export const POLITICAL_ORDER: Exclude<PoliticalSection, "photo">[] = [
  "personal",
  "contact",
  "partyRole",
  "nomination",
  "positions",
  "elections",
  "movements",
  "cases",
  "education",
  "occupation",
  "socialWork",
  "declaration",
];

/** Visible sections in order, as a flat list of fragments (see <Section> in shared/kit for why flat). */
export function renderPoliticalSections(kit: BioKit, doc: PreparedPolitical, order = POLITICAL_ORDER): ReactNode {
  return order.filter((key) => doc.show[key]).map((key) => <Fragment key={key}>{POLITICAL_BLOCKS[key](kit, doc)}</Fragment>);
}
