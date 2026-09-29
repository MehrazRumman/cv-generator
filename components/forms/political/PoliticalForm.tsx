"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ageInYears } from "@/lib/format/dates";
import {
  newBiodataEducation,
  newExperience,
  newMovement,
  newPoliticalCase,
  newPoliticalElection,
  newPoliticalPosition,
  newSocialWork,
} from "@/lib/documents/factories";
import { isPartyAccent, PARTIES } from "@/lib/documents/parties";
import { COMMITTEE_LEVELS, ELECTION_RESULTS, POLITICAL_PARTIES, type PoliticalDocument, type PoliticalParty } from "@/lib/schemas";
import { DesignSettings } from "../DesignSettings";
import { FieldArrayList } from "../FieldArrayList";
import { createFields, Grid } from "../fields";
import { PhotoField } from "../PhotoField";
import { SectionCard } from "../SectionCard";

const F = createFields<PoliticalDocument>();
const Card = SectionCard<PoliticalDocument>;

const LEVEL_OPTIONS = [
  { value: "", label: "—" },
  ...COMMITTEE_LEVELS.map((l) => ({
    value: l,
    label: { central: "Central", division: "Division", district: "District / Metro", upazila: "Upazila / Thana", union: "Union / Pourashava", ward: "Ward" }[l],
  })),
];
const RESULT_OPTIONS = [
  { value: "", label: "—" },
  ...ELECTION_RESULTS.map((r) => ({ value: r, label: { won: "Won", lost: "Lost", withdrew: "Withdrew" }[r] })),
];
const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(" · ");

