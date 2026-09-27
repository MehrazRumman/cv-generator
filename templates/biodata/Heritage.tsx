import { Path, Svg, Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, Photo, tint } from "../shared/kit";
import { renderBiodataSections, type BioKit } from "./blocks";
import { headerInfo } from "./header";
import { tracking } from "./labels";

const PAPER = "#fdf8ef";

/** A corner flourish drawn as vector paths; rotated for each corner. */
function Corner({ color, rotate, style }: { color: string; rotate: number; style: object }) {
  return (
    <Svg width={54} height={54} viewBox="0 0 54 54" style={{ position: "absolute", ...style }}>
      <Path
        d="M4 50 L4 14 Q4 4 14 4 L50 4 M10 50 L10 18 Q10 10 18 10 L50 10 M18 26 Q26 26 26 18 Q26 26 34 26 Q26 26 26 34 Q26 26 18 26 Z"
        stroke={color}
        strokeWidth={1.1}
        fill="none"
        transform={`rotate(${rotate} 27 27)`}
      />
    </Svg>
  );
}

/** Cream paper, drawn corner ornaments, pill headings and dotted rows — a keepsake-style marriage biodata. */
export function BiodataHeritage({ doc }: { doc: PreparedBiodata }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const lang = doc.settings.labelLanguage;
  const text = "#2b2420";
  const soft = tint(accent, 0.55);
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <View style={{ backgroundColor: accent, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 16 }}>
          <Text style={{ ...hf, fontSize: 10.5, fontWeight: 700, color: "#ffffff", letterSpacing: tracking(1, lang) }}>{title}</Text>
        </View>
      </View>
    ),
    labelWidth: 140,
    s: {
      kvRow: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 22, borderBottomWidth: 0.6, borderBottomColor: soft, borderBottomStyle: "dotted" },
      kvLabel: { fontSize: 9.8, color: accent, fontWeight: 600 },
      kvColon: { width: 12, fontSize: 9.8, color: soft },
      kvValue: { flex: 1, fontSize: 9.8, color: text, lineHeight: 1.35 },
      paragraph: { fontSize: 9.8, lineHeight: 1.55, color: text, paddingHorizontal: 22, textAlign: "center" },
      table: { marginHorizontal: 22, borderWidth: 0.6, borderColor: soft, borderRadius: 3 },
      headRow: { flexDirection: "row", backgroundColor: tint(accent, 0.85) },
      headCell: { fontSize: 8.8, fontWeight: 700, color: accent, paddingVertical: 4, paddingHorizontal: 4 },
      row: { flexDirection: "row", borderTopWidth: 0.4, borderTopColor: soft },
      cell: { fontSize: 9.2, paddingVertical: 3.5, paddingHorizontal: 4, color: text, lineHeight: 1.3 },
      entryTitle: { fontSize: 10.2, fontWeight: 700, color: text, paddingHorizontal: 22 },
      entryMeta: { fontSize: 9.3, color: accent, paddingHorizontal: 22, marginTop: 1 },
      bulletRow: { flexDirection: "row", paddingHorizontal: 26, marginTop: 2, fontSize: 9.3, color: accent },
      bulletText: { flex: 1, fontSize: 9.3, lineHeight: 1.35, color: text },
      subheading: { fontSize: 9.8, fontWeight: 700, color: accent, marginTop: 7, marginBottom: 3, paddingHorizontal: 22 },
      sectionGap: { marginTop: 14 },
    },
  };
  const h = headerInfo(doc);
  const ornaments = (
    <View fixed style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: PAPER }}>
      <Corner color={accent} rotate={0} style={{ top: 16, left: 16 }} />
      <Corner color={accent} rotate={90} style={{ top: 16, right: 16 }} />
      <Corner color={accent} rotate={180} style={{ bottom: 16, right: 16 }} />
      <Corner color={accent} rotate={270} style={{ bottom: 16, left: 16 }} />
    </View>
  );
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: 44, paddingBottom: 52, paddingHorizontal: 46, color: text }}
      background={ornaments}
      numberColor={accent}
      numberBottom={28}
    >
      <View style={{ alignItems: "center" }}>
        <Text style={{ ...hf, fontSize: 22, color: accent, fontWeight: 700, letterSpacing: tracking(3, lang) }}>{h.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <View style={{ width: 70, borderBottomWidth: 0.8, borderBottomColor: soft }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent, marginHorizontal: 6 }} />
          <View style={{ width: 70, borderBottomWidth: 0.8, borderBottomColor: soft }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingHorizontal: 22 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: 20, fontWeight: 700, color: text }}>{h.name}</Text>
          {h.hasSubtitle ? <Text style={{ fontSize: 10.5, color: accent, marginTop: 3 }}>{h.subtitle}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.6, color: "#5d524b", marginTop: 6 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? (
          <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={96} style={{ marginLeft: 12, borderWidth: 2, borderColor: accent, borderRadius: 6 }} />
        ) : null}
      </View>
      {renderBiodataSections(kit, doc)}
    </PdfDocument>
  );
}
