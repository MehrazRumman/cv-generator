import type { Style } from "@react-pdf/types";
import type { KitStyles } from "./kit";

export interface Palette {
  text: string;
  muted: string;
  accent: string;
}

/** Sensible defaults every template starts from; templates override only what makes them distinct. */
export function baseKitStyles(p: Palette, size = 10, overrides: Partial<KitStyles> = {}): KitStyles {
  const base: KitStyles = {
    paragraph: { fontSize: size, lineHeight: 1.45, color: p.text },
    entry: { marginBottom: size * 0.8 },
    entryHead: { flexDirection: "row", alignItems: "flex-start" },
    entryTitle: { fontSize: size + 0.5, fontWeight: 700, color: p.text },
    entrySubtitle: { fontSize: size, color: p.text, marginTop: 1 },
    entryDate: { fontSize: size - 0.5, color: p.muted, textAlign: "right", marginLeft: 8 },
    entryMeta: { fontSize: size - 0.5, color: p.muted, marginTop: 1 },
    bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 2 },
    bullet: { width: 10, fontSize: size, color: p.muted },
    bulletText: { flex: 1, fontSize: size, lineHeight: 1.4, color: p.text },
    label: { fontWeight: 700 },
    link: { fontSize: size - 0.5, color: p.accent, marginTop: 1 },
    section: { marginTop: size * 0.9 },
  };
  const merged = { ...base };
  (Object.keys(overrides) as (keyof KitStyles)[]).forEach((k) => {
    merged[k] = { ...base[k], ...(overrides[k] as Style) };
  });
  return merged;
}

export const PAGE_MARGIN = { paddingTop: 40, paddingBottom: 44, paddingHorizontal: 44 } as const;
