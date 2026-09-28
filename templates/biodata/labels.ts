import type { BiodataMode, BiodataSection } from "@/lib/schemas";

export type LabelLanguage = "en" | "bn";

const MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const EN = {
  title: { marriage: "Biodata", job: "Biodata" } as Record<BiodataMode, string>,
  sections: {
    photo: "Photo",
    personal: "Personal Information",
    contact: "Contact Information",
    education: "Educational Qualifications",
    occupation: "Occupation",
    family: "Family Information",
    expectations: "Partner Expectations",
    hobbies: "Hobbies & Interests",
    declaration: "Declaration",
  } as Record<BiodataSection, string>,
  occupationJob: "Work Experience",
  fields: {
    fullName: "Name",
    fathersName: "Father's Name",
    mothersName: "Mother's Name",
    dateOfBirth: "Date of Birth",
    age: "Age",
    height: "Height",
    weight: "Weight",
    bloodGroup: "Blood Group",
    complexion: "Complexion",
    maritalStatus: "Marital Status",
    religion: "Religion",
    nationality: "Nationality",
    nid: "NID No.",
    presentAddress: "Present Address",
    permanentAddress: "Permanent Address",
    phone: "Mobile",
    email: "Email",
    father: "Father",
    mother: "Mother",
    familyType: "Family Type",
    siblings: "Siblings",
    notes: "Other Details",
    place: "Place",
    date: "Date",
    signature: "Signature",
  },
  table: {
    degree: "Exam / Degree",
    institution: "Institution",
    board: "Board / University",
    year: "Passing Year",
    result: "Result",
    name: "Name",
    relation: "Relation",
    educationOrOccupation: "Education / Occupation",
    maritalStatus: "Marital Status",
  },
  maritalStatus: { "never-married": "Never married", married: "Married", divorced: "Divorced", widowed: "Widowed" },
  familyType: { nuclear: "Nuclear family", joint: "Joint family", extended: "Extended family" },
  relation: { brother: "Brother", sister: "Sister" },
  years: (n: number) => `${n} years`,
  running: "Running",
  present: "Present",
};

export type BiodataLabels = typeof EN;

const BN: BiodataLabels = {
  title: { marriage: "বায়োডাটা", job: "জীবন বৃত্তান্ত" },
  sections: {
    photo: "ছবি",
    personal: "ব্যক্তিগত তথ্য",
    contact: "যোগাযোগ",
    education: "শিক্ষাগত যোগ্যতা",
    occupation: "পেশা",
    family: "পারিবারিক তথ্য",
    expectations: "প্রত্যাশিত জীবনসঙ্গী",
    hobbies: "শখ ও আগ্রহ",
    declaration: "অঙ্গীকারনামা",
  },
  occupationJob: "কর্ম অভিজ্ঞতা",
  fields: {
    fullName: "নাম",
    fathersName: "পিতার নাম",
    mothersName: "মাতার নাম",
    dateOfBirth: "জন্ম তারিখ",
    age: "বয়স",
    height: "উচ্চতা",
    weight: "ওজন",
    bloodGroup: "রক্তের গ্রুপ",
    complexion: "গাত্রবর্ণ",
    maritalStatus: "বৈবাহিক অবস্থা",
    religion: "ধর্ম",
    nationality: "জাতীয়তা",
    nid: "জাতীয় পরিচয়পত্র নং",
    presentAddress: "বর্তমান ঠিকানা",
    permanentAddress: "স্থায়ী ঠিকানা",
    phone: "মোবাইল",
    email: "ইমেইল",
    father: "পিতা",
    mother: "মাতা",
    familyType: "পরিবারের ধরন",
    siblings: "ভাই-বোন",
    notes: "অন্যান্য তথ্য",
    place: "স্থান",
    date: "তারিখ",
    signature: "স্বাক্ষর",
  },
  table: {
    degree: "পরীক্ষা / ডিগ্রি",
    institution: "শিক্ষা প্রতিষ্ঠান",
    board: "বোর্ড / বিশ্ববিদ্যালয়",
    year: "পাসের সন",
    result: "ফলাফল",
    name: "নাম",
    relation: "সম্পর্ক",
    educationOrOccupation: "শিক্ষা / পেশা",
    maritalStatus: "বৈবাহিক অবস্থা",
  },
  maritalStatus: { "never-married": "অবিবাহিত", married: "বিবাহিত", divorced: "তালাকপ্রাপ্ত", widowed: "বিধবা / বিপত্নীক" },
  familyType: { nuclear: "একক পরিবার", joint: "যৌথ পরিবার", extended: "বর্ধিত পরিবার" },
  relation: { brother: "ভাই", sister: "বোন" },
  years: (n: number) => `${toBanglaDigits(String(n))} বছর`,
  running: "অধ্যয়নরত",
  present: "বর্তমান",
};

export const BIODATA_LABELS: Record<LabelLanguage, BiodataLabels> = { en: EN, bn: BN };

export function toBanglaDigits(value: string): string {
  return value.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

/** Digits in generated text (ages, formatted dates) follow the label language; typed values are left as typed. */
export const localizeDigits = (value: string, lang: LabelLanguage) => (lang === "bn" ? toBanglaDigits(value) : value);

/** "1996-03-15" → "15 March 1996" / "১৫ মার্চ ১৯৯৬". */
export function formatBiodataDate(iso: string, lang: LabelLanguage): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso.trim();
  const [, y, mo, d] = m;
  const month = (lang === "bn" ? MONTHS_BN : MONTHS_EN)[Number(mo) - 1] ?? mo;
  return localizeDigits(`${Number(d)} ${month} ${y}`, lang);
}

/** "2021-02" → "Feb 2021" / "ফেব্রুয়ারি ২০২১". */
export function formatBiodataPartial(value: string, lang: LabelLanguage): string {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!m) return value.trim();
  const [, y, mo] = m;
  const idx = Number(mo) - 1;
  // No month, or an impossible one from an imported file ("2024-13"): print the year alone.
  if (!mo || idx < 0 || idx > 11) return localizeDigits(y, lang);
  const month = lang === "bn" ? MONTHS_BN[idx] : MONTHS_EN[idx].slice(0, 3);
  return localizeDigits(`${month} ${y}`, lang);
}

export function formatBiodataRange(range: { start: string; end: string; current: boolean }, lang: LabelLanguage): string {
  const t = BIODATA_LABELS[lang];
  const start = formatBiodataPartial(range.start, lang);
  const end = range.current ? t.present : formatBiodataPartial(range.end, lang);
  if (start && end) return start === end ? start : `${start} – ${end}`;
  return start || end;
}

/** Letter-spacing pulls Bangla vowel signs away from their consonants, so it is disabled for Bangla labels. */
export const tracking = (value: number, lang: LabelLanguage) => (lang === "bn" ? 0 : value);
