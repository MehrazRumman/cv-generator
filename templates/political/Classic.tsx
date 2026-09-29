import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import { PARTIES } from "@/lib/documents/parties";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, tint, trackFor } from "../shared/kit";
import type { BioKit } from "../biodata/blocks";
import { hasEmblem, PartyEmblem } from "./emblems";
import { headerInfo, renderPoliticalSections } from "./blocks";
import { politicalStyles } from "./styles";

/** The traditional nomination CV: emblem, party and title across the top, a two-colour rule, heading bands. */
export function PoliticalClassic({ doc }: { doc: PreparedPolitical }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const second = PARTIES[doc.data.party].colors.secondary;
  const text = "#1f1f1f";
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ backgroundColor: accent, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 6, borderLeftWidth: 4, borderLeftColor: second }}>
        <Text style={{ ...hf, color: "#ffffff", fontSize: 10.5, fontWeight: 700, letterSpacing: trackFor(title, 0.5) }}>{title}</Text>
      </View>
    ),
    labelWidth: 135,
    twoColumnPersonal: false,
    s: politicalStyles({ text, muted: "#555555", border: "#9a9a9a", headBackground: tint(accent, 0.88) }),
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument title={`${h.name} — ${h.title}`} author={h.name} settings={doc.settings} pageStyle={{ paddingTop: 34, paddingBottom: 44, paddingHorizontal: 42, color: text }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 84, alignItems: "flex-start" }}>{hasEmblem(doc) ? <PartyEmblem doc={doc} size={64} color={accent} /> : null}</View>
        <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 8 }}>
          {hasText(h.party) ? (
            <Text style={{ ...hf, fontSize: 13, fontWeight: 700, color: accent, textAlign: "center", letterSpacing: trackFor(h.party, 0.3) }}>{h.party}</Text>
          ) : null}
          <Text style={{ ...hf, fontSize: 17, fontWeight: 700, color: text, marginTop: 4, textAlign: "center", letterSpacing: trackFor(h.title, 1.5), textTransform: "uppercase" }}>
            {h.title}
          </Text>
        </View>
        <View style={{ width: 84, alignItems: "flex-end" }}>
          {h.photo ? <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={80} style={{ borderWidth: 1.5, borderColor: tint(accent, 0.3) }} /> : null}
        </View>
      </View>
      <View style={{ marginTop: 10, height: 3, backgroundColor: accent }} />
      <View style={{ marginTop: 1.5, height: 1.5, backgroundColor: second }} />
      <View style={{ marginTop: 10, alignItems: "center" }}>
        <Text style={{ ...hf, fontSize: fitWords(h.name, 500, 20), fontWeight: 700, color: text }}>{h.name}</Text>
        {hasText(h.role) ? <Text style={{ fontSize: 11, color: accent, marginTop: 3 }}>{h.role}</Text> : null}
        {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: "#444444", marginTop: 3 }}>{h.contact}</Text> : null}
      </View>
      {renderPoliticalSections(kit, doc)}
    </PdfDocument>
  );
}
