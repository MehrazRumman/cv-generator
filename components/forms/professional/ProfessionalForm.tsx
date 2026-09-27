"use client";

import { useWatch } from "react-hook-form";
import {
  newCertification,
  newEducation,
  newExperience,
  newLanguage,
  newProject,
  newReferee,
  newSkillGroup,
} from "@/lib/documents/factories";
import { LANGUAGE_LEVELS, type ProfessionalDocument } from "@/lib/schemas";
import { DesignSettings } from "../DesignSettings";
import { FieldArrayList } from "../FieldArrayList";
import { createFields, Grid } from "../fields";
import { PhotoField } from "../PhotoField";
import { SectionCard } from "../SectionCard";

const F = createFields<ProfessionalDocument>();
const Card = SectionCard<ProfessionalDocument>;

const LEVEL_OPTIONS = LANGUAGE_LEVELS.map((l) => ({ value: l, label: l[0].toUpperCase() + l.slice(1) }));
const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(" · ");

export function ProfessionalForm() {
  const referenceMode = useWatch<ProfessionalDocument, "data.references.mode">({ name: "data.references.mode" });
  return (
    <div className="space-y-4">
      <DesignSettings />

      <Card title="Personal details" description="Name, title and how to reach you.">
        <Grid>
          <F.Text name="data.header.fullName" label="Full name *" autoComplete="name" placeholder="Ayesha Rahman" />
          <F.Text name="data.header.jobTitle" label="Job title" placeholder="Senior Software Engineer" />
          <F.Text name="data.header.phone" label="Phone" type="tel" autoComplete="tel" placeholder="+880 1712-345678" />
          <F.Text name="data.header.email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <F.Text name="data.header.location" label="Location" placeholder="Dhaka, Bangladesh" />
          <F.Text name="data.header.linkedin" label="LinkedIn" placeholder="linkedin.com/in/your-name" />
          <F.Text name="data.header.github" label="GitHub (optional)" placeholder="github.com/you" />
          <F.Text name="data.header.portfolio" label="Portfolio / website (optional)" placeholder="yourname.dev" />
        </Grid>
      </Card>

      <Card title="Photo" description="Off by default — many employers and ATS prefer CVs without photos." toggleName="sections.photo" defaultOpen={false}>
        <PhotoField<ProfessionalDocument> name="data.photo" defaultAspect="square" />
      </Card>

      <Card title="Professional summary" toggleName="sections.summary">
        <F.TextArea name="data.summary" rows={5} hint="3–4 lines: who you are, your strongest results, what you're looking for." />
      </Card>

      <Card title="Work experience" toggleName="sections.experience">
        <FieldArrayList<ProfessionalDocument, "data.experience">
          name="data.experience"
          create={newExperience}
          addLabel="Add position"
          emptyText="No positions yet."
          titleOf={(e) => join(e?.position, e?.organization) || "New position"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Position *" />
                <F.Text name={`${p}.organization`} label="Company *" />
                <F.Text name={`${p}.location`} label="Location" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" />
              <F.Lines name={`${p}.bullets`} label="Achievements" rows={4} hint="One per line. Start with a verb and include numbers where you can." />
            </>
          )}
        />
      </Card>

      <Card title="Education" toggleName="sections.education">
        <FieldArrayList<ProfessionalDocument, "data.education">
          name="data.education"
          create={newEducation}
          addLabel="Add education"
          titleOf={(e) => join(e?.degree, e?.institution) || "New education"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.degree`} label="Degree *" placeholder="BSc" />
                <F.Text name={`${p}.fieldOfStudy`} label="Field of study" placeholder="Computer Science and Engineering" />
                <F.Text name={`${p}.institution`} label="Institution *" />
                <F.Text name={`${p}.location`} label="Location" />
                <F.Text name={`${p}.result`} label="CGPA / result" placeholder="CGPA 3.72 / 4.00" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Years" presentLabel="Ongoing" />
            </>
          )}
        />
      </Card>

      <Card title="Skills" description="Grouped, e.g. Technical, Soft skills, Tools." toggleName="sections.skills">
        <FieldArrayList<ProfessionalDocument, "data.skills">
          name="data.skills"
          create={() => newSkillGroup()}
          addLabel="Add skill group"
          titleOf={(g) => g?.category || "New group"}
          renderItem={(p) => (
            <>
              <F.Text name={`${p}.category`} label="Group name *" />
              <F.Tags name={`${p}.items`} label="Skills" placeholder="Go, TypeScript, PostgreSQL" />
            </>
          )}
        />
      </Card>

      <Card title="Certifications" toggleName="sections.certifications">
        <FieldArrayList<ProfessionalDocument, "data.certifications">
          name="data.certifications"
          create={newCertification}
          addLabel="Add certification"
          titleOf={(c) => c?.name || "New certification"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.name`} label="Name *" />
              <F.Text name={`${p}.issuer`} label="Issuer" />
              <F.PartialDate name={`${p}.date`} label="Date" />
              <F.Text name={`${p}.credentialId`} label="Credential ID" />
              <F.Text name={`${p}.url`} label="Link" className="sm:col-span-2" />
            </Grid>
          )}
        />
      </Card>

      <Card title="Projects" description="Optional." toggleName="sections.projects">
        <FieldArrayList<ProfessionalDocument, "data.projects">
          name="data.projects"
          create={newProject}
          addLabel="Add project"
          titleOf={(pr) => pr?.name || "New project"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.name`} label="Project name *" />
                <F.Text name={`${p}.role`} label="Your role" />
                <F.Text name={`${p}.url`} label="Link" />
                <F.Tags name={`${p}.technologies`} label="Technologies" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" />
              <F.Lines name={`${p}.bullets`} label="Highlights" rows={3} />
            </>
          )}
        />
      </Card>

      <Card title="Languages" toggleName="sections.languages">
        <FieldArrayList<ProfessionalDocument, "data.languages">
          name="data.languages"
          create={newLanguage}
          addLabel="Add language"
          titleOf={(l) => l?.name || "New language"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.name`} label="Language *" />
              <F.Select name={`${p}.level`} label="Proficiency" options={LEVEL_OPTIONS} />
            </Grid>
          )}
        />
      </Card>

      <Card title="References" toggleName="sections.references">
        <F.Select
          name="data.references.mode"
          label="Show as"
          options={[
            { value: "on-request", label: "“Available on request”" },
            { value: "list", label: "List of referees" },
          ]}
        />
        {referenceMode === "list" ? (
          <FieldArrayList<ProfessionalDocument, "data.references.items">
            name="data.references.items"
            create={newReferee}
            addLabel="Add referee"
            titleOf={(r) => r?.name || "New referee"}
            renderItem={(p) => (
              <Grid>
                <F.Text name={`${p}.name`} label="Name *" />
                <F.Text name={`${p}.designation`} label="Designation" />
                <F.Text name={`${p}.organization`} label="Organization" />
                <F.Text name={`${p}.relationship`} label="Relationship" placeholder="Former manager" />
                <F.Text name={`${p}.email`} label="Email" type="email" />
                <F.Text name={`${p}.phone`} label="Phone" type="tel" />
              </Grid>
            )}
          />
        ) : null}
      </Card>
    </div>
  );
}
