import { z } from "zod";
import { anyDraftDocumentSchema, draftSchemas, SCHEMA_VERSION, type AnyDocument, type DocumentOf, type DocumentType } from "@/lib/schemas";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** v1 → v2: settings gained `headingFontId` ("same" = use the body font). */
function v1ToV2(raw: Record<string, unknown>): Record<string, unknown> {
  const settings = isRecord(raw.settings) ? { headingFontId: "same", ...raw.settings } : raw.settings;
  return { ...raw, settings, schemaVersion: 2 };
}

/**
 * Upgrades raw stored/imported JSON to the current schema version, one step at a time.
 * When SCHEMA_VERSION is bumped, add the next step here.
 */
export function migrate(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  let doc = raw;
  if (doc.schemaVersion === 1) doc = v1ToV2(doc);
  return doc.schemaVersion === SCHEMA_VERSION ? doc : raw;
}

export type ParseResult<T> = { ok: true; doc: T } | { ok: false; error: string };

function describe(error: z.ZodError): string {
  const first = error.issues.slice(0, 3).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
  return `The file doesn't match the expected format — ${first.join("; ")}${error.issues.length > 3 ? " …" : ""}`;
}

/** Validates any document (structure only — drafts with empty fields are fine). */
export function parseAnyDocument(raw: unknown): ParseResult<AnyDocument> {
  const result = anyDraftDocumentSchema.safeParse(migrate(raw));
  return result.success ? { ok: true, doc: result.data } : { ok: false, error: describe(result.error) };
}

/** Validates a document that must be of `type`. */
export function parseDocument<T extends DocumentType>(type: T, raw: unknown): ParseResult<DocumentOf<T>> {
  const result = draftSchemas[type].safeParse(migrate(raw));
  if (!result.success) return { ok: false, error: describe(result.error) };
  // The draft schema for `type` produces exactly DocumentOf<T>; TS can't narrow the indexed union itself.
  return { ok: true, doc: result.data as DocumentOf<T> };
}
