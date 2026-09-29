"use client";

import {
  newEuropassAdditional,
  newEuropassEducation,
  newEuropassExperience,
  newEuropassLanguage,
  newSkillGroup,
} from "@/lib/documents/factories";
import { CEFR_LEVELS, CEFR_SKILLS, EQF_LEVELS, type CefrLevel, type CefrSkill, type EuropassDocument } from "@/lib/schemas";
import { DesignSettings } from "../DesignSettings";
import { FieldArrayList } from "../FieldArrayList";
import { createFields, Grid } from "../fields";
import { PhotoField } from "../PhotoField";
import { SectionCard } from "../SectionCard";

const F = createFields<EuropassDocument>();
const Card = SectionCard<EuropassDocument>;

const CEFR_GROUP: Record<CefrLevel, string> = {
  A1: "Basic user",
  A2: "Basic user",
  B1: "Independent user",
  B2: "Independent user",
  C1: "Proficient user",
  C2: "Proficient user",
};
const CEFR_OPTIONS = [{ value: "", label: "—" }, ...CEFR_LEVELS.map((l) => ({ value: l, label: l, group: CEFR_GROUP[l] }))];
const SKILL_LABEL: Record<CefrSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  spokenProduction: "Spoken production",
  spokenInteraction: "Spoken interaction",
  writing: "Writing",
};
const EQF_HINT: Record<(typeof EQF_LEVELS)[number], string> = {
  "1": "primary",
  "2": "lower secondary",
  "3": "vocational",
  "4": "upper secondary (SSC/HSC)",
  "5": "short-cycle tertiary",
  "6": "bachelor's",
  "7": "master's",
  "8": "doctorate",
};
const EQF_OPTIONS = [{ value: "", label: "—" }, ...EQF_LEVELS.map((l) => ({ value: l, label: `Level ${l} — ${EQF_HINT[l]}` }))];
const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(" · ");

