import { pdf } from "@react-pdf/renderer";
import type { AnyDocument } from "@/lib/schemas";
import { renderDocument } from "@/templates/registry";
import { registerFonts } from "./fonts";

let queue: Promise<unknown> = Promise.resolve();

/**
 * Renders a document to a PDF Blob in the browser. Calls are serialised: react-pdf keeps one
 * renderer instance, and overlapping renders can interfere with each other.
 */
export function generatePdf(doc: AnyDocument): Promise<Blob> {
  registerFonts();
  const job = queue.then(() => pdf(renderDocument(doc)).toBlob());
  queue = job.catch(() => undefined);
  return job;
}
