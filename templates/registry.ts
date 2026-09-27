import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { prepareAcademic, prepareBiodata, prepareProfessional } from "@/lib/documents/prepare";
import type { AnyDocument, DocumentType } from "@/lib/schemas";
import { AcademicClassic } from "./academic/Classic";
import { AcademicMinimal } from "./academic/Minimal";
import { AcademicModern } from "./academic/Modern";
import { AcademicTimeline } from "./academic/Timeline";
import { BiodataBordered } from "./biodata/Bordered";
import { BiodataClassic } from "./biodata/Classic";
import { BiodataElegant } from "./biodata/Elegant";
import { BiodataHeritage } from "./biodata/Heritage";
import { BiodataMinimal } from "./biodata/Minimal";
import { BiodataModern } from "./biodata/Modern";
import { BiodataSidebar } from "./biodata/Sidebar";
import { TEMPLATE_CATALOG } from "./catalog";
import { Banner } from "./professional/Banner";
import { Classic } from "./professional/Classic";
import { Compact } from "./professional/Compact";
import { Engineering } from "./professional/Engineering";
import { Executive } from "./professional/Executive";
import { Minimal } from "./professional/Minimal";
import { Modern } from "./professional/Modern";
import { Sidebar } from "./professional/Sidebar";
import { Timeline } from "./professional/Timeline";
import { TwoColumn } from "./professional/TwoColumn";
import type { TemplateComponent } from "./types";

/**
 * Template components by id. To add a template: write the component, add it here,
 * and add its metadata to `catalog.ts`.
 */
const COMPONENTS: { [T in DocumentType]: Record<string, TemplateComponent<T>> } = {
  professional: { classic: Classic, modern: Modern, minimal: Minimal, timeline: Timeline, executive: Executive, compact: Compact, banner: Banner, engineering: Engineering, sidebar: Sidebar, "two-column": TwoColumn },
  biodata: { classic: BiodataClassic, modern: BiodataModern, elegant: BiodataElegant, minimal: BiodataMinimal, bordered: BiodataBordered, sidebar: BiodataSidebar, heritage: BiodataHeritage },
  academic: { classic: AcademicClassic, modern: AcademicModern, timeline: AcademicTimeline, minimal: AcademicMinimal },
};

export const TEMPLATES = TEMPLATE_CATALOG;

function component<T extends DocumentType>(type: T, id: string): TemplateComponent<T> {
  const byId = COMPONENTS[type];
  return byId[id] ?? byId[TEMPLATE_CATALOG[type][0].id];
}

/**
 * Prepared data + chosen template → the react-pdf <Document> element. Templates are plain functions
 * (no hooks), so they are called directly and the result is the <Document> itself.
 */
export function renderDocument(doc: AnyDocument): ReactElement<DocumentProps> {
  switch (doc.type) {
    case "professional":
      return component("professional", doc.settings.templateId)({ doc: prepareProfessional(doc) });
    case "biodata":
      return component("biodata", doc.settings.templateId)({ doc: prepareBiodata(doc) });
    case "academic":
      return component("academic", doc.settings.templateId)({ doc: prepareAcademic(doc) });
  }
}
