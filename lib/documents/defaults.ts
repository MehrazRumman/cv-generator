import {
  SCHEMA_VERSION,
  type AcademicDocument,
  type BiodataDocument,
  type DocumentOf,
  type DocumentType,
  type ProfessionalDocument,
} from "@/lib/schemas";
import { todayIso } from "@/lib/format/dates";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { emptyParent, newSkillGroup } from "./factories";

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

const factories: { [T in DocumentType]: () => DocumentOf<T> } = {
  professional: emptyProfessional,
  biodata: emptyBiodata,
  academic: emptyAcademic,
};

export function emptyDocument<T extends DocumentType>(type: T): DocumentOf<T> {
  return factories[type]();
}
