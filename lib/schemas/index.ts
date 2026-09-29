import { z } from "zod";
import { academicDraftSchema, academicSchema } from "./academic";
import { biodataDraftSchema, biodataSchema } from "./biodata";
import type { DocumentType } from "./common";
import { europassDraftSchema, europassSchema } from "./europass";
import { politicalDraftSchema, politicalSchema } from "./political";
import { professionalDraftSchema, professionalSchema } from "./professional";

export * from "./common";
export * from "./professional";
export * from "./biodata";
export * from "./academic";
export * from "./europass";
export * from "./political";

/** Strict schemas: form validation before download. */
export const documentSchemas = {
  professional: professionalSchema,
  europass: europassSchema,
  biodata: biodataSchema,
  academic: academicSchema,
  political: politicalSchema,
} as const satisfies Record<DocumentType, z.ZodType>;

/** Draft schemas: structural check for localStorage loads and JSON import. */
export const draftSchemas = {
  professional: professionalDraftSchema,
  europass: europassDraftSchema,
  biodata: biodataDraftSchema,
  academic: academicDraftSchema,
  political: politicalDraftSchema,
} as const satisfies Record<DocumentType, z.ZodType>;

/** Discriminated on `type`, so an imported file tells us which editor it belongs to. */
export const anyDraftDocumentSchema = z.discriminatedUnion("type", [
  professionalDraftSchema,
  europassDraftSchema,
  biodataDraftSchema,
  academicDraftSchema,
  politicalDraftSchema,
]);

export type AnyDocument = z.infer<typeof anyDraftDocumentSchema>;
export type DocumentOf<T extends DocumentType> = Extract<AnyDocument, { type: T }>;
