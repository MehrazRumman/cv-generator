import { z } from "zod";
import { anyDraftDocumentSchema, draftSchemas, SCHEMA_VERSION, type AnyDocument, type DocumentOf, type DocumentType } from "@/lib/schemas";

/**
 * Upgrades raw stored/imported JSON to the current schema version.
 * Add a step here whenever SCHEMA_VERSION is bumped: `if (version === 1) raw = v1ToV2(raw)`.
 */
function migrate(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const version = "schemaVersion" in raw ? raw.schemaVersion : undefined;
  if (version === SCHEMA_VERSION) return raw;
  return raw; // v1 is the first version: nothing to upgrade yet.
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
