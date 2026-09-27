import { z } from "zod";
import { buildCommon, buildDocument } from "./common";
import { draftRules, strictRules, type Rules } from "./rules";

export const ACADEMIC_SECTIONS = [
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
] as const;
export type AcademicSection = (typeof ACADEMIC_SECTIONS)[number];

export const PUBLICATION_KINDS = ["journal", "conference", "chapter", "preprint"] as const;
export type PublicationKind = (typeof PUBLICATION_KINDS)[number];
export const PUBLICATION_STATUSES = ["published", "accepted", "in-press"] as const;
export const CITATION_STYLES = ["apa", "ieee"] as const;
export const PRESENTATION_KINDS = ["talk", "poster", "invited", "keynote", "panel"] as const;

function build(r: Rules) {
  const c = buildCommon(r);

  const header = z.object({
    fullName: r.required("Full name is required"),
    designation: z.string(), // "Assistant Professor", "PhD Candidate"
    department: z.string(),
    institution: z.string(),
    email: r.email(),
    phone: z.string(),
    orcid: z.string().refine((v) => !r.strict || v === "" || /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v), {
      message: "ORCID looks like 0000-0002-1825-0097",
    }),
    googleScholar: r.url(),
    researchGate: r.url(),
    website: r.url(),
  });

  /** Structured so citations can be formatted per style and the owner's name auto-bolded. */
  const author = z.object({ family: z.string(), given: z.string() });

  /**
   * One shape for all four kinds; the form shows only the fields relevant to `kind`.
   *   journal:    venue = journal name, volume, issue, pages
   *   conference: venue = proceedings/conference name, location, pages
   *   chapter:    venue = book title, editors, publisher, pages
   *   preprint:   venue = repository (arXiv, bioRxiv, SSRN)
   */
  const publication = z
    .object({
      id: c.id,
      kind: z.enum(PUBLICATION_KINDS),
      status: z.enum(PUBLICATION_STATUSES),
      authors: z.array(author),
      year: r.year(),
      title: r.required("Title is required"),
      venue: z.string(),
      volume: z.string(),
      issue: z.string(),
      pages: z.string(),
      editors: z.string(),
      publisher: z.string(),
      location: z.string(),
      doi: z.string(),
      url: r.url(),
    })
    .superRefine((p, ctx) => {
      if (!r.strict) return;
      if (p.authors.length === 0) ctx.addIssue({ code: "custom", path: ["authors"], message: "Add at least one author" });
      if (p.status === "published" && p.year === "")
        ctx.addIssue({ code: "custom", path: ["year"], message: "Year is required for published work" });
    });

  const teaching = c.experienceEntry.extend({
    courses: c.textList, // "CSE 101 – Structured Programming (Fall 2023)"
  });

  const research = c.experienceEntry.extend({
    supervisor: z.string(),
  });

  const grant = z.object({
    id: c.id,
    title: r.required("Grant title is required"),
    funder: z.string(),
    role: z.string(), // PI, Co-PI, Co-investigator
    amount: z.string(), // free text so currency is whatever the user writes: "BDT 5,00,000"
    period: c.dateRange,
  });

  const award = z.object({
    id: c.id,
    title: r.required("Award title is required"),
    issuer: z.string(),
    date: r.partialDate(),
    description: z.string(),
  });

  const presentation = z.object({
    id: c.id,
    title: r.required("Title is required"),
    kind: z.enum(PRESENTATION_KINDS),
    event: z.string(),
    location: z.string(),
    date: r.partialDate(),
  });

  const service = z.object({
    id: c.id,
    role: r.required("Role is required"), // "Reviewer", "Program Committee Member"
    organization: z.string(), // "IEEE Access", "ICML 2025"
    period: c.dateRange,
  });

  const membership = z.object({
    id: c.id,
    organization: r.required("Organization is required"),
    role: z.string(), // "Student Member", "Fellow"
    period: c.dateRange,
  });

  const data = z.object({
    header,
    /** Extra spellings to bold in author lists besides the header name, e.g. "Rahman, M. M.". */
    authorAliases: c.textList,
    researchInterests: c.textList,
    education: z.array(
      c.educationBase.extend({
        thesisTitle: z.string(),
        supervisor: z.string(),
      }),
    ),
    teaching: z.array(teaching),
    research: z.array(research),
    publications: z.array(publication),
    grants: z.array(grant),
    awards: z.array(award),
    presentations: z.array(presentation),
    service: z.array(service),
    memberships: z.array(membership),
    skills: z.array(c.skillGroup),
    referees: z.array(c.referee),
  });

  return buildDocument("academic", data, ACADEMIC_SECTIONS, {
    citationStyle: z.enum(CITATION_STYLES),
  });
}

export const academicSchema = build(strictRules);
export const academicDraftSchema = build(draftRules);

export type AcademicDocument = z.infer<typeof academicSchema>;
export type AcademicData = AcademicDocument["data"];
export type Publication = AcademicData["publications"][number];
export type Author = Publication["authors"][number];
