import { z } from "zod";
import { buildCommon, buildDocument } from "./common";
import { draftRules, strictRules, type Rules } from "./rules";

/** Follows the sections of the Europass CV (europass.europa.eu). The photo is on by default, as is usual in Europe. */
export const EUROPASS_SECTIONS = [
  "photo",
  "aboutMe",
  "experience",
  "education",
  "languages",
  "digitalSkills",
  "skills",
  "drivingLicence",
  "additional",
  "hobbies",
] as const;
export type EuropassSection = (typeof EUROPASS_SECTIONS)[number];

/** Common European Framework of Reference for Languages self-assessment levels. */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** The five skills of the Europass language grid, in print order. */
export const CEFR_SKILLS = ["listening", "reading", "spokenProduction", "spokenInteraction", "writing"] as const;
export type CefrSkill = (typeof CEFR_SKILLS)[number];

/** European Qualifications Framework levels (e.g. 4 = upper secondary, 6 = bachelor's, 7 = master's, 8 = doctorate). */
export const EQF_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

function build(r: Rules) {
  const c = buildCommon(r);
  const cefr = z.union([z.enum(CEFR_LEVELS), z.literal("")]);

  const header = z.object({
    fullName: r.required("Full name is required"),
    /** "Job applied for / position" line under the name. */
    headline: z.string(),
    dateOfBirth: r.isoDate(),
    nationality: z.string(),
    gender: z.string(), // free text, printed only when filled in
    phone: z.string(),
    email: r.email(),
    address: z.string(),
    website: r.url(),
    linkedin: r.url(),
  });

  const otherLanguage = z.object({
    id: c.id,
    name: r.required("Language is required"),
    listening: cefr,
    reading: cefr,
    spokenProduction: cefr,
    spokenInteraction: cefr,
    writing: cefr,
    certificate: z.string(), // "IELTS Academic 7.5 (2023)"
  });

  /** Free "Additional information" entries, printed grouped by category (Honours and awards, Publications…). */
  const additional = z.object({
    id: c.id,
    category: r.required("Category is required"),
    title: r.required("Title is required"),
    organization: z.string(),
    date: r.partialDate(),
    description: z.string(),
  });

  const data = z.object({
    header,
    photo: c.photo,
    aboutMe: z.string(),
    experience: z.array(c.experienceEntry.extend({ sector: z.string() })), // bullets = main activities and responsibilities
    education: z.array(
      c.educationBase.extend({
        eqfLevel: z.union([z.enum(EQF_LEVELS), z.literal("")]),
        subjects: c.textList, // main subjects / occupational skills covered
      }),
    ),
    languages: z.object({
      motherTongues: c.textList,
      other: z.array(otherLanguage),
    }),
    digitalSkills: c.textList,
    /** Communication and interpersonal skills, Organisational skills, Job-related skills… */
    skills: z.array(c.skillGroup),
    /** Licence categories, e.g. ["B"]. */
    drivingLicence: c.textList,
    additional: z.array(additional),
    hobbies: c.textList,
  });

  return buildDocument("europass", data, EUROPASS_SECTIONS, {});
}

export const europassSchema = build(strictRules);
export const europassDraftSchema = build(draftRules);

export type EuropassDocument = z.infer<typeof europassSchema>;
export type EuropassData = EuropassDocument["data"];
export type EuropassLanguage = EuropassData["languages"]["other"][number];
export type EuropassAdditional = EuropassData["additional"][number];
