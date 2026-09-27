import type { DocumentType } from "@/lib/schemas";

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
}

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
  ],
};

export function templateInfo(type: DocumentType, id: string): TemplateInfo {
  const list = TEMPLATE_CATALOG[type];
  return list.find((t) => t.id === id) ?? list[0];
}
