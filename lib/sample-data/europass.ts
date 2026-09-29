import { emptyEuropass } from "@/lib/documents/defaults";
import type { EuropassDocument } from "@/lib/schemas";
import { SAMPLE_PHOTO } from "./photo";

/** Fictional person — a data analyst applying for jobs and a master's programme in Europe. */
export function sampleEuropass(): EuropassDocument {
  const base = emptyEuropass();
  return {
    ...base,
    data: {
      header: {
        fullName: "Nusrat Jahan",
        headline: "Data Analyst",
        dateOfBirth: "1996-04-12",
        nationality: "Bangladeshi",
        gender: "Female",
        phone: "+880 1811-223344",
        email: "nusrat.jahan@example.com",
        address: "House 12, Road 5, Dhanmondi, 1205 Dhaka, Bangladesh",
        website: "",
        linkedin: "linkedin.com/in/nusrat-jahan",
      },
      photo: { dataUrl: SAMPLE_PHOTO, aspect: "passport" },
      aboutMe:
        "Data analyst with five years of experience turning telecom and development-sector data into decisions. I build reliable reporting pipelines, communicate findings to non-technical teams and enjoy working in multicultural settings. I am looking for an analytics role in the EU where I can grow into data science.",
      experience: [
        {
          id: "exp1",
          position: "Data Analyst",
          organization: "Grameenphone Ltd.",
          location: "Dhaka, Bangladesh",
          sector: "Telecommunications",
          period: { start: "2021-08", end: "", current: true },
          bullets: [
            "Own the churn-prediction dashboards used weekly by the marketing and retention teams.",
            "Automated 14 manual Excel reports with Python and SQL, saving about 30 hours of work per month.",
            "Designed A/B tests for data-pack offers that raised uptake by 9%.",
          ],
        },
        {
          id: "exp2",
          position: "Research Associate",
          organization: "BRAC Institute of Governance and Development",
          location: "Dhaka, Bangladesh",
          sector: "Research and non-profit",
          period: { start: "2019-07", end: "2021-07", current: false },
          bullets: [
            "Cleaned and analysed household survey data (12,000 respondents) in R and Stata.",
            "Co-wrote three policy briefs on women's access to mobile financial services.",
          ],
        },
      ],
      education: [
        {
          id: "edu1",
          degree: "Bachelor of Science",
          fieldOfStudy: "Statistics",
          institution: "University of Dhaka",
          location: "Dhaka, Bangladesh",
          period: { start: "2014", end: "2018", current: false },
          result: "CGPA 3.68 / 4.00",
          eqfLevel: "6",
          subjects: ["Probability and statistical inference", "Regression and time-series analysis", "Survey sampling"],
        },
        {
          id: "edu2",
          degree: "Higher Secondary Certificate",
          fieldOfStudy: "Science",
          institution: "Viqarunnisa Noon School and College",
          location: "Dhaka, Bangladesh",
          period: { start: "", end: "2013", current: false },
          result: "GPA 5.00 / 5.00",
          eqfLevel: "4",
          subjects: [],
        },
      ],
      languages: {
        motherTongues: ["Bangla"],
        other: [
          {
            id: "lang1",
            name: "English",
            listening: "C1",
            reading: "C1",
            spokenProduction: "C1",
            spokenInteraction: "C1",
            writing: "B2",
            certificate: "IELTS Academic 7.5 (2023)",
          },
          {
            id: "lang2",
            name: "German",
            listening: "A2",
            reading: "A2",
            spokenProduction: "A2",
            spokenInteraction: "A2",
            writing: "A1",
            certificate: "Goethe-Zertifikat A2 (2024)",
          },
          {
            id: "lang3",
            name: "Hindi",
            listening: "B2",
            reading: "A1",
            spokenProduction: "B1",
            spokenInteraction: "B1",
            writing: "A1",
            certificate: "",
          },
        ],
      },
      digitalSkills: ["Python (pandas, scikit-learn)", "SQL", "R", "Power BI", "Tableau", "Advanced Excel", "Git", "Google BigQuery"],
      skills: [
        {
          id: "sk1",
          category: "Communication and interpersonal skills",
          items: [
            "Presented monthly insights to senior management and translated them into action points for field teams.",
            "Trained 20 colleagues in dashboard use through hands-on workshops.",
          ],
        },
        {
          id: "sk2",
          category: "Organisational skills",
          items: ["Coordinated a four-person survey team across six districts, delivering data two weeks ahead of schedule."],
        },
      ],
      drivingLicence: ["B"],
      additional: [
        {
          id: "add1",
          category: "Honours and awards",
          title: "Dean's Award for Academic Excellence",
          organization: "University of Dhaka",
          date: "2018",
          description: "",
        },
        {
          id: "add2",
          category: "Volunteering",
          title: "Data volunteer",
          organization: "JAAGO Foundation",
          date: "2022",
          description: "Built an attendance dashboard for 12 schools so teachers could follow up on absent students.",
        },
        {
          id: "add3",
          category: "Conferences and seminars",
          title: "Speaker, Bangladesh Data Summit",
          organization: "",
          date: "2023-11",
          description: "Talk: “Predicting churn with limited features”.",
        },
      ],
      hobbies: ["Photography", "Hiking", "Chess"],
    },
  };
}
