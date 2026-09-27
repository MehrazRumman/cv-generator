import type { BanglaFontId, FontId } from "@/lib/schemas";

export type FontCategory = "sans" | "serif" | "slab" | "mono";

export interface FontOption<Id extends string> {
  id: Id;
  label: string;
  category: FontCategory;
  /** Upright weights shipped in /public/fonts as `${id}-${weight}.ttf`. */
  weights: number[];
  /** Weights that also ship an italic, as `${id}-${weight}-italic.ttf`. */
  italicWeights: number[];
  /** Shown in the picker, e.g. "Calibri-compatible". */
  note?: string;
}

const STD = { weights: [400, 600, 700], italicWeights: [400, 700] };
const TWO = { weights: [400, 700], italicWeights: [400, 700] };

export const LATIN_FONTS: Record<FontId, FontOption<FontId>> = {
  // Sans-serif
  inter: { id: "inter", label: "Inter", category: "sans", ...STD },
  roboto: { id: "roboto", label: "Roboto", category: "sans", weights: [400, 500, 700], italicWeights: [400, 700] },
  lato: { id: "lato", label: "Lato", category: "sans", ...TWO },
  "open-sans": { id: "open-sans", label: "Open Sans", category: "sans", ...STD },
  "source-sans": { id: "source-sans", label: "Source Sans 3", category: "sans", ...STD },
  "ibm-plex-sans": { id: "ibm-plex-sans", label: "IBM Plex Sans", category: "sans", ...STD },
  "work-sans": { id: "work-sans", label: "Work Sans", category: "sans", ...STD },
  "nunito-sans": { id: "nunito-sans", label: "Nunito Sans", category: "sans", ...STD },
  montserrat: { id: "montserrat", label: "Montserrat", category: "sans", ...STD },
  poppins: { id: "poppins", label: "Poppins", category: "sans", ...STD },
  raleway: { id: "raleway", label: "Raleway", category: "sans", ...STD },
  carlito: { id: "carlito", label: "Carlito", category: "sans", ...TWO, note: "Calibri-compatible" },
  // Serif
  merriweather: { id: "merriweather", label: "Merriweather", category: "serif", ...TWO },
  "source-serif": { id: "source-serif", label: "Source Serif", category: "serif", ...STD },
  "eb-garamond": { id: "eb-garamond", label: "EB Garamond", category: "serif", ...STD },
  lora: { id: "lora", label: "Lora", category: "serif", ...STD },
  "crimson-pro": { id: "crimson-pro", label: "Crimson Pro", category: "serif", ...STD },
  "libre-baskerville": { id: "libre-baskerville", label: "Libre Baskerville", category: "serif", weights: [400, 700], italicWeights: [400] },
  "pt-serif": { id: "pt-serif", label: "PT Serif", category: "serif", ...TWO },
  playfair: { id: "playfair", label: "Playfair Display", category: "serif", ...STD, note: "best for headings" },
  tinos: { id: "tinos", label: "Tinos", category: "serif", ...TWO, note: "Times New Roman-compatible" },
  // Slab
  "roboto-slab": { id: "roboto-slab", label: "Roboto Slab", category: "slab", weights: [400, 600, 700], italicWeights: [] },
  // Monospace
  "ibm-plex-mono": { id: "ibm-plex-mono", label: "IBM Plex Mono", category: "mono", ...STD },
  "jetbrains-mono": { id: "jetbrains-mono", label: "JetBrains Mono", category: "mono", ...STD },
};

export const BANGLA_FONTS: Record<BanglaFontId, FontOption<BanglaFontId>> = {
  "hind-siliguri": { id: "hind-siliguri", label: "Hind Siliguri", category: "sans", weights: [400, 600, 700], italicWeights: [] },
  mina: { id: "mina", label: "Mina", category: "sans", weights: [400, 700], italicWeights: [] },
  "noto-serif-bengali": { id: "noto-serif-bengali", label: "Noto Serif Bengali", category: "serif", weights: [400, 600, 700], italicWeights: [] },
};

export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  sans: "Sans-serif",
  serif: "Serif",
  slab: "Slab serif",
  mono: "Monospace",
};

/** Select options grouped by category, e.g. for <optgroup>. */
export function fontOptions<Id extends string>(fonts: Record<Id, FontOption<Id>>) {
  return (Object.values(fonts) as FontOption<Id>[]).map((f) => ({
    value: f.id,
    label: f.note ? `${f.label} — ${f.note}` : f.label,
    group: FONT_CATEGORY_LABEL[f.category],
  }));
}
