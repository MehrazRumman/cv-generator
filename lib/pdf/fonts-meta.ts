import type { BanglaFontId, FontId } from "@/lib/schemas";

export interface FontOption<Id extends string> {
  id: Id;
  label: string;
  category: "sans" | "serif";
  /** Weights shipped in /public/fonts as `${id}-${weight}.ttf` (+ `-italic` for 400/700 when `italics`). */
  weights: number[];
  italics: boolean;
}

export const LATIN_FONTS: Record<FontId, FontOption<FontId>> = {
  inter: { id: "inter", label: "Inter", category: "sans", weights: [400, 600, 700], italics: true },
  roboto: { id: "roboto", label: "Roboto", category: "sans", weights: [400, 500, 700], italics: true },
  lato: { id: "lato", label: "Lato", category: "sans", weights: [400, 700], italics: true },
  "open-sans": { id: "open-sans", label: "Open Sans", category: "sans", weights: [400, 600, 700], italics: true },
  merriweather: { id: "merriweather", label: "Merriweather", category: "serif", weights: [400, 700], italics: true },
  "source-serif": { id: "source-serif", label: "Source Serif", category: "serif", weights: [400, 600, 700], italics: true },
  "eb-garamond": { id: "eb-garamond", label: "EB Garamond", category: "serif", weights: [400, 600, 700], italics: true },
};

export const BANGLA_FONTS: Record<BanglaFontId, FontOption<BanglaFontId>> = {
  "hind-siliguri": { id: "hind-siliguri", label: "Hind Siliguri (sans)", category: "sans", weights: [400, 600, 700], italics: false },
  "noto-serif-bengali": {
    id: "noto-serif-bengali",
    label: "Noto Serif Bengali (serif)",
    category: "serif",
    weights: [400, 600, 700],
    italics: false,
  },
};
