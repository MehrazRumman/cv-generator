"use client";

import { useId, useState } from "react";
import { useController, useWatch, type FieldPath } from "react-hook-form";
import {
  newAcademicEducation,
  newAward,
  newGrant,
  newMembership,
  newPresentation,
  newPublication,
  newReferee,
  newResearch,
  newService,
  newSkillGroup,
  newTeaching,
} from "@/lib/documents/factories";
import { authorListToString, parseAuthorList } from "@/lib/format/citation";
import { PRESENTATION_KINDS, PUBLICATION_KINDS, type AcademicDocument, type Author, type PublicationKind } from "@/lib/schemas";
import { DesignSettings } from "../DesignSettings";
import { FieldArrayList } from "../FieldArrayList";
import { createFields, FieldShell, Grid } from "../fields";
import { SectionCard } from "../SectionCard";

const F = createFields<AcademicDocument>();
const Card = SectionCard<AcademicDocument>;
const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(" · ");

const KIND_LABEL: Record<PublicationKind, string> = {
  journal: "Journal article",
  conference: "Conference paper",
  chapter: "Book chapter",
  preprint: "Preprint",
};
const VENUE_LABEL: Record<PublicationKind, string> = {
  journal: "Journal",
  conference: "Conference / proceedings",
  chapter: "Book title",
  preprint: "Repository (arXiv, bioRxiv…)",
};

const isAuthorArray = (v: unknown): v is Author[] =>
  Array.isArray(v) && v.every((a) => typeof a === "object" && a !== null && "family" in a && "given" in a);

/** Authors typed as "Family, Given; Family, Given" and stored structured, so citations can be formatted. */
function AuthorsField({ name }: { name: FieldPath<AcademicDocument> }) {
  const id = useId();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController<AcademicDocument>({ name });
  const authors = isAuthorArray(value) ? value : [];
  const canonical = authorListToString(authors);
  const [text, setText] = useState(canonical);
  const [lastCanonical, setLastCanonical] = useState(canonical);
  if (canonical !== lastCanonical) {
    // Value changed from outside (sample, import) — follow it unless it's what the user is typing.
    setLastCanonical(canonical);
    if (authorListToString(parseAuthorList(text)) !== canonical) setText(canonical);
  }
  return (
    <FieldShell
      id={id}
      label="Authors *"
      hint="In publication order, separated by semicolons: Islam, Farhana; Hirst, Graeme. Your own name is bolded automatically."
      error={fieldState.error?.message}
    >
      <input
        id={id}
        ref={ref}
        className="input"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseAuthorList(e.target.value));
        }}
        onBlur={() => {
          setText(authorListToString(parseAuthorList(text)));
          onBlur();
        }}
        aria-invalid={fieldState.error ? true : undefined}
      />
    </FieldShell>
  );
}