/** Party cards. Picking one applies its colour unless the user has chosen their own. */
function PartyPicker() {
  const { setValue, getValues } = useFormContext<PoliticalDocument>();
  const party = useWatch<PoliticalDocument, "data.party">({ name: "data.party" });
  const pick = (next: PoliticalParty) => {
    const automatic = isPartyAccent(getValues());
    setValue("data.party", next, { shouldDirty: true });
    if (automatic) {
      setValue("settings.accentColor", PARTIES[next].colors.primary, { shouldDirty: true });
    }
  };
  return (
    <div className="rounded-lg border border-zinc-200 bg-surface p-3 shadow-xs">
      <p className="mb-2 text-xs font-medium text-zinc-700">Party</p>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-zinc-100 p-1 sm:grid-cols-4" role="radiogroup" aria-label="Party">
        {POLITICAL_PARTIES.map((p) => {
          const info = PARTIES[p];
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={party === p}
              onClick={() => pick(p)}
              className={`rounded px-2 py-1.5 text-left transition ${party === p ? "bg-surface shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: info.colors.primary }} />
                {info.short}
              </span>
              <span className="block text-[11px] text-zinc-500">{info.symbol ? `${info.symbol.en} · ${info.symbol.bn}` : "Type the party name below"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgeHint() {
  const dob = useWatch<PoliticalDocument, "data.personal.dateOfBirth">({ name: "data.personal.dateOfBirth" });
  const age = ageInYears(dob);
  return <>{age !== null ? `Age: ${age} years (calculated automatically)` : "Age is calculated automatically."}</>;
}

export function PoliticalForm() {
  const party = useWatch<PoliticalDocument, "data.party">({ name: "data.party" });
  return (
    <div className="space-y-4">
      <PartyPicker />
      <DesignSettings
        extra={
          <F.Select
            name="settings.labelLanguage"
            label="Headings & labels"
            options={[
              { value: "bn", label: "বাংলা (Bangla)" },
              { value: "en", label: "English" },
            ]}
            hint="Your own text is printed exactly as you type it, in any language."
          />
        }
      />

      <Card title="Party & logo" description="The party's official logo is printed in the header; upload one to replace it.">
        <F.Text
          name="data.partyName"
          label={party === "other" ? "Party name" : "Party name (optional)"}
          hint={party === "other" ? "Printed in the header, e.g. “Independent candidate”." : `Leave empty to print “${PARTIES[party].name.bn}”.`}
        />
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-700">Party logo (optional)</p>
          <PhotoField<PoliticalDocument> name="data.partyLogo" defaultAspect="square" />
        </div>
      </Card>

      <Card title="Photo" toggleName="sections.photo">
        <PhotoField<PoliticalDocument> name="data.photo" defaultAspect="passport" />
      </Card>

      <Card title="Personal information" toggleName="sections.personal">
        <Grid>
          <F.Text name="data.personal.fullName" label="Full name *" autoComplete="name" />
          <F.Text name="data.personal.fathersName" label="Father's name" />
          <F.Text name="data.personal.mothersName" label="Mother's name" />
          <F.Text name="data.personal.spouseName" label="Spouse's name" />
          <F.IsoDate name="data.personal.dateOfBirth" label="Date of birth" hint={<AgeHint />} />
          <F.Text name="data.personal.religion" label="Religion" />
          <F.Text name="data.personal.nid" label="NID number" />
        </Grid>
      </Card>

      <Card title="Contact" toggleName="sections.contact">
        <Grid>
          <F.Text name="data.contact.presentAddress" label="Present address" className="sm:col-span-2" />
          <F.Text name="data.contact.permanentAddress" label="Permanent address" className="sm:col-span-2" />
          <F.Text name="data.contact.phone" label="Mobile" type="tel" autoComplete="tel" />
          <F.Text name="data.contact.email" label="Email" type="email" autoComplete="email" />
          <F.Text name="data.contact.facebook" label="Facebook page" placeholder="facebook.com/your.page" />
        </Grid>
      </Card>

      <Card title="Party position" description="Your current post in the party." toggleName="sections.partyRole">
        <Grid>
          <F.Text name="data.partyRole.position" label="Current position" placeholder="Joint Secretary" />
          <F.Text name="data.partyRole.committee" label="Committee / unit" placeholder="Dhaka District" />
          <F.Text name="data.partyRole.memberSince" label="Member since (year)" placeholder="1995" />
          <F.Text name="data.partyRole.membershipNo" label="Membership no." />
        </Grid>
      </Card>

      <Card title="Nomination sought" description="The election and seat you are applying for." toggleName="sections.nomination">
        <Grid>
          <F.Text name="data.nomination.election" label="Election" placeholder="13th National Parliament Election" />
          <F.Text name="data.nomination.constituency" label="Constituency" placeholder="Dhaka-10" />
          <F.Text name="data.nomination.area" label="Area" placeholder="Upazilas / wards covered" className="sm:col-span-2" />
        </Grid>
      </Card>

      <Card title="Political career" description="Positions held in the party and its wings." toggleName="sections.positions">
        <FieldArrayList<PoliticalDocument, "data.positions">
          name="data.positions"
          create={newPoliticalPosition}
          addLabel="Add position"
          titleOf={(p) => join(p?.position, p?.organization) || "New position"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Position *" placeholder="General Secretary" />
                <F.Text name={`${p}.organization`} label="Organisation / committee *" placeholder="Youth wing, Dhaka District" />
                <F.Select name={`${p}.level`} label="Level" options={LEVEL_OPTIONS} />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Period" />
            </>
          )}
        />
      </Card>

      <Card title="Electoral experience" description="Elections you have contested." toggleName="sections.elections">
        <FieldArrayList<PoliticalDocument, "data.elections">
          name="data.elections"
          create={newPoliticalElection}
          addLabel="Add election"
          titleOf={(e) => join(e?.election, e?.year) || "New election"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.election`} label="Election *" placeholder="Upazila Parishad Election" />
              <F.Text name={`${p}.post`} label="Post" placeholder="Chairman" />
              <F.Text name={`${p}.constituency`} label="Constituency / area" />
              <F.Text name={`${p}.year`} label="Year" placeholder="2014" />
              <F.Select name={`${p}.result`} label="Result" options={RESULT_OPTIONS} />
              <F.Text name={`${p}.votes`} label="Votes received" />
            </Grid>
          )}
        />
      </Card>

      <Card title="Role in movements" toggleName="sections.movements">
        <FieldArrayList<PoliticalDocument, "data.movements">
          name="data.movements"
          create={newMovement}
          addLabel="Add movement"
          titleOf={(m) => m?.title || "New movement"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.title`} label="Movement *" />
                <F.Text name={`${p}.year`} label="Year(s)" placeholder="1990 or 2013–2014" />
              </Grid>
              <F.TextArea name={`${p}.description`} label="Your role" rows={2} />
            </>
          )}
        />
      </Card>

      <Card title="Political cases & imprisonment" description="Optional — only printed if you add entries." toggleName="sections.cases">
        <FieldArrayList<PoliticalDocument, "data.cases">
          name="data.cases"
          create={newPoliticalCase}
          addLabel="Add case"
          titleOf={(c) => c?.description || "New case"}
          renderItem={(p) => (
            <Grid>
              <F.Text name={`${p}.description`} label="Case / detention *" className="sm:col-span-2" />
              <F.Text name={`${p}.year`} label="Year" />
              <F.Text name={`${p}.status`} label="Status" placeholder="Acquitted, pending…" />
            </Grid>
          )}
        />
      </Card>

      <Card title="Education" toggleName="sections.education">
        <FieldArrayList<PoliticalDocument, "data.education">
          name="data.education"
          create={newBiodataEducation}
          addLabel="Add education"
          titleOf={(e) => join(e?.degree, e?.institution) || "New education"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.degree`} label="Exam / degree *" placeholder="HSC, BA, MSS" />
                <F.Text name={`${p}.fieldOfStudy`} label="Group / subject" />
                <F.Text name={`${p}.institution`} label="Institution *" />
                <F.Text name={`${p}.board`} label="Board / university" />
                <F.Text name={`${p}.result`} label="Result" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Years" presentLabel="Studying" />
            </>
          )}
        />
      </Card>

      <Card title="Profession" toggleName="sections.occupation">
        <FieldArrayList<PoliticalDocument, "data.occupation">
          name="data.occupation"
          create={newExperience}
          addLabel="Add profession"
          titleOf={(o) => join(o?.position, o?.organization) || "New profession"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.position`} label="Position *" placeholder="Proprietor, Advocate, Lecturer" />
                <F.Text name={`${p}.organization`} label="Organisation *" />
                <F.Text name={`${p}.location`} label="Location" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Dates" />
              <F.Lines name={`${p}.bullets`} label="Details (optional)" rows={2} />
            </>
          )}
        />
      </Card>

      <Card title="Social work" toggleName="sections.socialWork">
        <FieldArrayList<PoliticalDocument, "data.socialWork">
          name="data.socialWork"
          create={newSocialWork}
          addLabel="Add social work"
          titleOf={(s) => join(s?.role, s?.organization) || "New entry"}
          renderItem={(p) => (
            <>
              <Grid>
                <F.Text name={`${p}.role`} label="Role *" placeholder="President" />
                <F.Text name={`${p}.organization`} label="Organisation *" placeholder="School managing committee" />
              </Grid>
              <F.DateRange name={`${p}.period`} label="Period" />
            </>
          )}
        />
      </Card>

      <Card title="Declaration" toggleName="sections.declaration">
        <F.TextArea name="data.declaration.text" rows={3} />
        <Grid>
          <F.Text name="data.declaration.place" label="Place" />
          <F.IsoDate name="data.declaration.date" label="Date" />
        </Grid>
      </Card>
    </div>
  );
}
