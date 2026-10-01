import { DOCUMENT_TYPES, type DocumentType } from "@/lib/schemas";

export interface DocumentTypeMeta {
  type: DocumentType;
  title: string;
  tagline: string;
  description: string;
  bestFor: string[];
}

export const DOCUMENT_TYPE_META: Record<DocumentType, DocumentTypeMeta> = {
  professional: {
    type: "professional",
    title: "Professional CV / Resume",
    tagline: "Corporate & industry jobs",
    description: "A clean 1–2 page résumé with standard headings that applicant tracking systems can read.",
    bestFor: ["Private sector jobs", "Tech & engineering roles", "Online applications (ATS)"],
  },
  europass: {
    type: "europass",
    title: "Europass CV",
    tagline: "Jobs & study in Europe",
    description: "The standard European CV layout: personal details, the CEFR language grid, EQF education levels, digital skills and driving licence.",
    bestFor: ["Jobs in the EU / EEA", "Erasmus+ & European scholarships", "European university admissions"],
  },
  biodata: {
    type: "biodata",
    title: "Biodata",
    tagline: "Marriage proposals & job applications",
    description: "South Asian style biodata with photo, personal and family details. Switch between marriage and job modes.",
    bestFor: ["Marriage proposals", "Government / local job forms", "Bangla or English"],
  },
  academic: {
    type: "academic",
    title: "Academic CV",
    tagline: "Faculty, PhD & scholarships",
    description: "Full academic record with publications in APA or IEEE style, grants, teaching, service and referees.",
    bestFor: ["Faculty positions", "PhD / Masters admissions", "Scholarships & research roles"],
  },
  political: {
    type: "political",
    title: "Political CV",
    tagline: "Party nomination & profile",
    description: "Bangladeshi political CV (রাজনৈতিক জীবনবৃত্তান্ত) with party positions, elections, movements and the seat sought — themed for BNP, Awami League, Jamaat or NCP.",
    bestFor: ["Party nomination applications", "Committee & convention profiles", "Bangla or English"],
  },
};

export const isDocumentType = (value: string): value is DocumentType =>
  (DOCUMENT_TYPES as readonly string[]).includes(value);
