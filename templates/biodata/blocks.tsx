import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { Fragment, type ReactNode } from "react";
import { ageInYears, formatDateRange, rangeEndYear } from "@/lib/format/dates";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import type { BiodataSection } from "@/lib/schemas";
import { BIODATA_LABELS, formatBiodataDate, formatBiodataRange, localizeDigits, type BiodataLabels, type LabelLanguage } from "./labels";

/** Styles a biodata template provides; the shared renderers below do the rest. */
export interface BioKit {
  heading: (title: string) => ReactNode;
  s: {
    kvRow: Style;
    kvLabel: Style;
    kvColon: Style;
    kvValue: Style;
    paragraph: Style;
    table: Style;
    headRow: Style;
    headCell: Style;
    row: Style;
    rowAlt?: Style;
    cell: Style;
    entryTitle: Style;
    entryMeta: Style;
    bulletRow: Style;
    bulletText: Style;
    subheading: Style;
    sectionGap: Style;
    /** Place/date/signature lines under the declaration; defaults to `paragraph`. */
    signature?: Style;
  };
  /** Width of the label column in key–value rows. */
  labelWidth: number;
  /** Lay personal information out in two columns of key–value pairs. */
  twoColumnPersonal?: boolean;
  /** Print the ":" between label and value (off for bordered/table layouts). Default true. */
  colon?: boolean;
}

export interface KV {
  label: string;
  value: string;
}

export function labelsFor(doc: PreparedBiodata): { t: BiodataLabels; lang: LabelLanguage } {
  const lang = doc.settings.labelLanguage;
  return { t: BIODATA_LABELS[lang], lang };
}

const present = (rows: KV[]) => rows.filter((r) => hasText(r.value));

/** Heading glued to the first block so it's never left alone at the bottom of a page. */
function Glued({ kit, title, children }: { kit: BioKit; title: string; children: ReactNode }) {
  const [first, ...rest] = Array.isArray(children) ? children.flat() : [children];
  return (
    <>
      <View wrap={false} style={kit.s.sectionGap}>
        {kit.heading(title)}
        {first}
      </View>
      {rest}
    </>
  );
}

function KVRow({ kit, row }: { kit: BioKit; row: KV }) {
  return (
    <View style={kit.s.kvRow} wrap={false}>
      <Text style={[kit.s.kvLabel, { width: kit.labelWidth }]}>{row.label}</Text>
      {kit.colon === false ? null : <Text style={kit.s.kvColon}>:</Text>}
      <Text style={kit.s.kvValue}>{row.value}</Text>
    </View>
  );
}

function KVList({ kit, rows, columns = 1 }: { kit: BioKit; rows: KV[]; columns?: 1 | 2 }) {
  if (columns === 1) return rows.map((r, i) => <KVRow key={i} kit={kit} row={r} />);
  const pairs: KV[][] = [];
  for (let i = 0; i < rows.length; i += 2) pairs.push(rows.slice(i, i + 2));
  const half = { ...kit, labelWidth: kit.labelWidth * 0.78 };
  return pairs.map((pair, i) => (
    <View key={i} style={{ flexDirection: "row" }} wrap={false}>
      {pair.map((r, j) => (
        <View key={j} style={{ width: "50%", paddingRight: j === 0 ? 10 : 0 }}>
          <KVRow kit={half} row={r} />
        </View>
      ))}
    </View>
  ));
}

interface Column<Row> {
  title: string;
  width: number; // flex weight
  value: (row: Row) => string;
}

