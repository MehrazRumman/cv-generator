import { cleanList, hasText } from "@/lib/format/text";
import {
  BIODATA_MODE_SECTIONS,
  type AcademicDocument,
  type AcademicSection,
  type BiodataDocument,
  type BiodataSection,
  type EuropassDocument,
  type EuropassSection,
  type ProfessionalDocument,
  type ProfessionalSection,
} from "@/lib/schemas";

/**
 * What templates receive: the document with empty entries removed, blank lines stripped from lists,
 * and a `show` map that is true only when a section is switched on, allowed by the mode, and has content.
 * Templates never need to decide on their own whether a section is empty.
 */
export type Prepared<D extends { data: unknown; sections: Record<string, boolean> }, S extends string> = Omit<
  D,
  "sections"
> & { show: Record<S, boolean> };

export type PreparedProfessional = Prepared<ProfessionalDocument, ProfessionalSection>;
export type PreparedBiodata = Prepared<BiodataDocument, BiodataSection>;
export type PreparedAcademic = Prepared<AcademicDocument, AcademicSection>;
export type PreparedEuropass = Prepared<EuropassDocument, EuropassSection>;

const anyText = (...values: string[]) => values.some(hasText);

/**
 * Collapses runs of spaces in every string. react-pdf treats "  " between words as a hyphenation
 * point and prints a stray "-" if it breaks the line there, so double spaces typed by the user
 * must never reach the PDF.
 */
export function collapseSpaces<T>(value: T): T {
  if (typeof value === "string") return value.replace(/ {2,}/g, " ") as T;
  if (Array.isArray(value)) return value.map(collapseSpaces) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, collapseSpaces(v)])) as T;
  }
  return value;
}

function withBullets<T extends { bullets: string[] }>(entry: T): T {
  return { ...entry, bullets: cleanList(entry.bullets) };
}

export function prepareProfessional(doc: ProfessionalDocument): PreparedProfessional {
  const d = collapseSpaces(doc.data);
  const data: ProfessionalDocument["data"] = {
    ...d,
    experience: d.experience.filter((e) => anyText(e.position, e.organization)).map(withBullets),
    education: d.education.filter((e) => anyText(e.degree, e.institution)),
    skills: d.skills
      .map((g) => ({ ...g, items: cleanList(g.items) }))
      .filter((g) => g.items.length > 0),
    certifications: d.certifications.filter((c) => hasText(c.name)),
    projects: d.projects
      .filter((p) => hasText(p.name))
      .map((p) => ({ ...withBullets(p), technologies: cleanList(p.technologies) })),
    languages: d.languages.filter((l) => hasText(l.name)),
    references: { ...d.references, items: d.references.items.filter((r) => hasText(r.name)) },
  };
  const on = doc.sections;
  const show: Record<ProfessionalSection, boolean> = {
    photo: on.photo && d.photo !== null,
    summary: on.summary && hasText(d.summary),
    experience: on.experience && data.experience.length > 0,
    education: on.education && data.education.length > 0,
    skills: on.skills && data.skills.length > 0,
    certifications: on.certifications && data.certifications.length > 0,
    projects: on.projects && data.projects.length > 0,
    languages: on.languages && data.languages.length > 0,
    references: on.references && (data.references.mode === "on-request" || data.references.items.length > 0),
  };
  const { sections: _sections, ...rest } = doc;
  void _sections;
  return { ...rest, data, show };
}

export function prepareEuropass(doc: EuropassDocument): PreparedEuropass {
  const d = collapseSpaces(doc.data);
  const data: EuropassDocument["data"] = {
    ...d,
    experience: d.experience.filter((e) => anyText(e.position, e.organization)).map(withBullets),
    education: d.education
      .filter((e) => anyText(e.degree, e.institution))
      .map((e) => ({ ...e, subjects: cleanList(e.subjects) })),
    languages: {
      motherTongues: cleanList(d.languages.motherTongues),
      other: d.languages.other.filter((l) => hasText(l.name)),
    },
    digitalSkills: cleanList(d.digitalSkills),
    skills: d.skills.map((g) => ({ ...g, items: cleanList(g.items) })).filter((g) => g.items.length > 0),
    drivingLicence: cleanList(d.drivingLicence),
    additional: d.additional.filter((a) => hasText(a.title)),
    hobbies: cleanList(d.hobbies),
  };
  const on = doc.sections;
  const show: Record<EuropassSection, boolean> = {
    photo: on.photo && d.photo !== null,
    aboutMe: on.aboutMe && hasText(d.aboutMe),
    experience: on.experience && data.experience.length > 0,
    education: on.education && data.education.length > 0,
    languages: on.languages && (data.languages.motherTongues.length > 0 || data.languages.other.length > 0),
    digitalSkills: on.digitalSkills && data.digitalSkills.length > 0,
    skills: on.skills && data.skills.length > 0,
    drivingLicence: on.drivingLicence && data.drivingLicence.length > 0,
    additional: on.additional && data.additional.length > 0,
    hobbies: on.hobbies && data.hobbies.length > 0,
  };
  const { sections: _sections, ...rest } = doc;
  void _sections;
  return { ...rest, data, show };
}

