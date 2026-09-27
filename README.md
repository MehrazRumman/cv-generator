# CV Generator

Build a **Professional CV**, a South Asian **Biodata** (marriage or job) or an **Academic CV** in the browser: fill in a form, watch the PDF update live, and download it. Text in the PDF is real, selectable text (ATS-readable), and Bangla (বাংলা) renders correctly.

![Professional CV editor](docs/screenshots/professional-editor.png)

| Biodata in Bangla | Academic CV |
| --- | --- |
| ![Biodata](docs/screenshots/biodata-bangla.png) | ![Academic](docs/screenshots/academic-editor.png) |

## Features

- **Three document types**, each with its own form and sample data: Professional CV (7 templates), Biodata (4 templates, marriage/job mode, English or Bangla headings) and Academic CV (4 templates, APA 7 or IEEE citations, your name bolded automatically in author lists).
- **Live preview.** The PDF is re-rendered about 0.4 s after you stop typing and shown with pdf.js (it works on phones too). On mobile, Form and Preview are tabs.
- **Repeatable sections.** Add, remove and reorder entries by dragging or with the ↑/↓ buttons.
- **Section switches.** Any section can be hidden, and empty sections are never printed.
- **Switch template, font, paper size (A4 / US Letter) or accent colour** without re-entering anything.
- **Photo upload with cropping** to square or passport (35×45 mm) size.
- **Validation** with clear messages, e.g. a required name or an invalid email. Download is blocked until the fields shown in red are fixed. Errors in hidden sections are ignored.
- **Nothing leaves your browser.** Autosave goes to `localStorage`, and there is **Export/Import as JSON**.
- **Downloads are named** `Name_DocType_YYYY-MM-DD.pdf`, e.g. `Ayesha_Rahman_CV_2026-09-28.pdf`.

## Running it