function PublicationFields({ prefix }: { prefix: `data.publications.${number}` }) {
  const kind = useWatch<AcademicDocument, `data.publications.${number}.kind`>({ name: `${prefix}.kind` });
  return (
    <>
      <Grid>
        <F.Select name={`${prefix}.kind`} label="Type" options={PUBLICATION_KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
        <F.Select
          name={`${prefix}.status`}
          label="Status"
          options={[
            { value: "published", label: "Published" },
            { value: "accepted", label: "Accepted" },
            { value: "in-press", label: "In press" },
          ]}
        />
      </Grid>
      <AuthorsField name={`${prefix}.authors`} />
      <F.Text name={`${prefix}.title`} label="Title *" />
      <Grid>
        <F.Text name={`${prefix}.venue`} label={VENUE_LABEL[kind] ?? "Venue"} />
        <F.Text name={`${prefix}.year`} label="Year" placeholder="2024" />
        {kind === "journal" ? (
          <>
            <F.Text name={`${prefix}.volume`} label="Volume" />
            <F.Text name={`${prefix}.issue`} label="Issue" />
          </>
        ) : null}
        {kind === "chapter" ? <F.Text name={`${prefix}.editors`} label="Editors" placeholder="S. Bird & M. Choudhury" /> : null}
        {kind === "chapter" || kind === "conference" ? <F.Text name={`${prefix}.publisher`} label="Publisher" /> : null}
        {kind === "conference" ? <F.Text name={`${prefix}.location`} label="Location" placeholder="Marseille, France" /> : null}
        {kind !== "preprint" ? <F.Text name={`${prefix}.pages`} label="Pages" placeholder="311–349" /> : null}
        <F.Text name={`${prefix}.doi`} label="DOI" placeholder="10.1162/coli_a_00471" />
        <F.Text name={`${prefix}.url`} label="URL (if no DOI)" />
      </Grid>
    </>
  );
}

export function AcademicForm() {
  return (
    <div className="space-y-4">
      <DesignSettings
        extra={
          <F.Select
            name="settings.citationStyle"
            label="Citation style"
            options={[
              { value: "apa", label: "APA 7th edition" },
              { value: "ieee", label: "IEEE (numbered)" },
            ]}
          />
        }
      />

      <Card title="Header" description="Name, position and academic profiles.">
        <Grid>
          <F.Text name="data.header.fullName" label="Full name *" autoComplete="name" />
          <F.Text name="data.header.designation" label="Title / designation" placeholder="Assistant Professor" />
          <F.Text name="data.header.department" label="Department" />
          <F.Text name="data.header.institution" label="Institution" />
          <F.Text name="data.header.email" label="Email" type="email" />
          <F.Text name="data.header.phone" label="Phone" type="tel" />
          <F.Text name="data.header.orcid" label="ORCID" placeholder="0000-0002-1825-0097" />
          <F.Text name="data.header.googleScholar" label="Google Scholar URL" />
          <F.Text name="data.header.researchGate" label="ResearchGate URL" />
          <F.Text name="data.header.website" label="Website" />
        </Grid>
        <F.Tags
          name="data.authorAliases"
          label="Other spellings of your name in author lists"
          hint="Used to bold your name, e.g. Islam, F. N. — separate with commas."
        />
      </Card>

      <Card title="Research interests" toggleName="sections.researchInterests">
        <F.Lines name="data.researchInterests" rows={3} />
      </Card>

      <Card title="Education" toggleName="sections.education">
        <FieldArrayList<AcademicDocument, "data.education">
          name="data.education"
          create={newAcademicEducation}
          addLabel="Add degree"
          titleOf={(e) => join(e?.degree, e?.institution) || "New degree"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.degree`} label="Degree *" placeholder="PhD" />
                <F.Text name={`${p}.fieldOfStudy`} label="Field" />
                <F.Text name={`${p}.institution`} label="Institution *" />
                <F.Text name={`${p}.location`} label="Location" />
                <F.Text name={`${p}.result`} label="CGPA / result" />
                <F.Text name={`${p}.supervisor`} label="Supervisor" />
              </Grid>
              <F.Text name={`${p}.thesisTitle`} label="Thesis title" />
              <F.DateRange name={`${p}.period`} label="Years" presentLabel="Ongoing" />
            </>
          )}
        />
      </Card>

      <Card title="Academic / teaching experience" toggleName="sections.teaching">
        <FieldArrayList<AcademicDocument, "data.teaching">
          name="data.teaching"
          create={newTeaching}
          addLabel="Add position"
          titleOf={(t) => join(t?.position, t?.organization) || "New position"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Position *" />
                <F.Text name={`${p}.organization`} label="Institution *" />
                <F.Text name={`${p}.location`} label="Location" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" />
              <F.Lines name={`${p}.courses`} label="Courses taught" rows={3} placeholder="CSE 101: Structured Programming (Fall 2023)" />
              <F.Lines name={`${p}.bullets`} label="Other highlights" rows={2} />
            </>
          )}
        />
      </Card>

      <Card title="Research experience" toggleName="sections.research">
        <FieldArrayList<AcademicDocument, "data.research">
          name="data.research"
          create={newResearch}
          addLabel="Add position"
          titleOf={(r) => join(r?.position, r?.organization) || "New position"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Position *" />
                <F.Text name={`${p}.organization`} label="Lab / institution *" />
                <F.Text name={`${p}.location`} label="Location" />
                <F.Text name={`${p}.supervisor`} label="Supervisor / PI" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" />
              <F.Lines name={`${p}.bullets`} label="Contributions" rows={3} />
            </>
          )}
        />
      </Card>

      <Card title="Publications" description="Grouped by type in the PDF and formatted in the chosen citation style." toggleName="sections.publications">
        <FieldArrayList<AcademicDocument, "data.publications">
          name="data.publications"
          create={() => newPublication()}
          addLabel="Add publication"
          titleOf={(pub) => (pub ? `${KIND_LABEL[pub.kind]}: ${pub.title || "untitled"}` : "New publication")}
          renderItem={(p) => <PublicationFields prefix={p} />}
        />
      </Card>

      <Card title="Grants & funding" toggleName="sections.grants">
        <FieldArrayList<AcademicDocument, "data.grants">
          name="data.grants"
          create={newGrant}
          addLabel="Add grant"
          titleOf={(g) => g?.title || "New grant"}
          renderItem={(p) => (
            <>
              <F.Text name={`${p}.title`} label="Title *" />
              <Grid>
                <F.Text name={`${p}.funder`} label="Funder" />
                <F.Text name={`${p}.role`} label="Role" placeholder="Principal Investigator" />
                <F.Text name={`${p}.amount`} label="Amount" placeholder="BDT 25,00,000" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Period" />
            </>
          )}
        />
      </Card>

      <Card title="Awards, honors & scholarships" toggleName="sections.awards">
        <FieldArrayList<AcademicDocument, "data.awards">
          name="data.awards"
          create={newAward}
          addLabel="Add award"
          titleOf={(a) => a?.title || "New award"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.title`} label="Title *" />
              <F.Text name={`${p}.issuer`} label="Awarded by" />
              <F.PartialDate name={`${p}.date`} label="Date" />
              <F.Text name={`${p}.description`} label="Note" />
            </Grid>
          )}
        />
      </Card>

      <Card title="Conferences & presentations" toggleName="sections.presentations">
        <FieldArrayList<AcademicDocument, "data.presentations">
          name="data.presentations"
          create={newPresentation}
          addLabel="Add presentation"
          titleOf={(pr) => pr?.title || "New presentation"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.title`} label="Title *" className="sm:col-span-2" />
              <F.Select name={`${p}.kind`} label="Type" options={PRESENTATION_KINDS.map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} />
              <F.PartialDate name={`${p}.date`} label="Date" />
              <F.Text name={`${p}.event`} label="Event" />
              <F.Text name={`${p}.location`} label="Location" />
            </Grid>
          )}
        />
      </Card>

      <Card title="Professional service" description="Reviewing, committees, editorial roles." toggleName="sections.service">
        <FieldArrayList<AcademicDocument, "data.service">
          name="data.service"
          create={newService}
          addLabel="Add role"
          titleOf={(s) => join(s?.role, s?.organization) || "New role"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.role`} label="Role *" placeholder="Reviewer" />
                <F.Text name={`${p}.organization`} label="Journal / conference / body" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Period" />
            </>
          )}
        />
      </Card>

      <Card title="Memberships" toggleName="sections.memberships">
        <FieldArrayList<AcademicDocument, "data.memberships">
          name="data.memberships"
          create={newMembership}
          addLabel="Add membership"
          titleOf={(m) => m?.organization || "New membership"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.organization`} label="Organization *" />
                <F.Text name={`${p}.role`} label="Membership type" placeholder="Member" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Since" />
            </>
          )}
        />
      </Card>

      <Card title="Skills" description="Lab techniques, software, programming." toggleName="sections.skills">
        <FieldArrayList<AcademicDocument, "data.skills">
          name="data.skills"
          create={() => newSkillGroup()}
          addLabel="Add skill group"
          titleOf={(g) => g?.category || "New group"}
          renderItem={(p) => (
            <>
              <F.Text name={`${p}.category`} label="Group name *" />
              <F.Tags name={`${p}.items`} label="Skills" />
            </>
          )}
        />
      </Card>

      <Card title="Referees" toggleName="sections.referees">
        <FieldArrayList<AcademicDocument, "data.referees">
          name="data.referees"
          create={newReferee}
          addLabel="Add referee"
          titleOf={(r) => r?.name || "New referee"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.name`} label="Name *" />
              <F.Text name={`${p}.designation`} label="Designation" />
              <F.Text name={`${p}.organization`} label="Institution" />
              <F.Text name={`${p}.relationship`} label="Relationship" placeholder="PhD supervisor" />
              <F.Text name={`${p}.email`} label="Email" type="email" />
              <F.Text name={`${p}.phone`} label="Phone" type="tel" />
            </Grid>
          )}
        />
      </Card>
    </div>
  );
}
