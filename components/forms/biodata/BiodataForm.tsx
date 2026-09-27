"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ageInYears } from "@/lib/format/dates";
import { newBiodataEducation, newExperience, newSibling } from "@/lib/documents/factories";
import { BIODATA_MODE_SECTIONS, BLOOD_GROUPS, FAMILY_TYPES, MARITAL_STATUSES, type BiodataDocument, type BiodataSection } from "@/lib/schemas";
import { DesignSettings } from "../DesignSettings";
import { FieldArrayList } from "../FieldArrayList";
import { createFields, Grid } from "../fields";
import { PhotoField } from "../PhotoField";
import { SectionCard } from "../SectionCard";

const F = createFields<BiodataDocument>();
const Card = SectionCard<BiodataDocument>;

const MARITAL_OPTIONS = [
  { value: "", label: "—" },
  ...MARITAL_STATUSES.map((m) => ({ value: m, label: { "never-married": "Never married", married: "Married", divorced: "Divorced", widowed: "Widowed" }[m] })),
];
const BLOOD_OPTIONS = [{ value: "", label: "—" }, ...BLOOD_GROUPS.map((b) => ({ value: b, label: b }))];
const FAMILY_OPTIONS = [
  { value: "", label: "—" },
  ...FAMILY_TYPES.map((f) => ({ value: f, label: { nuclear: "Nuclear", joint: "Joint", extended: "Extended" }[f] })),
];
const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(" · ");

