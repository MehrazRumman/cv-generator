import { Font } from "@react-pdf/renderer";
import type { BanglaFontId, FontId } from "@/lib/schemas";
import { BANGLA_FONTS, LATIN_FONTS, type FontOption } from "./fonts-meta";

export { BANGLA_FONTS, LATIN_FONTS };

let registeredBase: string | null = null;

const LONG_WORD = 38;
const CHUNK = 20;

/**
 * Hyphenation policy. react-pdf prints a "-" at every break inside a word, so ordinary words, DOIs and
 * typical URLs (up to 38 characters) are never split — they wrap whole onto the next line — and Bangla
 * is never split. Only tokens too long for any line get break points, preferably after / . @ - _ ? & =,
 * so they wrap instead of overflowing their column.
 */
export function splitLongWord(word: string): string[] {
  if (word.length <= LONG_WORD || /[\u0980-\u09FF]/.test(word)) return [word];
  const out: string[] = [];
  for (const part of word.split(/(?<=[/.@_\-?&=])/)) {
    let rest = part;
    while (rest.length > CHUNK) {
      out.push(rest.slice(0, CHUNK));
      rest = rest.slice(CHUNK);
    }
    if (rest) out.push(rest);
  }
  return out;
}

function register<Id extends string>(option: FontOption<Id>, base: string) {
  const src = (weight: number, italic: boolean) => `${base}/${option.id}-${weight}${italic ? "-italic" : ""}.ttf`;
  const nearestItalic = (weight: number) =>
    option.italicWeights.reduce<number | null>((best, w) => (best === null || Math.abs(w - weight) < Math.abs(best - weight) ? w : best), null);
  const fonts = option.weights.flatMap((weight) => {
    // Weights without an italic use the nearest italic; fonts without italics (Bangla, slab) use upright,
    // so an italic run never fails to resolve.
    const italic = nearestItalic(weight);
    return [
      { src: src(weight, false), fontWeight: weight, fontStyle: "normal" as const },
      { src: italic === null ? src(weight, false) : src(italic, true), fontWeight: weight, fontStyle: "italic" as const },
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
  Font.registerHyphenationCallback(splitLongWord);
}

/** Latin first; any glyph it lacks (Bangla) falls through to the Bangla font. */
export function fontStack(fontId: FontId, banglaFontId: BanglaFontId): string[] {
  return [fontId, banglaFontId];
}
