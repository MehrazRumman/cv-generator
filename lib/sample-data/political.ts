import { emptyPolitical } from "@/lib/documents/defaults";
import { PARTIES } from "@/lib/documents/parties";
import type { PoliticalDocument, PoliticalParty } from "@/lib/schemas";
import { SAMPLE_PHOTO } from "./photo";

/** A document for `party` in the party's colour, with the sample photo. */
function base(party: PoliticalParty): PoliticalDocument {
  const doc = emptyPolitical();
  return {
    ...doc,
    settings: { ...doc.settings, accentColor: PARTIES[party].colors.primary },
    data: { ...doc.data, party, photo: { dataUrl: SAMPLE_PHOTO, aspect: "passport" } },
  };
}

/*
 * Fictional people. The three samples have the same shape and level of detail so no party is
 * presented more favourably than another.
 */

export function samplePoliticalBnp(): PoliticalDocument {
  const doc = base("bnp");
  return {
    ...doc,
    data: {
      ...doc.data,
      personal: {
        fullName: "মোঃ আনিসুর রহমান",
        fathersName: "মোঃ আব্দুল হামিদ",
        mothersName: "মোছাঃ রাবেয়া খাতুন",
        spouseName: "নাসরিন আক্তার",
        dateOfBirth: "1972-05-14",
        religion: "ইসলাম",
        nid: "1972 2690 1234 567",
      },
      contact: {
        presentAddress: "বাড়ি ১৮, রোড ৪, ধানমন্ডি, ঢাকা-১২০৫",
        permanentAddress: "গ্রাম: চরপাড়া, ডাকঘর: চরপাড়া, উপজেলা: সদর, জেলা: কুমিল্লা",
        phone: "+880 1711-000111",
        email: "anisur.rahman@example.com",
        facebook: "facebook.com/example.anisur",
      },
      partyRole: { position: "যুগ্ম আহ্বায়ক", committee: "কুমিল্লা জেলা বিএনপি", memberSince: "1990", membershipNo: "" },
      nomination: { election: "ত্রয়োদশ জাতীয় সংসদ নির্বাচন", constituency: "কুমিল্লা-০০ (উদাহরণ)", area: "সদর উপজেলা ও পৌরসভা" },
      positions: [
        {
          id: "pos1",
          position: "যুগ্ম আহ্বায়ক",
          organization: "কুমিল্লা জেলা বিএনপি",
          level: "district",
          period: { start: "2019", end: "", current: true },
        },
        {
          id: "pos2",
          position: "সাধারণ সম্পাদক",
          organization: "জাতীয়তাবাদী যুবদল, কুমিল্লা জেলা",
          level: "district",
          period: { start: "2008", end: "2019", current: false },
        },
        {
          id: "pos3",
          position: "সভাপতি",
          organization: "জাতীয়তাবাদী ছাত্রদল, কুমিল্লা কলেজ শাখা",
          level: "upazila",
          period: { start: "1992", end: "1996", current: false },
        },
      ],
      elections: [
        { id: "el1", election: "উপজেলা পরিষদ নির্বাচন", post: "চেয়ারম্যান", constituency: "সদর উপজেলা", year: "2014", result: "won", votes: "৬২,৪১০" },
      ],
      movements: [
        { id: "mv1", title: "স্বৈরাচারবিরোধী আন্দোলন", year: "১৯৯০", description: "কলেজ শাখার পক্ষ থেকে মিছিল ও সমাবেশ সংগঠন।" },
        { id: "mv2", title: "জুলাই গণঅভ্যুত্থান", year: "২০২৪", description: "জেলা পর্যায়ে কর্মসূচি সমন্বয়।" },
      ],
      cases: [],
      education: [
        {
          id: "edu1",
          degree: "স্নাতকোত্তর",
          fieldOfStudy: "রাষ্ট্রবিজ্ঞান",
          institution: "কুমিল্লা ভিক্টোরিয়া সরকারি কলেজ",
          board: "জাতীয় বিশ্ববিদ্যালয়",
          location: "",
          period: { start: "", end: "1996", current: false },
          result: "দ্বিতীয় শ্রেণি",
        },
        {
          id: "edu2",
          degree: "এইচএসসি",
          fieldOfStudy: "মানবিক",
          institution: "কুমিল্লা সরকারি কলেজ",
          board: "কুমিল্লা বোর্ড",
          location: "",
          period: { start: "", end: "1990", current: false },
          result: "প্রথম বিভাগ",
        },
      ],
      occupation: [
        {
          id: "occ1",
          position: "স্বত্বাধিকারী",
          organization: "রহমান ট্রেডার্স",
          location: "কুমিল্লা",
          period: { start: "1998", end: "", current: true },
          bullets: [],
        },
      ],
      socialWork: [
        { id: "sw1", role: "প্রতিষ্ঠাতা সভাপতি", organization: "চরপাড়া উচ্চ বিদ্যালয় পরিচালনা কমিটি", period: { start: "2005", end: "2015", current: false } },
      ],
      declaration: { ...doc.data.declaration, place: "কুমিল্লা" },
    },
  };
}