function ModeSwitch() {
  const { setValue } = useFormContext<BiodataDocument>();
  const mode = useWatch<BiodataDocument, "data.mode">({ name: "data.mode" });
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xs">
      <p className="mb-2 text-xs font-medium text-zinc-700">Biodata for</p>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-zinc-100 p-1" role="radiogroup" aria-label="Biodata type">
        {(
          [
            { value: "marriage", label: "Marriage", hint: "Family & partner expectations" },
            { value: "job", label: "Job application", hint: "Parents' names & declaration" },
          ] as const
        ).map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={mode === o.value}
            onClick={() => setValue("data.mode", o.value, { shouldDirty: true })}
            className={`rounded px-3 py-1.5 text-left transition ${mode === o.value ? "bg-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
          >
            <span className="block text-sm font-medium">{o.label}</span>
            <span className="block text-[11px] text-zinc-500">{o.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AgeHint() {
  const dob = useWatch<BiodataDocument, "data.personal.dateOfBirth">({ name: "data.personal.dateOfBirth" });
  const age = ageInYears(dob);
  return <>{age !== null ? `Age: ${age} years (calculated automatically)` : "Age is calculated automatically."}</>;
}

export function BiodataForm() {
  const mode = useWatch<BiodataDocument, "data.mode">({ name: "data.mode" });
  const shows = (s: BiodataSection) => (BIODATA_MODE_SECTIONS[mode] as readonly BiodataSection[]).includes(s);
  return (
    <div className="space-y-4">
      <ModeSwitch />
      <DesignSettings
        extra={
          <F.Select
            name="settings.labelLanguage"
            label="Headings & labels"
            options={[
              { value: "en", label: "English" },
              { value: "bn", label: "বাংলা (Bangla)" },
            ]}
            hint="Your own text is printed exactly as you type it, in any language."
          />
        }
      />

      <Card title="Photo" description="Shown prominently at the top right." toggleName="sections.photo">
        <PhotoField<BiodataDocument> name="data.photo" defaultAspect="passport" />
      </Card>

      <Card title="Personal information" toggleName="sections.personal">
        <Grid>
          <F.Text name="data.personal.fullName" label="Full name *" className="sm:col-span-2" />
          <F.IsoDate name="data.personal.dateOfBirth" label="Date of birth" hint={<AgeHint />} />
          <F.Select name="data.personal.maritalStatus" label="Marital status" options={MARITAL_OPTIONS} />
          <F.Text name="data.personal.height" label="Height" placeholder={`5′ 6″ or 168 cm`} />
          <F.Text name="data.personal.weight" label="Weight" placeholder="65 kg" />
          <F.Select name="data.personal.bloodGroup" label="Blood group" options={BLOOD_OPTIONS} />
          <F.Text name="data.personal.complexion" label="Complexion (optional)" />
          <F.Text name="data.personal.religion" label="Religion" />
          <F.Text name="data.personal.nationality" label="Nationality" placeholder="Bangladeshi" />
          <F.Text name="data.personal.nid" label="NID number (optional)" />
        </Grid>
        {mode === "job" ? (
          <Grid>
            <F.Text name="data.family.father.name" label="Father's name" hint="Printed under Personal Information in job mode." />
            <F.Text name="data.family.mother.name" label="Mother's name" />
          </Grid>
        ) : null}
      </Card>

      <Card title="Contact" toggleName="sections.contact">
        <Grid>
          <F.TextArea name="data.contact.presentAddress" label="Present address" rows={2} />
          <F.TextArea name="data.contact.permanentAddress" label="Permanent address" rows={2} />
          <F.Text name="data.contact.phone" label="Phone" type="tel" />
          <F.Text name="data.contact.email" label="Email" type="email" />
        </Grid>
      </Card>

      <Card title="Educational qualifications" description="Printed as a table." toggleName="sections.education">
        <FieldArrayList<BiodataDocument, "data.education">
          name="data.education"
          create={newBiodataEducation}
          addLabel="Add exam / degree"
          titleOf={(e) => join(e?.degree, e?.institution) || "New qualification"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.degree`} label="Exam / degree *" placeholder="SSC, HSC, BSc…" />
                <F.Text name={`${p}.fieldOfStudy`} label="Group / subject" placeholder="Science" />
                <F.Text name={`${p}.institution`} label="Institution *" />
                <F.Text name={`${p}.board`} label="Board / university" />
                <F.Text name={`${p}.result`} label="Result" placeholder="GPA 5.00" />
                <F.PartialDate name={`${p}.period.end`} label="Passing year" />
              </Grid>
              <F.Checkbox name={`${p}.period.current`} label="Currently studying" />
            </>
          )}
        />
      </Card>

      <Card title={mode === "job" ? "Work experience" : "Occupation"} toggleName="sections.occupation">
        <FieldArrayList<BiodataDocument, "data.occupation">
          name="data.occupation"
          create={newExperience}
          addLabel="Add occupation"
          titleOf={(o) => join(o?.position, o?.organization) || "New occupation"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Designation *" />
                <F.Text name={`${p}.organization`} label="Organization *" />
                <F.Text name={`${p}.location`} label="Location" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Duration" />
              <F.Lines name={`${p}.bullets`} label="Responsibilities (optional)" rows={3} />
            </>
          )}
        />
      </Card>

      {shows("family") ? (
        <Card title="Family information" description="Marriage biodata only." toggleName="sections.family">
          <Grid>
            <F.Text name="data.family.father.name" label="Father's name" />
            <F.Text name="data.family.father.occupation" label="Father's occupation" />
            <F.Text name="data.family.mother.name" label="Mother's name" />
            <F.Text name="data.family.mother.occupation" label="Mother's occupation" />
            <F.Select name="data.family.familyType" label="Family type" options={FAMILY_OPTIONS} />
          </Grid>
          <p className="pt-1 text-xs font-medium text-zinc-700">Siblings</p>
          <FieldArrayList<BiodataDocument, "data.family.siblings">
            name="data.family.siblings"
            create={newSibling}
            addLabel="Add sibling"
            titleOf={(s) => s?.name || "New sibling"}
            renderItem={(p) => (
              <Grid>
                <F.Text name={`${p}.name`} label="Name *" />
                <F.Select
                  name={`${p}.relation`}
                  label="Relation"
                  options={[
                    { value: "brother", label: "Brother" },
                    { value: "sister", label: "Sister" },
                  ]}
                />
                <F.Text name={`${p}.educationOrOccupation`} label="Education / occupation" />
                <F.Select name={`${p}.maritalStatus`} label="Marital status" options={MARITAL_OPTIONS} />
              </Grid>
            )}
          />
          <F.TextArea name="data.family.notes" label="Other family details (optional)" rows={2} />
        </Card>
      ) : null}

      {shows("expectations") ? (
        <Card title="Partner expectations" description="Optional." toggleName="sections.expectations">
          <F.TextArea name="data.expectations" rows={4} placeholder="Education, age range, values…" />
        </Card>
      ) : null}

      <Card title="Hobbies & interests" toggleName="sections.hobbies">
        <F.Tags name="data.hobbies" placeholder="Reading, travelling, photography" />
      </Card>

      {shows("declaration") ? (
        <Card title="Declaration" description="Job biodata only — adds a signature line." toggleName="sections.declaration">
          <F.TextArea name="data.declaration.text" rows={3} />
          <Grid>
            <F.Text name="data.declaration.place" label="Place" />
            <F.IsoDate name="data.declaration.date" label="Date" />
          </Grid>
        </Card>
      ) : null}
    </div>
  );
}
