import type { DocumentOf, DocumentType } from "@/lib/schemas";
import { parseDocument } from "./migrate";
import type { DocumentRepository } from "./repository";

const key = (type: DocumentType) => `cv-generator:document:${type}`;

/** Browser-only persistence: one JSON blob per document type. */
export class LocalStorageRepository implements DocumentRepository {
  async load<T extends DocumentType>(type: T): Promise<DocumentOf<T> | null> {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key(type));
    } catch {
      return null; // storage disabled (private mode, blocked site data)
    }
    if (!raw) return null;
    try {
      const parsed = parseDocument(type, JSON.parse(raw));
      if (parsed.ok) return parsed.doc;
      console.warn(`Ignoring saved ${type} document: ${parsed.error}`);
    } catch {
      console.warn(`Ignoring saved ${type} document: invalid JSON`);
    }
    return null;
  }

  async save<T extends DocumentType>(doc: DocumentOf<T>): Promise<void> {
    try {
      window.localStorage.setItem(key(doc.type), JSON.stringify(doc));
    } catch (e) {
      // Usually QuotaExceededError from a very large photo.
      throw new Error("Couldn't save to this browser's storage (it may be full). Export your data as JSON to keep it.", {
        cause: e,
      });
    }
  }

  async remove(type: DocumentType): Promise<void> {
    try {
      window.localStorage.removeItem(key(type));
    } catch {
      /* nothing to remove */
    }
  }
}
