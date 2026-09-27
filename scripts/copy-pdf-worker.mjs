// Copies the pdf.js worker (used by the on-screen preview) into /public so it is served as a static file.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const src = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "build", "pdf.worker.min.mjs");
mkdirSync("public", { recursive: true });
copyFileSync(src, path.join("public", "pdf.worker.min.mjs"));
console.log("Copied pdf.js worker → public/pdf.worker.min.mjs");