export function prepareBiodata(doc: BiodataDocument): PreparedBiodata {
  const d = collapseSpaces(doc.data);
  const data: BiodataDocument["data"] = {
    ...d,
    education: d.education.filter((e) => anyText(e.degree, e.institution)),
    occupation: d.occupation.filter((o) => anyText(o.position, o.organization)).map(withBullets),
    family: { ...d.family, siblings: d.family.siblings.filter((s) => hasText(s.name)) },
    hobbies: cleanList(d.hobbies),
  };
  const p = d.personal;
  const f = data.family;
  const allowed = new Set(BIODATA_MODE_SECTIONS[d.mode]);
  const on = (s: BiodataSection) => doc.sections[s] && allowed.has(s);
  const show: Record<BiodataSection, boolean> = {
    photo: on("photo") && d.photo !== null,
    personal:
      on("personal") &&
      anyText(p.fullName, p.dateOfBirth, p.height, p.weight, p.bloodGroup, p.complexion, p.maritalStatus, p.religion, p.nationality, p.nid),
    contact: on("contact") && anyText(d.contact.presentAddress, d.contact.permanentAddress, d.contact.phone, d.contact.email),
    education: on("education") && data.education.length > 0,
    occupation: on("occupation") && data.occupation.length > 0,
    family:
      on("family") &&
      (anyText(f.father.name, f.father.occupation, f.mother.name, f.mother.occupation, f.familyType, f.notes) ||
        f.siblings.length > 0),
    expectations: on("expectations") && hasText(d.expectations),
    hobbies: on("hobbies") && data.hobbies.length > 0,
    declaration: on("declaration") && hasText(d.declaration.text),
  };
  const { sections: _sections, ...rest } = doc;
  void _sections;
  return { ...rest, data, show };
}

export function prepareAcademic(doc: AcademicDocument): PreparedAcademic {
  const d = collapseSpaces(doc.data);
  const data: AcademicDocument["data"] = {
    ...d,
    authorAliases: cleanList(d.authorAliases),
    researchInterests: cleanList(d.researchInterests),
    education: d.education.filter((e) => anyText(e.degree, e.institution)),
    teaching: d.teaching
      .filter((t) => anyText(t.position, t.organization))
      .map((t) => ({ ...withBullets(t), courses: cleanList(t.courses) })),
    research: d.research.filter((r) => anyText(r.position, r.organization)).map(withBullets),
    publications: d.publications
      .filter((p) => hasText(p.title))
      .map((p) => ({ ...p, authors: p.authors.filter((a) => anyText(a.family, a.given)) })),
    grants: d.grants.filter((g) => hasText(g.title)),
    awards: d.awards.filter((a) => hasText(a.title)),
    presentations: d.presentations.filter((p) => hasText(p.title)),
    service: d.service.filter((s) => hasText(s.role)),
    memberships: d.memberships.filter((m) => hasText(m.organization)),
    skills: d.skills.map((g) => ({ ...g, items: cleanList(g.items) })).filter((g) => g.items.length > 0),
    referees: d.referees.filter((r) => hasText(r.name)),
  };
  const on = doc.sections;
  const show: Record<AcademicSection, boolean> = {
    researchInterests: on.researchInterests && data.researchInterests.length > 0,
    education: on.education && data.education.length > 0,
    teaching: on.teaching && data.teaching.length > 0,
    research: on.research && data.research.length > 0,
    publications: on.publications && data.publications.length > 0,
    grants: on.grants && data.grants.length > 0,
    awards: on.awards && data.awards.length > 0,
    presentations: on.presentations && data.presentations.length > 0,
    service: on.service && data.service.length > 0,
    memberships: on.memberships && data.memberships.length > 0,
    skills: on.skills && data.skills.length > 0,
    referees: on.referees && data.referees.length > 0,
  };
  const { sections: _sections, ...rest } = doc;
  void _sections;
  return { ...rest, data, show };
}
