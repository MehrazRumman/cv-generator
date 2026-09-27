import type { DocumentOf, DocumentType } from "@/lib/schemas";
import { sampleAcademic } from "./academic";
import { sampleBiodataJob, sampleBiodataMarriage } from "./biodata";
import { sampleProfessional } from "./professional";

export interface SampleVariant<T extends DocumentType> {
  label: string;
  create: () => DocumentOf<T>;
}

/** "Load sample" options per type; the first is also used by scripts/render-samples.tsx. */
export const SAMPLE_VARIANTS: { [T in DocumentType]: SampleVariant<T>[] } = {
  professional: [{ label: "Software engineer", create: sampleProfessional }],
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
};

export const SAMPLE_DATA: { [T in DocumentType]: () => DocumentOf<T> } = {
  professional: SAMPLE_VARIANTS.professional[0].create,
  biodata: SAMPLE_VARIANTS.biodata[0].create,
  academic: SAMPLE_VARIANTS.academic[0].create,
};
