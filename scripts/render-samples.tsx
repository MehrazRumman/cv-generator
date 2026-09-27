/**
 * Renders every template with its sample data to PDF files — a quick visual regression check.
 *
 *   npm run render-samples             → ./sample-output/*.pdf
 *   npm run render-samples -- academic → only one document type
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderToFile } from "@react-pdf/renderer";
import { registerFonts } from "../lib/pdf/fonts";
import { SAMPLE_VARIANTS } from "../lib/sample-data";
import { DOCUMENT_TYPES, type DocumentType } from "../lib/schemas";
import { TEMPLATE_CATALOG } from "../templates/catalog";
import { renderDocument } from "../templates/registry";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "sample-output");
mkdirSync(outDir, { recursive: true });
registerFonts(path.join(root, "public", "fonts"));

const only = process.argv[2] as DocumentType | undefined;
const types = DOCUMENT_TYPES.filter((t) => !only || t === only);

for (const type of types) {
  // Every template with the first sample, plus the remaining samples with the default template.
  const jobs = [
    ...TEMPLATE_CATALOG[type].map((t) => ({ template: t, variant: 0 })),
    ...SAMPLE_VARIANTS[type].slice(1).map((_, i) => ({ template: TEMPLATE_CATALOG[type][0], variant: i + 1 })),
  ];
  for (const job of jobs) {
    const doc = SAMPLE_VARIANTS[type][job.variant].create();
    // Each template in its own default colour, as the user first sees it.
    doc.settings.templateId = job.template.id;
    doc.settings.accentColor = job.template.accent;
    const file = path.join(outDir, `${type}-${job.template.id}${job.variant ? `-sample${job.variant + 1}` : ""}.pdf`);
    const started = Date.now();
    await renderToFile(renderDocument(doc), file);
    console.log(`✓ ${path.relative(root, file)} (${Date.now() - started} ms)`);
  }
}
