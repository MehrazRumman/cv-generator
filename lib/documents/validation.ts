import type { FieldErrors, Resolver } from "react-hook-form";
import { BIODATA_MODE_SECTIONS, documentSchemas, type AnyDocument } from "@/lib/schemas";

/** Is `data.<key>` hidden from the PDF (section switched off or not part of the biodata mode)? */
function isHiddenSection(doc: AnyDocument, key: string): boolean {
  const sections: Record<string, boolean> = doc.sections;
  if (key in sections && sections[key] === false) return true;
  if (doc.type === "biodata" && key in sections) {
    return !(BIODATA_MODE_SECTIONS[doc.data.mode] as readonly string[]).includes(key);
  }
  if (doc.type === "professional" && key === "references") return doc.data.references.mode === "on-request";
  return false;
}

type ErrorTree = { [key: string]: ErrorTree | { type: string; message: string } };

function setError(tree: ErrorTree, path: PropertyKey[], error: { type: string; message: string }) {
  let node: ErrorTree = tree;
  path.forEach((segment, i) => {
    const key = String(segment);
    if (i === path.length - 1) {
      if (!(key in node)) node[key] = error; // keep the first message per field
      return;
    }
    const next = node[key];
    if (!next || "message" in next) node[key] = {};
    node = node[key] as ErrorTree;
  });
}

/**
 * Strict validation for the form (react-hook-form resolver). Errors inside sections that won't be
 * printed are ignored, so a half-filled hidden section never blocks the download.
 * The raw values are returned on success (not the parsed/trimmed ones) so typing isn't disturbed.
 */
export const documentResolver: Resolver<AnyDocument> = async (values) => {
  const result = documentSchemas[values.type].safeParse(values);
  if (result.success) return { values, errors: {} };
  const tree: ErrorTree = {};
  for (const issue of result.error.issues) {
    if (issue.path[0] === "data" && typeof issue.path[1] === "string" && isHiddenSection(values, issue.path[1])) continue;
    setError(tree, issue.path, { type: issue.code, message: issue.message });
  }
  if (Object.keys(tree).length === 0) return { values, errors: {} };
  // ErrorTree mirrors RHF's nested FieldErrors shape; TS can't relate the two structurally.
  return { values: {}, errors: tree as unknown as FieldErrors<AnyDocument> };
};
