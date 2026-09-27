import { DEFAULT_DECLARATION, emptyBiodata } from "@/lib/documents/defaults";
import type { BiodataDocument } from "@/lib/schemas";
import { SAMPLE_PHOTO } from "./photo";

/** Fictional marriage biodata written in Bangla (also exercises conjuncts and mixed Bangla/English text). */
export function sampleBiodataMarriage(): BiodataDocument {
  const base = emptyBiodata();
  return {
    ...base,
    settings: { ...base.settings, labelLanguage: "bn", templateId: "classic" },
    data: {
      mode: "marriage",
      photo: { dataUrl: SAMPLE_PHOTO, aspect: "passport" },
      personal: {
        fullName: "তানভীর আহমেদ",
        dateOfBirth: "1995-08-14",
        height: "৫ ফুট ৯ ইঞ্চি",
        weight: "৭০ কেজি",
        bloodGroup: "B+",
        complexion: "উজ্জ্বল শ্যামলা",
        maritalStatus: "never-married",
        religion: "ইসলাম",
        nationality: "বাংলাদেশী",
        nid: "",
      },
      contact: {
        presentAddress: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫",
        permanentAddress: "গ্রাম: চন্দ্রপুর, ডাকঘর: কুমারখালী, জেলা: কুষ্টিয়া",
        phone: "+880 1811-223344",
        email: "tanvir.ahmed@example.com",
      },
      education: [
        {
          id: "e1",
          degree: "এম.এসসি",
          fieldOfStudy: "কম্পিউটার বিজ্ঞান",
          institution: "ঢাকা বিশ্ববিদ্যালয়",
          location: "",
          board: "ঢাকা বিশ্ববিদ্যালয়",
          period: { start: "", end: "2019", current: false },
          result: "CGPA 3.68",
        },
        {
          id: "e2",
          degree: "বি.এসসি (অনার্স)",
          fieldOfStudy: "কম্পিউটার বিজ্ঞান ও প্রকৌশল",
          institution: "ঢাকা বিশ্ববিদ্যালয়",
          location: "",
          board: "ঢাকা বিশ্ববিদ্যালয়",
          period: { start: "", end: "2017", current: false },
          result: "CGPA 3.55",
        },
        {
          id: "e3",
          degree: "এইচএসসি",
          fieldOfStudy: "বিজ্ঞান",
          institution: "ঢাকা কলেজ",
          location: "",
          board: "ঢাকা",
          period: { start: "", end: "2013", current: false },
          result: "GPA 5.00",
        },
        {
          id: "e4",
          degree: "এসএসসি",
          fieldOfStudy: "বিজ্ঞান",
          institution: "কুষ্টিয়া জিলা স্কুল",
          location: "",
          board: "যশোর",
          period: { start: "", end: "2011", current: false },
          result: "GPA 5.00",
        },
      ],
      occupation: [
        {
          id: "o1",
          position: "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার",
          organization: "গ্রামীণফোন লিমিটেড",
          location: "ঢাকা",
          period: { start: "2021-02", end: "", current: true },
          bullets: [],
        },
      ],
      family: {
        father: { name: "মোঃ আব্দুল্লাহ আহমেদ", occupation: "অবসরপ্রাপ্ত প্রধান শিক্ষক" },
        mother: { name: "মোছাঃ রাশিদা বেগম", occupation: "গৃহিণী" },
        siblings: [
          { id: "s1", name: "ফারহানা আহমেদ", relation: "sister", educationOrOccupation: "এমবিবিএস, সহকারী সার্জন", maritalStatus: "married" },
          { id: "s2", name: "সাকিব আহমেদ", relation: "brother", educationOrOccupation: "বিবিএ অধ্যয়নরত, নর্থ সাউথ বিশ্ববিদ্যালয়", maritalStatus: "never-married" },
        ],
        familyType: "nuclear",
        notes: "পরিবার ধার্মিক ও শিক্ষিত। চাচা ও মামারা ঢাকা ও কুষ্টিয়ায় প্রতিষ্ঠিত।",
      },
      expectations:
        "শিক্ষিত, ধার্মিক ও সংস্কৃতিমনা জীবনসঙ্গী কাম্য। কমপক্ষে স্নাতক ডিগ্রিধারী, বয়স ২৩–২৭ বছর। কর্মজীবী হলে অসুবিধা নেই। পারিবারিক মূল্যবোধে বিশ্বাসী হতে হবে।",
      hobbies: ["বই পড়া", "ভ্রমণ", "ফটোগ্রাফি", "রবীন্দ্রসংগীত", "ক্রিকেট"],
      declaration: { text: DEFAULT_DECLARATION, place: "", date: "" },
    },
  };
}

/** Fictional job biodata in English (Bangladeshi government/NGO style, with declaration). */
export function sampleBiodataJob(): BiodataDocument {
  const base = emptyBiodata();
  return {
    ...base,
    settings: { ...base.settings, labelLanguage: "en", templateId: "classic", accentColor: "#1f4e79" },
    data: {
      mode: "job",
      photo: { dataUrl: SAMPLE_PHOTO, aspect: "passport" },
      personal: {
        fullName: "Nusrat Jahan",
        dateOfBirth: "1998-02-03",
        height: "5′ 3″",
        weight: "",
        bloodGroup: "O+",
        complexion: "",
        maritalStatus: "never-married",
        religion: "Islam",
        nationality: "Bangladeshi",
        nid: "1998 2691 4471 205",
      },
      contact: {
        presentAddress: "House 21, Road 3, Sector 7, Uttara, Dhaka-1230",
        permanentAddress: "Village: Rampur, P.O.: Shibganj, Dist.: Bogura",
        phone: "+880 1911-556677",
        email: "nusrat.jahan@example.com",
      },
      education: [
        {
          id: "e1",
          degree: "BBA",
          fieldOfStudy: "Accounting",
          institution: "University of Rajshahi",
          location: "",
          board: "University of Rajshahi",
          period: { start: "", end: "2020", current: false },
          result: "CGPA 3.61 / 4.00",
        },
        {
          id: "e2",
          degree: "HSC",
          fieldOfStudy: "Business Studies",
          institution: "Govt. Azizul Haque College",
          location: "",
          board: "Rajshahi",
          period: { start: "", end: "2016", current: false },
          result: "GPA 5.00",
        },
        {
          id: "e3",
          degree: "SSC",
          fieldOfStudy: "Business Studies",
          institution: "Bogura Zilla School",
          location: "",
          board: "Rajshahi",
          period: { start: "", end: "2014", current: false },
          result: "GPA 5.00",
        },
      ],
      occupation: [
        {
          id: "o1",
          position: "Junior Accounts Officer",
          organization: "BRAC",
          location: "Dhaka",
          period: { start: "2021-07", end: "", current: true },
          bullets: ["Prepare monthly financial reports for 12 field offices.", "Reconcile bank statements and vendor payments using Tally ERP."],
        },
      ],
      family: {
        father: { name: "Md. Abdul Karim", occupation: "Businessman" },
        mother: { name: "Mrs. Shahana Karim", occupation: "Homemaker" },
        siblings: [],
        familyType: "",
        notes: "",
      },
      expectations: "",
      hobbies: ["Reading", "Volunteering", "Cooking"],
      declaration: { text: DEFAULT_DECLARATION, place: "Dhaka", date: "2026-09-28" },
    },
  };
}
