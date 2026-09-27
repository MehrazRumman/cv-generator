import { z } from "zod";
import { buildCommon, buildDocument } from "./common";
import { draftRules, strictRules, type Rules } from "./rules";

/** Photo is a toggle like any other section; it defaults to OFF for this type (ATS-friendly). */
export const PROFESSIONAL_SECTIONS = [
  "photo",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "languages",
  "references",
] as const;
export type ProfessionalSection = (typeof PROFESSIONAL_SECTIONS)[number];

function build(r: Rules) {
  const c = buildCommon(r);

  const header = z.object({
    fullName: r.required("Full name is required"),
    jobTitle: z.string(),
    phone: z.string(),
    email: r.email(),
    location: z.string(),
    linkedin: r.url(),
    github: r.url(),
    portfolio: r.url(),
  });

  const certification = z.object({
    id: c.id,
    name: r.required("Certification name is required"),
    issuer: z.string(),
    date: r.partialDate(),
    credentialId: z.string(),
    url: r.url(),
  });

  const project = z.object({
    id: c.id,
    name: r.required("Project name is required"),
    role: z.string(),
    url: r.url(),
    period: c.dateRange,
    technologies: c.textList,
    bullets: c.textList,
  });

  const data = z.object({
    header,
    photo: c.photo,
    summary: z.string(),
    experience: z.array(c.experienceEntry),
    education: z.array(c.educationBase),
    skills: z.array(c.skillGroup),
    certifications: z.array(certification),
    projects: z.array(project),
    languages: z.array(c.language),
    references: z.object({
      /** "on-request" prints the single line "Available on request". */
      mode: z.enum(["list", "on-request"]),
      items: z.array(c.referee),
    }),
  });

  return buildDocument("professional", data, PROFESSIONAL_SECTIONS, {});
}

export const professionalSchema = build(strictRules);
export const professionalDraftSchema = build(draftRules);

export type ProfessionalDocument = z.infer<typeof professionalSchema>;
export type ProfessionalData = ProfessionalDocument["data"];
export type Experience = ProfessionalData["experience"][number];
export type Certification = ProfessionalData["certifications"][number];
export type Project = ProfessionalData["projects"][number];
