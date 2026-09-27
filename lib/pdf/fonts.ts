import { Font } from "@react-pdf/renderer";
import type { BanglaFontId, FontId } from "@/lib/schemas";
import { BANGLA_FONTS, LATIN_FONTS, type FontOption } from "./fonts-meta";

export { BANGLA_FONTS, LATIN_FONTS };

let registeredBase: string | null = null;

function register<Id extends string>(option: FontOption<Id>, base: string) {
  const src = (weight: number, italic: boolean) => `${base}/${option.id}-${weight}${italic ? "-italic" : ""}.ttf`;
  const fonts = option.weights.flatMap((weight) => {
    // Fonts without italics (Bangla) map italic to upright so italic runs never fail to resolve.
    const italicSrc = option.italics ? src(weight === 400 ? 400 : 700, true) : src(weight, false);
    return [
      { src: src(weight, false), fontWeight: weight, fontStyle: "normal" as const },
      { src: italicSrc, fontWeight: weight, fontStyle: "italic" as const },
    ];
  });
  Font.register({ family: option.id, fonts });
}

/**
 * Registers every font once. `base` is "/fonts" in the browser, or an absolute directory
 * when rendering from Node (scripts/render-samples.tsx).
 */
export function registerFonts(base = "/fonts"): void {
  if (registeredBase === base) return;
  registeredBase = base;
  Object.values(LATIN_FONTS).forEach((f) => register(f, base));
  Object.values(BANGLA_FONTS).forEach((f) => register(f, base));
  // Never split words with an inserted hyphen: names, emails and Bangla words must stay intact.
  Font.registerHyphenationCallback((word) => [word]);
}

/** Latin first; any glyph it lacks (Bangla) falls through to the Bangla font. */
export function fontStack(fontId: FontId, banglaFontId: BanglaFontId): string[] {
  return [fontId, banglaFontId];
}
