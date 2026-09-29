import type { DocumentType, FontId } from "@/lib/schemas";

/** Template metadata only (no react-pdf imports) — safe to use on the server and in the picker UI. */
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  /** Single column, standard headings, text in reading order. */
  atsFriendly: boolean;
  /** Credit for the open-source design this layout is modelled on. */
  inspiredBy?: string;
  /** Accent colour applied when the user switches to this template. */
  accent: string;
  /** Photo-led design: picking it switches the photo section on (initials are shown without a photo). */
  featuresPhoto?: boolean;
  /** Suggested fonts, applied on selection unless the user has chosen their own. */
  fonts?: { fontId: FontId; headingFontId: FontId | "same" };
}

/** Fonts a template uses when it doesn't suggest its own. */
export const DEFAULT_TEMPLATE_FONTS = { fontId: "inter", headingFontId: "same" } as const;

/** The first entry of each list is the default template. */
export const TEMPLATE_CATALOG: Record<DocumentType, TemplateInfo[]> = {
  professional: [
    {
      id: "classic",
      name: "Classic",
      description: "Black & white, centred header, ruled headings.",
      atsFriendly: true,
      inspiredBy: "Jake's Resume (LaTeX, MIT)",
      accent: "#111111",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Two-tone name and accent headings with a trailing rule.",
      atsFriendly: true,
      inspiredBy: "Awesome-CV (LaTeX, LPPL 1.3c)",
      accent: "#dc3522",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Lots of whitespace, quiet letter-spaced headings.",
      atsFriendly: true,
      inspiredBy: "JSON Resume minimalist themes (MIT)",
      accent: "#2f6f9f",
    },
    {
      id: "timeline",
      name: "Timeline",
      description: "Dates in a left gutter with accent bar headings.",
      atsFriendly: true,
      inspiredBy: "moderncv — classic style (LaTeX, LPPL)",
      accent: "#3873b3",
    },
    {
      id: "executive",
      name: "Executive",
      description: "Small-caps name between rules, centred headings.",
      atsFriendly: true,
      inspiredBy: "Harvard OCS résumé guide",
      accent: "#1f3a5f",
    },
    {
      id: "compact",
      name: "Compact",
      description: "Dense one-pager with tinted heading bands.",
      atsFriendly: true,
      inspiredBy: "sb2nov/resume (LaTeX, MIT)",
      accent: "#0f766e",
    },
    {
      id: "banner",
      name: "Banner",
      description: "Full-width colour header, clean single column.",
      atsFriendly: true,
      inspiredBy: "JSON Resume “flat” theme (MIT)",
      accent: "#1d4ed8",
    },
    {
      id: "engineering",
      name: "Engineering",
      description: "Dense, left-aligned, strictly single column.",
      atsFriendly: true,
      inspiredBy: "RenderCV “engineeringresumes” theme (MIT)",
      accent: "#004f90",
    },
    {
      id: "sidebar",
      name: "Sidebar",
      description: "Two columns: photo, contact and skills in a tinted sidebar.",
      atsFriendly: false,
      inspiredBy: "AltaCV (LaTeX, LPPL)",
      accent: "#7c3aed",
    },
    {
      id: "two-column",
      name: "Two-Column",
      description: "Big two-weight name; education & skills in a narrow column.",
      atsFriendly: false,
      inspiredBy: "Deedy-Resume (LaTeX, Apache-2.0)",
      accent: "#b45309",
    },
    {
      id: "navy-sidebar",
      name: "Navy Sidebar",
      description: "Dark column with round photo and contact icons.",
      atsFriendly: false,
      accent: "#1e3a5f",
      featuresPhoto: true,
      fonts: { fontId: "open-sans", headingFontId: "montserrat" },
    },
    {
      id: "pastel-split",
      name: "Pastel Split",
      description: "Coloured column, pastel name band, photo across both.",
      atsFriendly: false,
      accent: "#5f8f8b",
      featuresPhoto: true,
      fonts: { fontId: "lora", headingFontId: "montserrat" },
    },
    {
      id: "gray-column",
      name: "Gray Column",
      description: "Light column, ringed photo, dotted timeline.",
      atsFriendly: false,
      accent: "#2563a8",
      featuresPhoto: true,
      fonts: { fontId: "lato", headingFontId: "montserrat" },
    },
    {
      id: "geometric",
      name: "Geometric",
      description: "Corner shapes, gold-ringed photo, icon headings.",
      atsFriendly: false,
      accent: "#1b2a4a",
      featuresPhoto: true,
      fonts: { fontId: "nunito-sans", headingFontId: "poppins" },
    },
    {
      id: "photo-header",
      name: "Photo Header",
      description: "Single column with a round photo beside the name.",
      atsFriendly: true,
      accent: "#1d4ed8",
      featuresPhoto: true,
      fonts: { fontId: "inter", headingFontId: "montserrat" },
    },
    {
      id: "diagonal",
      name: "Diagonal",
      description: "Diagonal colour block behind the photo, serif name.",
      atsFriendly: false,
      accent: "#5b7bd5",
      featuresPhoto: true,
      fonts: { fontId: "lato", headingFontId: "playfair" },
    },
    {
      id: "soft-panel",
      name: "Soft Panel",
      description: "Spaced-out name on a soft band, rounded side panel.",
      atsFriendly: false,
      accent: "#475569",
      featuresPhoto: true,
      fonts: { fontId: "open-sans", headingFontId: "raleway" },
    },
    {
      id: "navy-header",
      name: "Navy Header",
      description: "Dark header band, overlapping photo, icon timeline.",
      atsFriendly: false,
      accent: "#1f2a44",
      featuresPhoto: true,
      fonts: { fontId: "roboto", headingFontId: "montserrat" },
    },
    {
      id: "bold-pills",
      name: "Bold Pills",
      description: "Dark column, colour banner, pill headings, level bars.",
      atsFriendly: false,
      accent: "#1e40af",
      featuresPhoto: true,
      fonts: { fontId: "poppins", headingFontId: "same" },
    },
  ],
  europass: [
    {
      id: "classic",
      name: "Classic",
      description: "Labels and dates in a left column, ruled headings.",
      atsFriendly: true,
      inspiredBy: "The traditional Europass CV layout",
      accent: "#1c6ea4",
      fonts: { fontId: "open-sans", headingFontId: "same" },
    },
    {
      id: "modern",
      name: "Modern",
      description: "Photo beside the name, bold headings over a full rule.",
      atsFriendly: true,
      inspiredBy: "The current Europass online CV editor",
      accent: "#0b4f9c",
      fonts: { fontId: "open-sans", headingFontId: "same" },
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Quiet single column that prints well in black and white.",
      atsFriendly: true,
      accent: "#333333",
      fonts: { fontId: "source-sans", headingFontId: "same" },
    },
  ],
  biodata: [
    {
      id: "classic",
      name: "Classic",
      description: "Centred title, heading bands, ruled tables.",
      atsFriendly: true,
      accent: "#7a1f3d",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Colour header band, photo inset, two-column details.",
      atsFriendly: true,
      accent: "#0f5e8c",
    },
    {
      id: "elegant",
      name: "Elegant",
      description: "Double-ruled frame and centred headings.",
      atsFriendly: true,
      accent: "#8a5a1c",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Hairline rules, grey labels — prints well in B&W.",
      atsFriendly: true,
      accent: "#333333",
    },
    {
      id: "bordered",
      name: "Bordered",
      description: "Everything in a ruled grid — the classic office format.",
      atsFriendly: true,
      inspiredBy: "Traditional Bangladeshi biodata forms",
      accent: "#14532d",
    },
    {
      id: "sidebar",
      name: "Sidebar",
      description: "Photo, contact and hobbies in a tinted column.",
      atsFriendly: true,
      inspiredBy: "AltaCV (LaTeX, LPPL)",
      accent: "#6d28d9",
    },
    {
      id: "heritage",
      name: "Heritage",
      description: "Cream paper, corner ornaments, pill headings.",
      atsFriendly: true,
      accent: "#9a3412",
    },
  ],
  academic: [
    {
      id: "classic",
      name: "Classic",
      description: "Centred header, small-caps ruled headings. Traditional.",
      atsFriendly: true,
      inspiredBy: "Harvard OCS academic CV guide",
      accent: "#1a1a1a",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Accent bar header, coloured headings with rules.",
      atsFriendly: true,
      inspiredBy: "Awesome-CV (LaTeX, LPPL 1.3c)",
      accent: "#0e6e5c",
    },
    {
      id: "timeline",
      name: "Timeline",
      description: "Dates in a left gutter with accent bars.",
      atsFriendly: true,
      inspiredBy: "moderncv — classic style (LaTeX, LPPL)",
      accent: "#3873b3",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Generous whitespace, quiet letter-spaced headings.",
      atsFriendly: true,
      inspiredBy: "JSON Resume minimalist themes (MIT)",
      accent: "#7a4b9c",
    },
    {
      id: "banner",
      name: "Banner",
      description: "Full-width colour header with profile links.",
      atsFriendly: true,
      inspiredBy: "JSON Resume “flat” theme (MIT)",
      accent: "#1e3a8a",
    },
    {
      id: "compact",
      name: "Compact",
      description: "Dense, tinted heading bands — for long publication lists.",
      atsFriendly: true,
      inspiredBy: "sb2nov/resume (LaTeX, MIT)",
      accent: "#0f766e",
    },
    {
      id: "sidebar",
      name: "Sidebar",
      description: "Profiles, interests and skills in a tinted column.",
      atsFriendly: false,
      inspiredBy: "AltaCV (LaTeX, LPPL)",
      accent: "#9d174d",
    },
  ],
};

export function templateInfo(type: DocumentType, id: string): TemplateInfo {
  const list = TEMPLATE_CATALOG[type];
  return list.find((t) => t.id === id) ?? list[0];
}
