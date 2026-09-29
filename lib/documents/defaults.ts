import {
  SCHEMA_VERSION,
  type AcademicDocument,
  type BiodataDocument,
  type DocumentOf,
  type DocumentType,
  type EuropassDocument,
  type PoliticalDocument,
  type ProfessionalDocument,
} from "@/lib/schemas";
import { todayIso } from "@/lib/format/dates";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { emptyParent, newSkillGroup } from "./factories";

/** Political CVs are usually filed in Bangla, so the default declaration is Bangla too. */
export const DEFAULT_POLITICAL_DECLARATION =
  "আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও সঠিক। আমি দলের গঠনতন্ত্র, ঘোষণাপত্র ও সকল সিদ্ধান্ত মেনে চলব।";

export const DEFAULT_DECLARATION =
  "I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge and belief.";

const baseSettings = {
  paperSize: "A4",
  fontId: "inter",
  headingFontId: "same",
  banglaFontId: "hind-siliguri",
  accentColor: "#1f4e79",
} as const;

export function emptyProfessional(): ProfessionalDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "professional",
    updatedAt: new Date().toISOString(),
    settings: { ...baseSettings, templateId: "classic", accentColor: TEMPLATE_CATALOG.professional[0].accent },
    sections: {
      photo: false,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      certifications: true,
      projects: true,
      languages: true,
      // Off until the user opts in: "Available on request" would otherwise print on an empty CV.
      references: false,
    },
    data: {
      header: { fullName: "", jobTitle: "", phone: "", email: "", location: "", linkedin: "", github: "", portfolio: "" },
      photo: null,
      summary: "",
      experience: [],
      education: [],
      skills: [newSkillGroup("Technical"), newSkillGroup("Soft skills"), newSkillGroup("Tools")],
      certifications: [],
      projects: [],
      languages: [],
      references: { mode: "on-request", items: [] },
    },
  };
}

export function emptyEuropass(): EuropassDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "europass",
    updatedAt: new Date().toISOString(),
    settings: { ...baseSettings, templateId: "classic", accentColor: TEMPLATE_CATALOG.europass[0].accent, fontId: "open-sans" },
    sections: {
      photo: true,
      aboutMe: true,
      experience: true,
      education: true,
      languages: true,
      digitalSkills: true,
      skills: true,
      drivingLicence: true,
      additional: true,
      hobbies: true,
    },
    data: {
      header: {
        fullName: "",
        headline: "",
        dateOfBirth: "",
        nationality: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        linkedin: "",
      },
      photo: null,
      aboutMe: "",
      experience: [],
      education: [],
      languages: { motherTongues: [], other: [] },
      digitalSkills: [],
      skills: [
        newSkillGroup("Communication and interpersonal skills"),
        newSkillGroup("Organisational skills"),
        newSkillGroup("Job-related skills"),
      ],
      drivingLicence: [],
      additional: [],
      hobbies: [],
    },
  };
}

export function emptyBiodata(): BiodataDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "biodata",
    updatedAt: new Date().toISOString(),
    settings: { ...baseSettings, templateId: "classic", accentColor: TEMPLATE_CATALOG.biodata[0].accent, labelLanguage: "en" },
    sections: {
      photo: true,
      personal: true,
      contact: true,
      education: true,
      occupation: true,
      family: true,
      expectations: true,
      hobbies: true,
      declaration: true,
    },
    data: {
      mode: "marriage",
      photo: null,
      personal: {
        fullName: "",
        dateOfBirth: "",
        height: "",
        weight: "",
        bloodGroup: "",
        complexion: "",
        maritalStatus: "",
        religion: "",
        nationality: "",
        nid: "",
      },
      contact: { presentAddress: "", permanentAddress: "", phone: "", email: "" },
      education: [],
      occupation: [],
      family: { father: emptyParent(), mother: emptyParent(), siblings: [], familyType: "", notes: "" },
      expectations: "",
      hobbies: [],
      declaration: { text: DEFAULT_DECLARATION, place: "", date: todayIso() },
    },
  };
}

export function emptyAcademic(): AcademicDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "academic",
    updatedAt: new Date().toISOString(),
    settings: {
      ...baseSettings,
      templateId: "classic",
      accentColor: TEMPLATE_CATALOG.academic[0].accent,
      fontId: "source-serif",
      banglaFontId: "noto-serif-bengali",
      citationStyle: "apa",
    },
    sections: {
      researchInterests: true,
      education: true,
      teaching: true,
      research: true,
      publications: true,
      grants: true,
      awards: true,
      presentations: true,
      service: true,
      memberships: true,
      skills: true,
      referees: true,
    },
    data: {
      header: {
        fullName: "",
        designation: "",
        department: "",
        institution: "",
        email: "",
        phone: "",
        orcid: "",
        googleScholar: "",
        researchGate: "",
        website: "",
      },
      authorAliases: [],
      researchInterests: [],
      education: [],
      teaching: [],
      research: [],
      publications: [],
      grants: [],
      awards: [],
      presentations: [],
      service: [],
      memberships: [],
      skills: [newSkillGroup("Lab techniques"), newSkillGroup("Software"), newSkillGroup("Programming")],
      referees: [],
    },
  };
}

export function emptyPolitical(): PoliticalDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "political",
    updatedAt: new Date().toISOString(),
    settings: { ...baseSettings, templateId: "classic", accentColor: TEMPLATE_CATALOG.political[0].accent, labelLanguage: "bn" },
    sections: {
      photo: true,
      personal: true,
      contact: true,
      partyRole: true,
      nomination: true,
      positions: true,
      elections: true,
      movements: true,
      cases: true,
      education: true,
      occupation: true,
      socialWork: true,
      declaration: true,
    },
    data: {
      party: "other",
      partyName: "",
      partyLogo: null,
      photo: null,
      personal: { fullName: "", fathersName: "", mothersName: "", spouseName: "", dateOfBirth: "", religion: "", nid: "" },
      contact: { presentAddress: "", permanentAddress: "", phone: "", email: "", facebook: "" },
      partyRole: { position: "", committee: "", memberSince: "", membershipNo: "" },
      nomination: { election: "", constituency: "", area: "" },
      positions: [],
      elections: [],
      movements: [],
      cases: [],
      education: [],
      occupation: [],
      socialWork: [],
      declaration: { text: DEFAULT_POLITICAL_DECLARATION, place: "", date: todayIso() },
    },
  };
}

const factories: { [T in DocumentType]: () => DocumentOf<T> } = {
  professional: emptyProfessional,
  europass: emptyEuropass,
  biodata: emptyBiodata,
  academic: emptyAcademic,
  political: emptyPolitical,
};

export function emptyDocument<T extends DocumentType>(type: T): DocumentOf<T> {
  return factories[type]();
}
