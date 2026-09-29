import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { prepareAcademic, prepareBiodata, prepareEuropass, prepareProfessional } from "@/lib/documents/prepare";
import type { AnyDocument, DocumentType } from "@/lib/schemas";
import { AcademicBanner } from "./academic/Banner";
import { AcademicClassic } from "./academic/Classic";
import { AcademicCompact } from "./academic/Compact";
import { AcademicMinimal } from "./academic/Minimal";
import { AcademicModern } from "./academic/Modern";
import { AcademicSidebar } from "./academic/Sidebar";
import { AcademicTimeline } from "./academic/Timeline";
import { BiodataBordered } from "./biodata/Bordered";
import { BiodataClassic } from "./biodata/Classic";
import { BiodataElegant } from "./biodata/Elegant";
import { BiodataHeritage } from "./biodata/Heritage";
import { BiodataMinimal } from "./biodata/Minimal";
import { BiodataModern } from "./biodata/Modern";
import { BiodataSidebar } from "./biodata/Sidebar";
import { TEMPLATE_CATALOG } from "./catalog";
import { EuropassClassic } from "./europass/Classic";
import { EuropassMinimal } from "./europass/Minimal";
import { EuropassModern } from "./europass/Modern";
import { Banner } from "./professional/Banner";
import { Classic } from "./professional/Classic";
import { Compact } from "./professional/Compact";
import { Engineering } from "./professional/Engineering";
import { Executive } from "./professional/Executive";
import { Minimal } from "./professional/Minimal";
import { Modern } from "./professional/Modern";
import { Sidebar } from "./professional/Sidebar";
import { BoldPills } from "./professional/photo/BoldPills";
import { Diagonal } from "./professional/photo/Diagonal";
import { Geometric } from "./professional/photo/Geometric";
import { GrayColumn } from "./professional/photo/GrayColumn";
import { NavyHeader } from "./professional/photo/NavyHeader";
import { NavySidebar } from "./professional/photo/NavySidebar";
import { PastelSplit } from "./professional/photo/PastelSplit";
import { PhotoHeader } from "./professional/photo/PhotoHeader";
import { SoftPanel } from "./professional/photo/SoftPanel";
import { Timeline } from "./professional/Timeline";
import { TwoColumn } from "./professional/TwoColumn";
import type { TemplateComponent } from "./types";

/**
 * Template components by id. To add a template: write the component, add it here,
 * and add its metadata to `catalog.ts`.
 */
const COMPONENTS: { [T in DocumentType]: Record<string, TemplateComponent<T>> } = {
  professional: {
    classic: Classic,
    modern: Modern,
    minimal: Minimal,
    timeline: Timeline,
    executive: Executive,
    compact: Compact,
    banner: Banner,
    engineering: Engineering,
    sidebar: Sidebar,
    "two-column": TwoColumn,
    "navy-sidebar": NavySidebar,
    "pastel-split": PastelSplit,
    "gray-column": GrayColumn,
    geometric: Geometric,
    "photo-header": PhotoHeader,
    diagonal: Diagonal,
    "soft-panel": SoftPanel,
    "navy-header": NavyHeader,
    "bold-pills": BoldPills,
  },
  europass: { classic: EuropassClassic, modern: EuropassModern, minimal: EuropassMinimal },
  biodata: { classic: BiodataClassic, modern: BiodataModern, elegant: BiodataElegant, minimal: BiodataMinimal, bordered: BiodataBordered, sidebar: BiodataSidebar, heritage: BiodataHeritage },
  academic: { classic: AcademicClassic, modern: AcademicModern, timeline: AcademicTimeline, minimal: AcademicMinimal, banner: AcademicBanner, compact: AcademicCompact, sidebar: AcademicSidebar },
};

export const TEMPLATES = TEMPLATE_CATALOG;

function component<T extends DocumentType>(type: T, id: string): TemplateComponent<T> {
  const byId = COMPONENTS[type];
  // Own keys only: an imported id such as "constructor" must fall back too, not hit Object.prototype.
  return Object.hasOwn(byId, id) ? byId[id] : byId[TEMPLATE_CATALOG[type][0].id];
}

/**
 * Prepared data + chosen template → the react-pdf <Document> element. Templates are plain functions
 * (no hooks), so they are called directly and the result is the <Document> itself.
 */
export function renderDocument(doc: AnyDocument): ReactElement<DocumentProps> {
  switch (doc.type) {
    case "professional":
      return component("professional", doc.settings.templateId)({ doc: prepareProfessional(doc) });
    case "europass":
      return component("europass", doc.settings.templateId)({ doc: prepareEuropass(doc) });
    case "biodata":
      return component("biodata", doc.settings.templateId)({ doc: prepareBiodata(doc) });
    case "academic":
      return component("academic", doc.settings.templateId)({ doc: prepareAcademic(doc) });
  }
}
