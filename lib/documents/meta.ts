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
};

export const isDocumentType = (value: string): value is DocumentType =>
  (DOCUMENT_TYPES as readonly string[]).includes(value);
