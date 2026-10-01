import { z } from "zod";
import { buildCommon, buildDocument } from "./common";
import { draftRules, strictRules, type Rules } from "./rules";

/** Parties with a built-in colour theme and election symbol; "other" uses `partyName` and no symbol. */
export const POLITICAL_PARTIES = ["bnp", "awami-league", "jamaat", "ncp", "other"] as const;
export type PoliticalParty = (typeof POLITICAL_PARTIES)[number];

/** Organisational tiers of Bangladeshi party committees. */
export const COMMITTEE_LEVELS = ["central", "division", "district", "upazila", "union", "ward"] as const;
export type CommitteeLevel = (typeof COMMITTEE_LEVELS)[number];

export const ELECTION_RESULTS = ["won", "lost", "withdrew"] as const;
export type ElectionResult = (typeof ELECTION_RESULTS)[number];

/**
 * The layout of a Bangladeshi party nomination CV (রাজনৈতিক জীবনবৃত্তান্ত): personal and contact details,
 * party position, the seat sought, positions held, elections contested, movements, cases, education,
 * profession, social work and a signed declaration.
 */
export const POLITICAL_SECTIONS = [
  "photo",
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
] as const;
export type PoliticalSection = (typeof POLITICAL_SECTIONS)[number];

function build(r: Rules) {
  const c = buildCommon(r);

  const personal = z.object({
    fullName: r.required("Full name is required"),
    fathersName: z.string(),
    mothersName: z.string(),
    spouseName: z.string(),
    dateOfBirth: r.isoDate(), // age is computed at render time
    religion: z.string(),
    nid: z.string(),
  });

  const contact = z.object({
    presentAddress: z.string(),
    permanentAddress: z.string(),
    phone: z.string(),
    email: r.email(),
    facebook: r.url(),
  });

  const position = z.object({
    id: c.id,
    position: r.required("Position is required"), // "Joint Convener"
    organization: r.required("Organisation / committee is required"), // "Chhatra Dal, Dhaka University unit"
    level: z.union([z.enum(COMMITTEE_LEVELS), z.literal("")]),
    period: c.dateRange,
  });

  const election = z.object({
    id: c.id,
    election: r.required("Election is required"), // "Upazila Parishad Election"
    post: z.string(), // "Chairman", "Member of Parliament"
    constituency: z.string(),
    year: r.year(),
    result: z.union([z.enum(ELECTION_RESULTS), z.literal("")]),
    votes: z.string(), // free text: "54,210"
  });

  const movement = z.object({
    id: c.id,
    title: r.required("Title is required"),
    year: z.string(), // free text: "1990" or "2013–2014"
    description: z.string(),
  });

  const politicalCase = z.object({
    id: c.id,
    description: r.required("Description is required"), // "Arrested during the 2018 movement; 3 months in custody"
    year: z.string(),
    status: z.string(), // "Acquitted", "Pending", "Withdrawn"
  });

  const socialWork = z.object({
    id: c.id,
    role: r.required("Role is required"),
    organization: r.required("Organisation is required"),
    period: c.dateRange,
  });

  const data = z.object({
    party: z.enum(POLITICAL_PARTIES),
    /** Printed when `party` is "other" (or to override the built-in name). */
    partyName: z.string(),
    /** Optional official logo uploaded by the user; replaces the drawn election symbol. */
    partyLogo: c.photo,
    photo: c.photo,
    personal,
    contact,
    partyRole: z.object({
      position: z.string(), // "Joint Secretary"
      committee: z.string(), // "Dhaka District"
      memberSince: r.year(),
      membershipNo: z.string(),
    }),
    nomination: z.object({
      election: z.string(), // "13th National Parliament Election"
      constituency: z.string(), // "Dhaka-10"
      area: z.string(), // "Dhanmondi, Kalabagan and New Market"
    }),
    positions: z.array(position),
    elections: z.array(election),
    movements: z.array(movement),
    cases: z.array(politicalCase),
    /** Table columns: Exam/Degree · Institution · Board/University · Passing year · Result */
    education: z.array(c.educationBase.extend({ board: z.string() })),
    occupation: z.array(c.experienceEntry),
    socialWork: z.array(socialWork),
    declaration: z.object({
      text: z.string(),
      place: z.string(),
      date: r.isoDate(),
    }),
  });

  return buildDocument("political", data, POLITICAL_SECTIONS, {
    /** Headings and labels in English or Bangla; field values are always printed as typed. */
    labelLanguage: z.enum(["en", "bn"]),
  });
}

export const politicalSchema = build(strictRules);
export const politicalDraftSchema = build(draftRules);

export type PoliticalDocument = z.infer<typeof politicalSchema>;
export type PoliticalData = PoliticalDocument["data"];
export type PoliticalPosition = PoliticalData["positions"][number];
export type PoliticalElection = PoliticalData["elections"][number];
