import type { DocumentType } from "@/lib/schemas";
import { todayIso } from "./dates";

const DOC_TYPE_LABEL: Record<DocumentType, string> = {
  professional: "CV",
  europass: "Europass_CV",
  biodata: "Biodata",
  academic: "Academic_CV",
};

/** `Name_DocType_YYYY-MM-DD.ext` — keeps Unicode letters (Bangla names work), drops unsafe characters. */
export function buildFileName(fullName: string, type: DocumentType, ext: "pdf" | "json", now: Date = new Date()): string {
  const name =
    fullName
      .normalize("NFC")
      .replace(/[\\/:*?"<>|#%&{}$!'@`+=]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/\.+$/, "") || "Untitled";
  return `${name}_${DOC_TYPE_LABEL[type]}_${todayIso(now)}.${ext}`;
}
