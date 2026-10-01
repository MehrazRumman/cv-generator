import type { DocumentOf, DocumentType } from "@/lib/schemas";
import { sampleAcademic } from "./academic";
import { sampleBiodataJob, sampleBiodataMarriage } from "./biodata";
import { sampleEuropass } from "./europass";
import { samplePoliticalAwamiLeague, samplePoliticalBnp, samplePoliticalJamaat, samplePoliticalNcp } from "./political";
import { sampleProfessional } from "./professional";

export interface SampleVariant<T extends DocumentType> {
  label: string;
  create: () => DocumentOf<T>;
}

/** "Load sample" options per type; the first is also used by scripts/render-samples.tsx. */
export const SAMPLE_VARIANTS: { [T in DocumentType]: SampleVariant<T>[] } = {
  professional: [{ label: "Software engineer", create: sampleProfessional }],
  europass: [{ label: "Data analyst", create: sampleEuropass }],
  biodata: [
    { label: "Marriage biodata (বাংলা)", create: sampleBiodataMarriage },
    { label: "Job biodata (English)", create: sampleBiodataJob },
  ],
  academic: [
    { label: "Assistant professor (APA)", create: sampleAcademic },
    {
      label: "Assistant professor (IEEE)",
      create: () => {
        const doc = sampleAcademic();
        return { ...doc, settings: { ...doc.settings, citationStyle: "ieee" } };
      },
    },
  ],
  // One per party, in the order of the party picker. render-samples pairs them with the templates.
  political: [
    { label: "BNP candidate (বাংলা)", create: samplePoliticalBnp },
    { label: "Awami League candidate (বাংলা)", create: samplePoliticalAwamiLeague },
    { label: "Jamaat candidate (বাংলা)", create: samplePoliticalJamaat },
    { label: "NCP candidate (বাংলা)", create: samplePoliticalNcp },
  ],
};

export const SAMPLE_DATA: { [T in DocumentType]: () => DocumentOf<T> } = {
  professional: SAMPLE_VARIANTS.professional[0].create,
  europass: SAMPLE_VARIANTS.europass[0].create,
  biodata: SAMPLE_VARIANTS.biodata[0].create,
  academic: SAMPLE_VARIANTS.academic[0].create,
  political: SAMPLE_VARIANTS.political[0].create,
};