export function samplePoliticalAwamiLeague(): PoliticalDocument {
  const doc = base("awami-league");
  return {
    ...doc,
    data: {
      ...doc.data,
      personal: {
        fullName: "ফারহানা ইসলাম",
        fathersName: "মোঃ সিরাজুল ইসলাম",
        mothersName: "হাসিনা বেগম",
        spouseName: "মোঃ কামরুল হাসান",
        dateOfBirth: "1978-09-02",
        religion: "ইসলাম",
        nid: "1978 1590 7654 321",
      },
      contact: {
        presentAddress: "ফ্ল্যাট ৫বি, সড়ক ১২, উত্তরা সেক্টর ৭, ঢাকা-১২৩০",
        permanentAddress: "গ্রাম: দক্ষিণপাড়া, উপজেলা: সদর, জেলা: ময়মনসিংহ",
        phone: "+880 1811-000222",
        email: "farhana.islam@example.com",
        facebook: "facebook.com/example.farhana",
      },
      partyRole: { position: "সাংগঠনিক সম্পাদক", committee: "ময়মনসিংহ জেলা আওয়ামী লীগ", memberSince: "1996", membershipNo: "" },
      nomination: { election: "জাতীয় সংসদ নির্বাচন", constituency: "ময়মনসিংহ-০০ (উদাহরণ)", area: "সদর উপজেলা" },
      positions: [
        {
          id: "pos1",
          position: "সাংগঠনিক সম্পাদক",
          organization: "ময়মনসিংহ জেলা আওয়ামী লীগ",
          level: "district",
          period: { start: "2016", end: "", current: true },
        },
        {
          id: "pos2",
          position: "সাধারণ সম্পাদক",
          organization: "যুব মহিলা লীগ, ময়মনসিংহ জেলা",
          level: "district",
          period: { start: "2006", end: "2016", current: false },
        },
        {
          id: "pos3",
          position: "সদস্য",
          organization: "ছাত্রলীগ, আনন্দমোহন কলেজ শাখা",
          level: "upazila",
          period: { start: "1996", end: "2001", current: false },
        },
      ],
      elections: [
        { id: "el1", election: "সিটি কর্পোরেশন নির্বাচন", post: "সংরক্ষিত নারী কাউন্সিলর", constituency: "ওয়ার্ড ৫, ৬ ও ৭", year: "2016", result: "won", votes: "১৮,৯০৫" },
      ],
      movements: [
        { id: "mv1", title: "তত্ত্বাবধায়ক সরকার ও নির্বাচনী সংস্কার আন্দোলন", year: "২০০৬–২০০৭", description: "জেলা পর্যায়ে নারী কর্মীদের সংগঠন।" },
      ],
      cases: [],
      education: [
        {
          id: "edu1",
          degree: "স্নাতকোত্তর",
          fieldOfStudy: "বাংলা",
          institution: "আনন্দমোহন কলেজ",
          board: "জাতীয় বিশ্ববিদ্যালয়",
          location: "",
          period: { start: "", end: "2001", current: false },
          result: "প্রথম শ্রেণি",
        },
        {
          id: "edu2",
          degree: "এইচএসসি",
          fieldOfStudy: "মানবিক",
          institution: "ময়মনসিংহ সরকারি মহিলা কলেজ",
          board: "ঢাকা বোর্ড",
          location: "",
          period: { start: "", end: "1995", current: false },
          result: "প্রথম বিভাগ",
        },
      ],
      occupation: [
        { id: "occ1", position: "প্রভাষক", organization: "দক্ষিণপাড়া ডিগ্রি কলেজ", location: "ময়মনসিংহ", period: { start: "2003", end: "", current: true }, bullets: [] },
      ],
      socialWork: [
        { id: "sw1", role: "সভাপতি", organization: "দক্ষিণপাড়া নারী উন্নয়ন সমিতি", period: { start: "2010", end: "", current: true } },
      ],
      declaration: { ...doc.data.declaration, place: "ময়মনসিংহ" },
    },
  };
}

