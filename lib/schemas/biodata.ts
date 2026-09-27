import { z } from "zod";
import { buildCommon, buildDocument } from "./common";
import { draftRules, strictRules, type Rules } from "./rules";

export const BIODATA_MODES = ["marriage", "job"] as const;
export type BiodataMode = (typeof BIODATA_MODES)[number];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const MARITAL_STATUSES = ["never-married", "married", "divorced", "widowed"] as const;
export const FAMILY_TYPES = ["nuclear", "joint", "extended"] as const;

export const BIODATA_SECTIONS = [
  "photo",
  "personal",
  "contact",
  "education",
  "occupation",
  "family", // marriage mode only
  "expectations", // marriage mode only
  "hobbies",
  "declaration", // job mode only
] as const;
export type BiodataSection = (typeof BIODATA_SECTIONS)[number];

/** Which sections a mode can show at all (applied on top of the user's toggles). */
export const BIODATA_MODE_SECTIONS: Record<BiodataMode, readonly BiodataSection[]> = {
  marriage: ["photo", "personal", "contact", "education", "occupation", "family", "expectations", "hobbies"],
  job: ["photo", "personal", "contact", "education", "occupation", "hobbies", "declaration"],
};

function build(r: Rules) {
  const c = buildCommon(r);

  const personal = z.object({
    fullName: r.required("Full name is required"),
    dateOfBirth: r.isoDate(), // age is computed at render time, never stored
    height: z.string(), // free text: 5′ 6″ or 168 cm
    weight: z.string(),
    bloodGroup: z.union([z.enum(BLOOD_GROUPS), z.literal("")]),
    complexion: z.string(),
    maritalStatus: z.union([z.enum(MARITAL_STATUSES), z.literal("")]),
    religion: z.string(),
    nationality: z.string(),
    nid: z.string(),
  });

  const contact = z.object({
    presentAddress: z.string(),
    permanentAddress: z.string(),
    phone: z.string(),
    email: r.email(),
  });

  const parent = z.object({ name: z.string(), occupation: z.string() });

  const sibling = z.object({
    id: c.id,
    name: r.required("Name is required"),
    relation: z.enum(["brother", "sister"]),
    educationOrOccupation: z.string(),
    maritalStatus: z.union([z.enum(MARITAL_STATUSES), z.literal("")]),
  });

  const data = z.object({
    mode: z.enum(BIODATA_MODES),
    photo: c.photo,
    personal,
    contact,
    /** Table columns: Exam/Degree · Institution · Board/University · Passing year · Result */
    education: z.array(c.educationBase.extend({ board: z.string() })),
    occupation: z.array(c.experienceEntry),
    family: z.object({
      father: parent,
      mother: parent,
      siblings: z.array(sibling),
      familyType: z.union([z.enum(FAMILY_TYPES), z.literal("")]),
      notes: z.string(),
    }),
    expectations: z.string(),
    hobbies: c.textList,
    declaration: z.object({
      text: z.string(),
      place: z.string(),
      date: r.isoDate(),
    }),
  });

  return buildDocument("biodata", data, BIODATA_SECTIONS, {
    /** Section headings/labels in English or Bangla; field values are always as typed. */
    labelLanguage: z.enum(["en", "bn"]),
  });
}

export const biodataSchema = build(strictRules);
export const biodataDraftSchema = build(draftRules);

export type BiodataDocument = z.infer<typeof biodataSchema>;
export type BiodataData = BiodataDocument["data"];
export type BiodataEducation = BiodataData["education"][number];
export type Sibling = BiodataData["family"]["siblings"][number];