export function EuropassForm() {
  return (
    <div className="space-y-4">
      <DesignSettings />

      <Card title="Personal information" description="Name, position and how to reach you, as on a Europass CV.">
        <Grid>
          <F.Text name="data.header.fullName" label="Full name *" autoComplete="name" placeholder="Nusrat Jahan" />
          <F.Text name="data.header.headline" label="Job applied for / position" placeholder="Data Analyst" />
          <F.IsoDate name="data.header.dateOfBirth" label="Date of birth" hint="Optional. Printed as DD/MM/YYYY." />
          <F.Text name="data.header.nationality" label="Nationality" placeholder="Bangladeshi" />
          <F.Text name="data.header.gender" label="Gender" hint="Optional — leave empty to omit." />
          <F.Text name="data.header.phone" label="Phone" type="tel" autoComplete="tel" placeholder="+880 1811-223344" />
          <F.Text name="data.header.email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <F.Text name="data.header.linkedin" label="LinkedIn" placeholder="linkedin.com/in/your-name" />
          <F.Text name="data.header.website" label="Website (optional)" placeholder="yourname.dev" />
          <F.Text name="data.header.address" label="Address" autoComplete="street-address" className="sm:col-span-2" />
        </Grid>
      </Card>

      <Card title="Photo" description="Common on European CVs, but never required." toggleName="sections.photo">
        <PhotoField<EuropassDocument> name="data.photo" defaultAspect="passport" />
      </Card>

      <Card title="About me" toggleName="sections.aboutMe">
        <F.TextArea name="data.aboutMe" rows={5} hint="A short profile: your experience, strengths and what you are looking for." />
      </Card>

      <Card title="Work experience" toggleName="sections.experience">
        <FieldArrayList<EuropassDocument, "data.experience">
          name="data.experience"
          create={newEuropassExperience}
          addLabel="Add position"
          emptyText="No positions yet."
          titleOf={(e) => join(e?.position, e?.organization) || "New position"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Occupation or position *" />
                <F.Text name={`${p}.organization`} label="Employer *" />
                <F.Text name={`${p}.location`} label="City, country" placeholder="Dhaka, Bangladesh" />
                <F.Text name={`${p}.sector`} label="Business or sector" placeholder="Telecommunications" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" presentLabel="Current" />
              <F.Lines name={`${p}.bullets`} label="Main activities and responsibilities" rows={4} hint="One per line." />
            </>
          )}
        />
      </Card>

      <Card title="Education and training" toggleName="sections.education">
        <FieldArrayList<EuropassDocument, "data.education">
          name="data.education"
          create={newEuropassEducation}
          addLabel="Add education"
          titleOf={(e) => join(e?.degree, e?.institution) || "New education"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.degree`} label="Title of qualification *" placeholder="Bachelor of Science" />
                <F.Text name={`${p}.fieldOfStudy`} label="Field of study" placeholder="Statistics" />
                <F.Text name={`${p}.institution`} label="Organisation *" />
                <F.Text name={`${p}.location`} label="City, country" />
                <F.Text name={`${p}.result`} label="Final grade" placeholder="CGPA 3.68 / 4.00" />
                <F.Select
                  name={`${p}.eqfLevel`}
                  label="Level in EQF"
                  options={EQF_OPTIONS}
                  hint="European Qualifications Framework level of the qualification."
                />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" presentLabel="Current" />
              <F.Lines name={`${p}.subjects`} label="Main subjects (optional)" rows={3} />
            </>
          )}
        />
      </Card>

      <Card title="Language skills" description="Self-assessed with the Common European Framework of Reference (A1–C2)." toggleName="sections.languages">
        <F.Tags name="data.languages.motherTongues" label="Mother tongue(s)" placeholder="Bangla" />
        <FieldArrayList<EuropassDocument, "data.languages.other">
          name="data.languages.other"
          create={newEuropassLanguage}
          addLabel="Add language"
          emptyText="No other languages yet."
          titleOf={(l) => l?.name || "New language"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.name`} label="Language *" placeholder="English" />
                <F.Text name={`${p}.certificate`} label="Certificate (optional)" placeholder="IELTS Academic 7.5 (2023)" />
              </Grid>
              <Grid cols={3}>
                {CEFR_SKILLS.map((skill) => (
                  <F.Select key={skill} name={`${p}.${skill}`} label={SKILL_LABEL[skill]} options={CEFR_OPTIONS} />
                ))}
              </Grid>
            </>
          )}
        />
      </Card>

      <Card title="Digital skills" toggleName="sections.digitalSkills">
        <F.Tags name="data.digitalSkills" label="Skills" placeholder="Python, SQL, Power BI, Advanced Excel" />
      </Card>

      <Card title="Other skills" description="Each group prints as its own section, e.g. Organisational skills." toggleName="sections.skills">
        <FieldArrayList<EuropassDocument, "data.skills">
          name="data.skills"
          create={() => newSkillGroup()}
          addLabel="Add skill group"
          titleOf={(g) => g?.category || "New group"}
          renderItem={(p) => (
            <>
              <F.Text name={`${p}.category`} label="Group name *" placeholder="Communication and interpersonal skills" />
              <F.Lines name={`${p}.items`} label="Details" rows={3} hint="One point per line, ideally with an example." />
            </>
          )}
        />
      </Card>

      <Card title="Driving licence" toggleName="sections.drivingLicence">
        <F.Tags name="data.drivingLicence" label="Categories" placeholder="B" />
      </Card>

      <Card
        title="Additional information"
        description="Honours and awards, publications, projects, volunteering, conferences… Entries with the same category print together."
        toggleName="sections.additional"
      >
        <FieldArrayList<EuropassDocument, "data.additional">
          name="data.additional"
          create={() => newEuropassAdditional("Honours and awards")}
          addLabel="Add entry"
          titleOf={(a) => join(a?.category, a?.title) || "New entry"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.category`} label="Category *" placeholder="Honours and awards" />
                <F.Text name={`${p}.title`} label="Title *" />
                <F.Text name={`${p}.organization`} label="Organisation" />
                <F.PartialDate name={`${p}.date`} label="Date" />
              </Grid>
              <F.TextArea name={`${p}.description`} label="Description" rows={2} />
            </>
          )}
        />
      </Card>

      <Card title="Hobbies and interests" toggleName="sections.hobbies">
        <F.Tags name="data.hobbies" label="Hobbies" placeholder="Photography, Hiking, Chess" />
      </Card>
    </div>
  );
}