export function samplePoliticalJamaat(): PoliticalDocument {
  const doc = base("jamaat");
  return {
    ...doc,
    data: {
      ...doc.data,
      personal: {
        fullName: "মাওলানা মোঃ নুরুল আমিন",
        fathersName: "মোঃ আব্দুর রশিদ",
        mothersName: "মোছাঃ আমেনা বেগম",
        spouseName: "মোছাঃ শাহানা পারভীন",
        dateOfBirth: "1969-01-20",
        religion: "ইসলাম",
        nid: "1969 8120 4567 890",
      },
      contact: {
        presentAddress: "বাড়ি ৭, কলেজ রোড, রাজশাহী-৬০০০",
        permanentAddress: "গ্রাম: উত্তরপাড়া, উপজেলা: পবা, জেলা: রাজশাহী",
        phone: "+880 1911-000333",
        email: "nurul.amin@example.com",
        facebook: "facebook.com/example.nurulamin",
      },
      partyRole: { position: "সেক্রেটারি", committee: "রাজশাহী জেলা জামায়াতে ইসলামী", memberSince: "1988", membershipNo: "" },
      nomination: { election: "ত্রয়োদশ জাতীয় সংসদ নির্বাচন", constituency: "রাজশাহী-০০ (উদাহরণ)", area: "পবা ও মোহনপুর উপজেলা" },
      positions: [
        {
          id: "pos1",
          position: "সেক্রেটারি",
          organization: "রাজশাহী জেলা জামায়াতে ইসলামী",
          level: "district",
          period: { start: "2017", end: "", current: true },
        },
        {
          id: "pos2",
          position: "আমীর",
          organization: "পবা উপজেলা জামায়াতে ইসলামী",
          level: "upazila",
          period: { start: "2005", end: "2017", current: false },
        },
        {
          id: "pos3",
          position: "সভাপতি",
          organization: "ইসলামী ছাত্রশিবির, রাজশাহী কলেজ শাখা",
          level: "upazila",
          period: { start: "1989", end: "1992", current: false },
        },
      ],
      elections: [
        { id: "el1", election: "উপজেলা পরিষদ নির্বাচন", post: "ভাইস চেয়ারম্যান", constituency: "পবা উপজেলা", year: "2009", result: "won", votes: "৪১,২৭০" },
      ],
      movements: [
        { id: "mv1", title: "জুলাই গণঅভ্যুত্থান", year: "২০২৪", description: "উপজেলা পর্যায়ে কর্মসূচি সমন্বয়।" },
      ],
      cases: [],
      education: [
        {
          id: "edu1",
          degree: "কামিল",
          fieldOfStudy: "হাদিস",
          institution: "রাজশাহী দারুস সালাম কামিল মাদ্রাসা",
          board: "ইসলামী আরবি বিশ্ববিদ্যালয়",
          location: "",
          period: { start: "", end: "1993", current: false },
          result: "প্রথম শ্রেণি",
        },
        {
          id: "edu2",
          degree: "স্নাতক (সম্মান)",
          fieldOfStudy: "ইসলামের ইতিহাস",
          institution: "রাজশাহী কলেজ",
          board: "জাতীয় বিশ্ববিদ্যালয়",
          location: "",
          period: { start: "", end: "1994", current: false },
          result: "দ্বিতীয় শ্রেণি",
        },
      ],
      occupation: [
        { id: "occ1", position: "অধ্যক্ষ", organization: "উত্তরপাড়া দাখিল মাদ্রাসা", location: "রাজশাহী", period: { start: "1998", end: "", current: true }, bullets: [] },
      ],
      socialWork: [
        { id: "sw1", role: "সাধারণ সম্পাদক", organization: "পবা উপজেলা এতিমখানা পরিচালনা কমিটি", period: { start: "2002", end: "", current: true } },
      ],
      declaration: { ...doc.data.declaration, place: "রাজশাহী" },
    },
  };
}

