import { emptyProfessional } from "@/lib/documents/defaults";
import type { ProfessionalDocument } from "@/lib/schemas";
import { SAMPLE_PHOTO } from "./photo";

/** Fictional person — for trying templates quickly. */
export function sampleProfessional(): ProfessionalDocument {
  const base = emptyProfessional();
  return {
    ...base,
    sections: { ...base.sections, references: true },
    data: {
      header: {
        fullName: "Ayesha Rahman",
        jobTitle: "Senior Software Engineer",
        phone: "+880 1712-345678",
        email: "ayesha.rahman@example.com",
        location: "Dhaka, Bangladesh",
        linkedin: "linkedin.com/in/ayesha-rahman",
        github: "github.com/ayesharahman",
        portfolio: "",
      },
      // Included but switched off (sections.photo); photo-led templates turn it on when picked.
      photo: { dataUrl: SAMPLE_PHOTO, aspect: "passport" },
      summary:
        "Backend-focused software engineer with 7+ years of experience building payment and logistics platforms used by millions. Led teams of up to six engineers, cut infrastructure costs by 38% through service consolidation, and introduced testing practices that halved production incidents. Comfortable across Go, TypeScript and cloud infrastructure, and passionate about mentoring junior developers.",
      experience: [
        {
          id: "exp1",
          position: "Senior Software Engineer",
          organization: "bKash Limited",
          location: "Dhaka",
          period: { start: "2022-01", end: "", current: true },
          bullets: [
            "Lead a team of 6 engineers owning the merchant settlement service processing 4M+ transactions per day.",
            "Re-architected batch settlement into an event-driven pipeline (Kafka, Go), reducing settlement time from 6 hours to 40 minutes.",
            "Consolidated 11 legacy services into 3, cutting AWS spend by 38% (≈ USD 210k per year).",
            "Introduced contract testing and canary deploys; production incidents fell from 9 to 4 per quarter.",
          ],
        },
        {
          id: "exp2",
          position: "Software Engineer",
          organization: "Pathao",
          location: "Dhaka",
          period: { start: "2019-03", end: "2021-12", current: false },
          bullets: [
            "Built the real-time rider dispatch API in Node.js and Redis serving 120k requests per minute at peak.",
            "Designed a geofencing module that improved delivery ETA accuracy by 22%.",
            "Mentored 4 interns, two of whom joined full-time.",
          ],
        },
        {
          id: "exp3",
          position: "Junior Software Engineer",
          organization: "Brain Station 23",
          location: "Dhaka",
          period: { start: "2017-07", end: "2019-02", current: false },
          bullets: [
            "Delivered 5 client web applications in React and Laravel for banking and telecom clients.",
            "Automated regression tests with Cypress, reducing manual QA time by 60%.",
          ],
        },
      ],
      education: [
        {
          id: "edu1",
          degree: "BSc",
          fieldOfStudy: "Computer Science and Engineering",
          institution: "Bangladesh University of Engineering and Technology (BUET)",
          location: "Dhaka",
          period: { start: "2013", end: "2017", current: false },
          result: "CGPA 3.72 / 4.00",
        },
        {
          id: "edu2",
          degree: "HSC",
          fieldOfStudy: "Science",
          institution: "Notre Dame College",
          location: "Dhaka",
          period: { start: "", end: "2012", current: false },
          result: "GPA 5.00 / 5.00",
        },
      ],
      skills: [
        { id: "sk1", category: "Technical", items: ["Go", "TypeScript", "Node.js", "PostgreSQL", "Kafka", "Redis", "gRPC", "System design"] },
        { id: "sk2", category: "Soft skills", items: ["Team leadership", "Mentoring", "Stakeholder communication", "Technical writing"] },
        { id: "sk3", category: "Tools", items: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Grafana"] },
      ],
      certifications: [
        {
          id: "cert1",
          name: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          date: "2023-05",
          credentialId: "AWS-SAA-12345",
          url: "",
        },
        { id: "cert2", name: "Certified Kubernetes Application Developer (CKAD)", issuer: "CNCF", date: "2021-11", credentialId: "", url: "" },
      ],
      projects: [
        {
          id: "prj1",
          name: "OpenLedger",
          role: "Creator & maintainer",
          url: "github.com/ayesharahman/openledger",
          period: { start: "2021", end: "", current: true },
          technologies: ["Go", "PostgreSQL", "React"],
          bullets: [
            "Open-source double-entry bookkeeping library with 1.2k GitHub stars, used by 3 fintech startups.",
          ],
        },
      ],
      languages: [
        { id: "lang1", name: "Bangla", level: "native" },
        { id: "lang2", name: "English", level: "fluent" },
        { id: "lang3", name: "Hindi", level: "intermediate" },
      ],
      references: { mode: "on-request", items: [] },
    },
  };
}
