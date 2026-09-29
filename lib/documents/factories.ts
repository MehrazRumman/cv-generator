import { nanoid } from "nanoid";
import type {
  AcademicData,
  BiodataData,
  BiodataEducation,
  Certification,
  EuropassAdditional,
  EuropassData,
  EuropassLanguage,
  Experience,
  PoliticalData,
  ProfessionalData,
  Project,
  Publication,
  Sibling,
} from "@/lib/schemas";

/** Blank entries appended by the "Add" buttons. Each gets a fresh id for keys and drag-and-drop. */

export const newId = () => nanoid(10);
const emptyRange = () => ({ start: "", end: "", current: false });

export const newExperience = (): Experience => ({
  id: newId(),
  position: "",
  organization: "",
  location: "",
  period: emptyRange(),
  bullets: [],
});

export const newEducation = (): ProfessionalData["education"][number] => ({
  id: newId(),
  degree: "",
  fieldOfStudy: "",
  institution: "",
  location: "",
  period: emptyRange(),
  result: "",
});

export const newSkillGroup = (category = ""): ProfessionalData["skills"][number] => ({
  id: newId(),
  category,
  items: [],
});

export const newCertification = (): Certification => ({
  id: newId(),
  name: "",
  issuer: "",
  date: "",
  credentialId: "",
  url: "",
});

export const newProject = (): Project => ({
  id: newId(),
  name: "",
  role: "",
  url: "",
  period: emptyRange(),
  technologies: [],
  bullets: [],
});

export const newLanguage = (): ProfessionalData["languages"][number] => ({
  id: newId(),
  name: "",
  level: "professional",
});

export const newReferee = (): ProfessionalData["references"]["items"][number] => ({
  id: newId(),
  name: "",
  designation: "",
  organization: "",
  email: "",
  phone: "",
  relationship: "",
});

export const newBiodataEducation = (): BiodataEducation => ({ ...newEducation(), board: "" });

export const newSibling = (): Sibling => ({
  id: newId(),
  name: "",
  relation: "brother",
  educationOrOccupation: "",
  maritalStatus: "",
});

export const newAcademicEducation = (): AcademicData["education"][number] => ({
  ...newEducation(),
  thesisTitle: "",
  supervisor: "",
});

export const newTeaching = (): AcademicData["teaching"][number] => ({ ...newExperience(), courses: [] });
export const newResearch = (): AcademicData["research"][number] => ({ ...newExperience(), supervisor: "" });

export const newPublication = (kind: Publication["kind"] = "journal"): Publication => ({
  id: newId(),
  kind,
  status: "published",
  authors: [],
  year: "",
  title: "",
  venue: "",
  volume: "",
  issue: "",
  pages: "",
  editors: "",
  publisher: "",
  location: "",
  doi: "",
  url: "",
});

export const newGrant = (): AcademicData["grants"][number] => ({
  id: newId(),
  title: "",
  funder: "",
  role: "",
  amount: "",
  period: emptyRange(),
});

export const newAward = (): AcademicData["awards"][number] => ({
  id: newId(),
  title: "",
  issuer: "",
  date: "",
  description: "",
});

export const newPresentation = (): AcademicData["presentations"][number] => ({
  id: newId(),
  title: "",
  kind: "talk",
  event: "",
  location: "",
  date: "",
});

export const newService = (): AcademicData["service"][number] => ({
  id: newId(),
  role: "",
  organization: "",
  period: emptyRange(),
});

export const newMembership = (): AcademicData["memberships"][number] => ({
  id: newId(),
  organization: "",
  role: "",
  period: emptyRange(),
});

export const emptyParent = (): BiodataData["family"]["father"] => ({ name: "", occupation: "" });

export const newEuropassExperience = (): EuropassData["experience"][number] => ({ ...newExperience(), sector: "" });

export const newEuropassEducation = (): EuropassData["education"][number] => ({ ...newEducation(), eqfLevel: "", subjects: [] });

export const newEuropassLanguage = (): EuropassLanguage => ({
  id: newId(),
  name: "",
  listening: "",
  reading: "",
  spokenProduction: "",
  spokenInteraction: "",
  writing: "",
  certificate: "",
});

export const newEuropassAdditional = (category = ""): EuropassAdditional => ({
  id: newId(),
  category,
  title: "",
  organization: "",
  date: "",
  description: "",
});

export const newPoliticalPosition = (): PoliticalData["positions"][number] => ({
  id: newId(),
  position: "",
  organization: "",
  level: "",
  period: emptyRange(),
});

export const newPoliticalElection = (): PoliticalData["elections"][number] => ({
  id: newId(),
  election: "",
  post: "",
  constituency: "",
  year: "",
  result: "",
  votes: "",
});

export const newMovement = (): PoliticalData["movements"][number] => ({ id: newId(), title: "", year: "", description: "" });

export const newPoliticalCase = (): PoliticalData["cases"][number] => ({ id: newId(), description: "", year: "", status: "" });

export const newSocialWork = (): PoliticalData["socialWork"][number] => ({ id: newId(), role: "", organization: "", period: emptyRange() });