export function samplePoliticalNcp(): PoliticalDocument {
  const doc = base("ncp");
  return {
    ...doc,
    data: {
      ...doc.data,
      personal: {
        fullName: "তাসনিম আহমেদ",
        fathersName: "মোঃ জাহিদুল ইসলাম",
        mothersName: "সালমা খাতুন",
        spouseName: "",
        dateOfBirth: "1998-11-08",
        religion: "ইসলাম",
        nid: "1998 3021 5678 912",
      },
      contact: {
        presentAddress: "বাসা ২২, রোড ৩, মিরপুর ১০, ঢাকা-১২১৬",
        permanentAddress: "গ্রাম: পূর্বপাড়া, উপজেলা: সদর, জেলা: রংপুর",
        phone: "+880 1611-000444",
        email: "tasnim.ahmed@example.com",
        facebook: "facebook.com/example.tasnim",
      },
      partyRole: { position: "যুগ্ম সদস্য সচিব", committee: "রংপুর জেলা সমন্বয় কমিটি, এনসিপি", memberSince: "2025", membershipNo: "" },
      nomination: { election: "জাতীয় সংসদ নির্বাচন", constituency: "রংপুর-০০ (উদাহরণ)", area: "সদর উপজেলা ও সিটি কর্পোরেশন" },
      positions: [
        {
          id: "pos1",
          position: "যুগ্ম সদস্য সচিব",
          organization: "রংপুর জেলা সমন্বয় কমিটি, জাতীয় নাগরিক পার্টি",
          level: "district",
          period: { start: "2025", end: "", current: true },
        },
        {
          id: "pos2",
          position: "সমন্বয়ক",
          organization: "ছাত্র আন্দোলন, রংপুর জেলা",
          level: "district",
          period: { start: "2024", end: "2025", current: false },
        },
        {
          id: "pos3",
          position: "সাধারণ সম্পাদক",
          organization: "বিতর্ক সংসদ, কারমাইকেল কলেজ",
          level: "upazila",
          period: { start: "2019", end: "2021", current: false },
        },
      ],
      elections: [
        { id: "el1", election: "কলেজ ছাত্র সংসদ নির্বাচন", post: "সাধারণ সম্পাদক", constituency: "কারমাইকেল কলেজ", year: "2025", result: "won", votes: "৪,৮১২" },
      ],
      movements: [
        { id: "mv1", title: "জুলাই গণঅভ্যুত্থান", year: "২০২৪", description: "জেলা পর্যায়ে ছাত্র কর্মসূচি সমন্বয় ও আহতদের চিকিৎসা সহায়তা।" },
      ],
      cases: [],
      education: [
        {
          id: "edu1",
          degree: "স্নাতক (সম্মান)",
          fieldOfStudy: "অর্থনীতি",
          institution: "কারমাইকেল কলেজ",
          board: "জাতীয় বিশ্ববিদ্যালয়",
          location: "",
          period: { start: "", end: "2021", current: false },
          result: "সিজিপিএ ৩.৪২",
        },
        {
          id: "edu2",
          degree: "এইচএসসি",
          fieldOfStudy: "বিজ্ঞান",
          institution: "রংপুর সরকারি কলেজ",
          board: "দিনাজপুর বোর্ড",
          location: "",
          period: { start: "", end: "2016", current: false },
          result: "জিপিএ ৫.০০",
        },
      ],
      occupation: [
        { id: "occ1", position: "সহ-প্রতিষ্ঠাতা", organization: "পূর্বপাড়া ডিজিটাল সেবা কেন্দ্র", location: "রংপুর", period: { start: "2022", end: "", current: true }, bullets: [] },
      ],
      socialWork: [
        { id: "sw1", role: "স্বেচ্ছাসেবক সমন্বয়ক", organization: "রংপুর বন্যা ত্রাণ উদ্যোগ", period: { start: "2022", end: "", current: true } },
      ],
      declaration: { ...doc.data.declaration, place: "রংপুর" },
    },
  };
}
