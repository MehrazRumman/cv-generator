import { Font } from "@react-pdf/renderer";
import type { BanglaFontId, FontId } from "@/lib/schemas";
import { BANGLA_FONTS, LATIN_FONTS, type FontOption } from "./fonts-meta";

export { BANGLA_FONTS, LATIN_FONTS };

let registeredBase: string | null = null;

const LONG_WORD = 24;
const CHUNK = 16;

/**
 * Hyphenation policy. Ordinary words are never split (react-pdf would insert a "-"), and Bangla is
 * never split. Only overlong tokens — long emails, URLs, IDs — get break points, preferably after
 * / . @ - _ ? & =, so they wrap instead of overflowing their column.
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
  Font.registerHyphenationCallback(splitLongWord);
}

/** Latin first; any glyph it lacks (Bangla) falls through to the Bangla font. */
export function fontStack(fontId: FontId, banglaFontId: BanglaFontId): string[] {
  return [fontId, banglaFontId];
}
