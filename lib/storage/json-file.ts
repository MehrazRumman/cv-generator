import { buildFileName } from "@/lib/format/filename";
import type { AnyDocument } from "@/lib/schemas";
import { parseAnyDocument, type ParseResult } from "./migrate";

/** Triggers a browser download for a Blob. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function documentOwnerName(doc: AnyDocument): string {
  return doc.type === "biodata" ? doc.data.personal.fullName : doc.data.header.fullName;
}

export function exportDocumentJson(doc: AnyDocument): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  downloadBlob(blob, buildFileName(documentOwnerName(doc), doc.type, "json"));
}

export async function importDocumentJson(file: File): Promise<ParseResult<AnyDocument>> {
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  return parseAnyDocument(raw);
}