Requires Node.js 20+.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev server / production build / serve the build |
| `npm test` | Unit tests (Vitest): date and citation formatting, file names, schemas, empty-section rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run render-samples [type]` | Renders every template with its sample data to `sample-output/*.pdf` (a quick visual check, no browser needed) |

`predev` / `prebuild` copy the pdf.js worker into `public/pdf.worker.min.mjs`. That file is generated, so it isn't committed.

## How it's organised

```
app/                        Home page and /editor/[type] (the editor runs client-side only)
components/
  editor/Editor.tsx         Toolbar, autosave, download, import/export, mobile tabs
  forms/                    Typed field components, SectionCard, SortableList, PhotoField
  forms/{professional,biodata,academic}/   One form per document type
  preview/PdfPreview.tsx    Debounced render → pdf.js canvases
lib/
  schemas/                  Zod schemas + TypeScript types (shared pieces in common.ts)
  documents/                Empty documents, entry factories, prepare.ts (visibility rules), validation
  format/                   Dates, citations (APA/IEEE), file names
  pdf/                      Font registration, PDF generation
  storage/                  DocumentRepository interface, localStorage implementation, JSON import/export, migrations
  sample-data/              "Load sample" documents
templates/
  catalog.ts                Template names, descriptions and default colours (no react-pdf imports)
  registry.ts               Template id → component; renderDocument()
  shared/                   Kit: Section, Entry, Bullets, Rich text, PdfDocument
  {professional,biodata,academic}/   The templates and each type's section renderers (blocks.tsx)
public/fonts/               TTF fonts (OFL, see LICENSE.md)
```

**Data model.** Every document has the same outer shape: `{ schemaVersion, type, settings, sections, data, updatedAt }`. `data` is the content, `settings` is presentation (template, paper, fonts, colour) and `sections` holds the on/off switches. Each schema is built twice from one definition ([lib/schemas/rules.ts](lib/schemas/rules.ts)):
- **Strict** is what the form enforces before download.
- **Draft** checks only the structure, so a half-finished document in `localStorage`, or an imported file, always loads.

**Templates only receive data.** [`prepare*()`](lib/documents/prepare.ts) removes empty entries and blank lines, and computes `show[section]`: switched on, allowed by the biodata mode, and non-empty. Templates render what they are given and never read the form.

**Adding a backend later.** Only [lib/storage/index.ts](lib/storage/index.ts) decides where documents live. Implement `DocumentRepository` (`load`, `save`, `remove`), for example with `fetch('/api/documents/…')`, and swap it in there.

## Adding a new template

1. **Create the component** in `templates/<type>/`, for example `templates/professional/Elegant.tsx`. It receives `{ doc }`, the prepared document, and returns a react-pdf `<Document>` via `PdfDocument`. The easiest start is to copy a similar template: define a `Kit` (styles, a `Heading` component, entry layout) and call the type's shared renderer:

   ```tsx
   export function Elegant({ doc }: { doc: PreparedProfessional }) {
     const kit: Kit = { s: baseKitStyles(palette, 10, { /* overrides */ }), Heading: ({ title }) => <Text>{title}</Text>, bulletChar: "•", entryLayout: "stacked", dateColumnWidth: 0 };
     return (
       <PdfDocument title={…} author={…} settings={doc.settings} pageStyle={{ padding: 40 }}>
         {/* your header */}
         {renderSections(kit, doc)}
       </PdfDocument>
     );
   }
   ```

   Biodata templates build a `BioKit` and call `renderBiodataSections`. Academic templates call `renderAcademicSections`.
2. **Register it** in [templates/registry.ts](templates/registry.ts) (`COMPONENTS[type][id]`).
3. **Describe it** in [templates/catalog.ts](templates/catalog.ts) with an id, name, description, `atsFriendly`, a default `accent` and optionally `inspiredBy`. It then appears in the template picker.
4. Run `npm run render-samples <type>` and check `sample-output/<type>-<id>.pdf`.

Rules that keep page breaks clean (see the comments in [templates/shared/kit.tsx](templates/shared/kit.tsx)):
- Render sections as **fragments, not wrapping `<View>`s**. react-pdf mis-paginates when an unbreakable block is the first child of a nested breakable view: it keeps the block on the page and squashes the text.
- Use `<Section>` and `<Entry>`. They keep each heading together with its first entry, and each entry head together with its first bullet.
- Don't use `letterSpacing` on Bangla text; it detaches vowel signs. The biodata templates use `tracking()` for this.

## Bangla support: a note on fonts

The spec asked for **Noto Sans Bengali**, but react-pdf's shaping engine (fontkit) renders many of its conjuncts wrongly (জন্ম, স্ত্রী, বিশ্ববিদ্যালয়, reph forms). This happens with both the Google Fonts and the upstream notofonts builds. The app therefore uses fonts that shape correctly under react-pdf:
- **Hind Siliguri** (sans), the default
- **Noto Serif Bengali** (serif)

Every template uses the font stack `[English font, Bangla font]`, so mixed Bangla and English text in any field renders with the right glyphs. Tiro Bangla was also tested but excluded, because it crashes the renderer.

## Template credits

The layouts are original react-pdf implementations, modelled on the look of these open-source CV designs:

| Template | Modelled on |
| --- | --- |
| Professional — Classic | [Jake's Resume](https://github.com/jakegut/resume) (MIT) |
| Professional / Academic — Modern | [Awesome-CV](https://github.com/posquit0/Awesome-CV) (LPPL 1.3c) |
| Professional / Academic — Timeline | [moderncv](https://github.com/moderncv/moderncv) "classic" style (LPPL) |
| Professional — Compact | [sb2nov/resume](https://github.com/sb2nov/resume) (MIT) |
| Professional — Sidebar | [AltaCV](https://github.com/liantze/AltaCV) (LPPL) / [Deedy-Resume](https://github.com/deedy/Deedy-Resume) (Apache-2.0) |
| Professional / Academic — Minimal | [JSON Resume](https://jsonresume.org/themes/) minimalist themes (MIT) |
| Professional — Executive, Academic — Classic | Harvard Office of Career Services résumé / CV guides |

Fonts are licensed under the SIL Open Font License; see [public/fonts/LICENSE.md](public/fonts/LICENSE.md).
