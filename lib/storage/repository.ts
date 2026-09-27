import type { DocumentOf, DocumentType } from "@/lib/schemas";

/**
 * Where documents live. The app only talks to this interface, so swapping localStorage for an API
 * (e.g. `ApiDocumentRepository` calling `/api/documents/:type`) is a one-file change in `lib/storage/index.ts`.
 */
export interface DocumentRepository {
  load<T extends DocumentType>(type: T): Promise<DocumentOf<T> | null>;
  save<T extends DocumentType>(doc: DocumentOf<T>): Promise<void>;
  remove(type: DocumentType): Promise<void>;
}
