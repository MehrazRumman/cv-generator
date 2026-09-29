import type { BioKit } from "../biodata/blocks";

/** Table, key–value and entry styles every political template starts from. */
export function politicalStyles({
  text,
  muted,
  border,
  headBackground,
  size = 10,
}: {
  text: string;
  muted: string;
  border: string;
  headBackground: string;
  size?: number;
}): BioKit["s"] {
  return {
    kvRow: { flexDirection: "row", paddingVertical: 2, paddingHorizontal: 4 },
    kvLabel: { fontSize: size, fontWeight: 600, color: text },
    kvColon: { width: 12, fontSize: size, color: text },
    kvValue: { flex: 1, fontSize: size, color: text, lineHeight: 1.35 },
    paragraph: { fontSize: size, lineHeight: 1.5, color: text, paddingHorizontal: 4 },
    table: { borderLeftWidth: 0.6, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: border },
    headRow: { flexDirection: "row", backgroundColor: headBackground, borderBottomWidth: 0.6, borderBottomColor: border },
    headCell: { fontSize: size - 1, fontWeight: 700, padding: 4, borderRightWidth: 0.6, borderRightColor: border, color: text },
    row: { flexDirection: "row" },
    cell: { fontSize: size - 0.5, padding: 4, borderRightWidth: 0.6, borderRightColor: border, color: text, lineHeight: 1.3 },
    entryTitle: { fontSize: size + 0.3, fontWeight: 700, color: text, paddingHorizontal: 4 },
    entryMeta: { fontSize: size - 0.5, color: muted, paddingHorizontal: 4, marginTop: 1, lineHeight: 1.35 },
    bulletRow: { flexDirection: "row", paddingHorizontal: 8, marginTop: 2, fontSize: size - 0.5 },
    bulletText: { flex: 1, fontSize: size - 0.5, lineHeight: 1.35, color: text },
    subheading: { fontSize: size, fontWeight: 700, color: text, marginTop: 6, marginBottom: 3, paddingHorizontal: 4 },
    sectionGap: { marginTop: 12 },
  };
}