function Table<Row>({ kit, columns, rows, caption }: { kit: BioKit; columns: Column<Row>[]; rows: Row[]; caption?: ReactNode }) {
  const visible = columns.filter((c) => rows.some((r) => hasText(c.value(r))));
  const head = (
    <View style={kit.s.headRow} wrap={false}>
      {visible.map((c) => (
        <Text key={c.title} style={[kit.s.headCell, { flex: c.width }]}>
          {c.title}
        </Text>
      ))}
    </View>
  );
  const body = rows.map((r, i) => (
    <View key={i} style={[kit.s.row, i % 2 === 1 && kit.s.rowAlt ? kit.s.rowAlt : {}]} wrap={false}>
      {visible.map((c) => (
        <Text key={c.title} style={[kit.s.cell, { flex: c.width }]}>
          {c.value(r)}
        </Text>
      ))}
    </View>
  ));
  // Header + first row travel together; the table border wraps everything.
  return [
    <View key="head" wrap={false}>
      {caption}
      <View style={kit.s.table}>
        {head}
        {body[0]}
      </View>
    </View>,
    ...body.slice(1).map((row, i) => (
      <View key={`r${i}`} style={[kit.s.table, { borderTopWidth: 0 }]} wrap={false}>
        {row}
      </View>
    )),
  ];
}

/* ------------------------------------------------------------------ */
/* Section renderers                                                   */
/* ------------------------------------------------------------------ */

export function personalRows(doc: PreparedBiodata): KV[] {
  const { t, lang } = labelsFor(doc);
  const p = doc.data.personal;
  const f = doc.data.family;
  const age = ageInYears(p.dateOfBirth);
  return present([
    { label: t.fields.fullName, value: p.fullName },
    // Bangladeshi job biodatas list parents here; marriage biodatas show them under Family.
    ...(doc.data.mode === "job"
      ? [
          { label: t.fields.fathersName, value: f.father.name },
          { label: t.fields.mothersName, value: f.mother.name },
        ]
      : []),
    { label: t.fields.dateOfBirth, value: hasText(p.dateOfBirth) ? formatBiodataDate(p.dateOfBirth, lang) : "" },
    { label: t.fields.age, value: age !== null ? t.years(age) : "" },
    { label: t.fields.height, value: p.height },
    { label: t.fields.weight, value: p.weight },
    { label: t.fields.bloodGroup, value: p.bloodGroup },
    { label: t.fields.complexion, value: p.complexion },
    { label: t.fields.maritalStatus, value: p.maritalStatus ? t.maritalStatus[p.maritalStatus] : "" },
    { label: t.fields.religion, value: p.religion },
    { label: t.fields.nationality, value: p.nationality },
    { label: t.fields.nid, value: p.nid },
  ]);
}

type Block = (kit: BioKit, doc: PreparedBiodata) => ReactNode;

const personal: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  const rows = personalRows(doc);
  return <Glued kit={kit} title={t.sections.personal}>{KVList({ kit, rows, columns: kit.twoColumnPersonal ? 2 : 1 })}</Glued>;
};

const contact: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  const c = doc.data.contact;
  const rows = present([
    { label: t.fields.presentAddress, value: c.presentAddress },
    { label: t.fields.permanentAddress, value: c.permanentAddress },
    { label: t.fields.phone, value: c.phone },
    { label: t.fields.email, value: c.email },
  ]);
  return <Glued kit={kit} title={t.sections.contact}>{rows.map((r, i) => <KVRow key={i} kit={kit} row={r} />)}</Glued>;
};

const education: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  type Row = PreparedBiodata["data"]["education"][number];
  const columns: Column<Row>[] = [
    { title: t.table.degree, width: 1.3, value: (r) => joinParts([r.degree, r.fieldOfStudy], lang === "bn" ? " – " : " in ") },
    { title: t.table.institution, width: 2, value: (r) => r.institution },
    { title: t.table.board, width: 1.3, value: (r) => r.board },
    { title: t.table.year, width: 0.8, value: (r) => localizeDigits(rangeEndYear(r.period, t.running), lang) },
    { title: t.table.result, width: 1, value: (r) => r.result },
  ];
  return <Glued kit={kit} title={t.sections.education}>{Table({ kit, columns, rows: doc.data.education })}</Glued>;
};

