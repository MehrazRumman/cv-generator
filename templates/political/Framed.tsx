import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import { PARTIES } from "@/lib/documents/parties";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, tint, trackFor } from "../shared/kit";
import type { BioKit } from "../biodata/blocks";
import { hasEmblem, PartyEmblem } from "./emblems";
import { headerInfo, renderPoliticalSections } from "./blocks";
import { politicalStyles } from "./styles";

const FRAME = 20;

/** Formal office style: a double frame on every page, centred emblem and headings between rules. */
export function PoliticalFramed({ doc }: { doc: PreparedPolitical }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const second = PARTIES[doc.data.party].colors.secondary;
  const text = "#1f1f1f";
  const rule = <View style={{ flex: 1, height: 0.8, backgroundColor: tint(accent, 0.4) }} />;
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        {rule}
        <Text style={{ ...hf, fontSize: 11.5, fontWeight: 700, color: accent, marginHorizontal: 10, letterSpacing: trackFor(title, 0.8) }}>{title}</Text>
        {rule}
      </View>
    ),
    labelWidth: 135,
    twoColumnPersonal: false,
    s: politicalStyles({ text, muted: "#555555", border: tint(accent, 0.45), headBackground: tint(accent, 0.9) }),
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: 44, paddingBottom: 52, paddingHorizontal: 50, color: text }}
      numberBottom={28}
      background={
        <>
          <View fixed style={{ position: "absolute", top: FRAME, bottom: FRAME, left: FRAME, right: FRAME, borderWidth: 2, borderColor: accent }} />
          <View fixed style={{ position: "absolute", top: FRAME + 4, bottom: FRAME + 4, left: FRAME + 4, right: FRAME + 4, borderWidth: 0.7, borderColor: second }} />
        </>
      }
    >
      <View style={{ alignItems: "center" }}>
        {hasEmblem(doc) ? <PartyEmblem doc={doc} size={58} color={accent} /> : null}
        {hasText(h.party) ? (
          <Text style={{ ...hf, fontSize: 13.5, fontWeight: 700, color: accent, marginTop: 4, textAlign: "center", letterSpacing: trackFor(h.party, 0.3) }}>{h.party}</Text>
        ) : null}
        <Text style={{ fontSize: 11, color: "#444444", marginTop: 3, letterSpacing: trackFor(h.title, 2), textTransform: "uppercase" }}>{h.title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 0.8, borderTopColor: tint(accent, 0.4) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.name, 380, 20), fontWeight: 700, color: text }}>{h.name}</Text>
          {hasText(h.role) ? <Text style={{ fontSize: 11, color: accent, marginTop: 3 }}>{h.role}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: "#444444", marginTop: 3 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? <Photo src={h.photo.dataUrl} aspect={h.photo.aspect} width={82} style={{ borderWidth: 1.5, borderColor: accent }} /> : null}
      </View>
      {renderPoliticalSections(kit, doc)}
    </PdfDocument>
  );
}
