import { LocalStorageRepository } from "./local-storage";
import type { DocumentRepository } from "./repository";

export type { DocumentRepository } from "./repository";
export { parseAnyDocument, parseDocument } from "./migrate";
export { downloadBlob, exportDocumentJson, importDocumentJson, documentOwnerName } from "./json-file";

/** The single place that decides where documents are stored. Swap for an API-backed repository later. */
export const repository: DocumentRepository = new LocalStorageRepository();