const occupation: Block = (kit, doc) => {
  const { t, lang } = labelsFor(doc);
  const title = doc.data.mode === "job" ? t.occupationJob : t.sections.occupation;
  return (
    <Glued kit={kit} title={title}>
      {doc.data.occupation.map((o) => (
        <View key={o.id} style={{ marginBottom: 6 }} wrap={false}>
          <Text style={kit.s.entryTitle}>{joinParts([o.position, o.organization], ", ")}</Text>
          {hasText(o.location) || formatDateRange(o.period) ? (
            <Text style={kit.s.entryMeta}>
              {joinParts([o.location, formatBiodataRange(o.period, lang)], " · ")}
            </Text>
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

const family: Block = (kit, doc) => {
  const { t } = labelsFor(doc);
  const f = doc.data.family;
  const parent = (p: { name: string; occupation: string }) => joinParts([p.name, hasText(p.occupation) ? `(${p.occupation})` : ""], " ");
  const rows = present([
    { label: t.fields.father, value: parent(f.father) },
    { label: t.fields.mother, value: parent(f.mother) },
    { label: t.fields.familyType, value: f.familyType ? t.familyType[f.familyType] : "" },
  ]);
  type Row = PreparedBiodata["data"]["family"]["siblings"][number];
  const columns: Column<Row>[] = [
    { title: t.table.name, width: 1.6, value: (r) => r.name },
    { title: t.table.relation, width: 0.8, value: (r) => t.relation[r.relation] },
    { title: t.table.educationOrOccupation, width: 2, value: (r) => r.educationOrOccupation },
    { title: t.table.maritalStatus, width: 1.1, value: (r) => (r.maritalStatus ? t.maritalStatus[r.maritalStatus] : "") },
  ];
  const blocks: ReactNode[] = [
    ...rows.map((r, i) => <KVRow key={`kv${i}`} kit={kit} row={r} />),
    ...(f.siblings.length
      ? [
          ...Table({ kit, columns, rows: f.siblings, caption: <Text style={kit.s.subheading}>{t.fields.siblings}</Text> }),
        ]
      : []),
    ...(hasText(f.notes) ? [<Text key="notes" style={[kit.s.paragraph, { marginTop: 5 }]}>{f.notes.trim()}</Text>] : []),
  ];
  return <Glued kit={kit} title={t.sections.family}>{blocks}</Glued>;
};

function paragraphSection(kit: BioKit, doc: PreparedBiodata, key: "expectations" | "hobbies"): ReactNode {
  const { t } = labelsFor(doc);
  const text = key === "hobbies" ? doc.data.hobbies.join(", ") : doc.data.expectations.trim();
  return (
    <Glued kit={kit} title={t.sections[key]}>
      <Text style={kit.s.paragraph}>{text}</Text>
    </Glued>
  );
}

const expectations: Block = (kit, doc) => paragraphSection(kit, doc, "expectations");
const hobbies: Block = (kit, doc) => paragraphSection(kit, doc, "hobbies");

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

export const BIODATA_BLOCKS: Record<Exclude<BiodataSection, "photo">, Block> = {
  personal,
  contact,
  education,
  occupation,
  family,
  expectations,
  hobbies,
  declaration,
};

export const BIODATA_ORDER: Exclude<BiodataSection, "photo">[] = [
  "personal",
  "contact",
  "education",
  "occupation",
  "family",
  "expectations",
  "hobbies",
  "declaration",
];

/** Visible sections in order, as a flat list of fragments (see <Section> in shared/kit for why flat). */
export function renderBiodataSections(kit: BioKit, doc: PreparedBiodata, skip: BiodataSection[] = []): ReactNode {
  return BIODATA_ORDER.filter((k) => doc.show[k] && !skip.includes(k)).map((k) => <Fragment key={k}>{BIODATA_BLOCKS[k](kit, doc)}</Fragment>);
}
