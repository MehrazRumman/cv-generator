import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import { PARTIES } from "@/lib/documents/parties";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import { accentOf, fitWords, headingFont, PdfDocument, Photo, shade, tint, trackFor } from "../shared/kit";
import type { BioKit } from "../biodata/blocks";
import { hasEmblem, PartyEmblem } from "./emblems";
import { headerInfo, renderPoliticalSections } from "./blocks";
import { politicalStyles } from "./styles";

const MARGIN_X = 42;
const MARGIN_TOP = 34;
const EMBLEM = 62;
const PHOTO = 86;

/** Party-colour band with the emblem in a white disc and the photo overlapping; bar headings. */
export function PoliticalBanner({ doc }: { doc: PreparedPolitical }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const second = PARTIES[doc.data.party].colors.secondary;
  const dark = shade(accent, 0.25);
  const text = "#1f2328";
  const kit: BioKit = {
    heading: (title) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, borderBottomWidth: 0.8, borderBottomColor: tint(accent, 0.55), paddingBottom: 2 }}>
        <View style={{ width: 4, height: 13, backgroundColor: second, marginRight: 6 }} />
        <Text style={{ ...hf, color: dark, fontSize: 11.5, fontWeight: 700, letterSpacing: trackFor(title, 0.4) }}>{title}</Text>
      </View>
    ),
    labelWidth: 130,
    twoColumnPersonal: true,
    s: politicalStyles({ text, muted: "#5b616b", border: tint(accent, 0.5), headBackground: tint(accent, 0.86) }),
  };
  const h = headerInfo(doc);
  return (
    <PdfDocument
      title={`${h.name} — ${h.title}`}
      author={h.name}
      settings={doc.settings}
      pageStyle={{ paddingTop: MARGIN_TOP, paddingBottom: 44, paddingHorizontal: MARGIN_X, color: text }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: -MARGIN_TOP,
          marginHorizontal: -MARGIN_X,
          paddingHorizontal: MARGIN_X,
          paddingVertical: 18,
          backgroundColor: accent,
        }}
      >
        {hasEmblem(doc) ? (
          <View
            style={{
              width: EMBLEM + 12,
              height: EMBLEM + 12,
              borderRadius: (EMBLEM + 12) / 2,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <PartyEmblem doc={doc} size={EMBLEM} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          {hasText(h.party) ? <Text style={{ ...hf, fontSize: 13, fontWeight: 700, color: "#ffffff", letterSpacing: trackFor(h.party, 0.3) }}>{h.party}</Text> : null}
          <Text style={{ fontSize: 10.5, color: tint(accent, 0.75), marginTop: 3, letterSpacing: trackFor(h.title, 1), textTransform: "uppercase" }}>{h.title}</Text>
        </View>
        {h.photo ? <View style={{ width: PHOTO }} /> : null}
      </View>
      <View style={{ marginHorizontal: -MARGIN_X, height: 4, backgroundColor: second }} />
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...hf, fontSize: fitWords(h.name, 380, 21), fontWeight: 700, color: dark }}>{h.name}</Text>
          {hasText(h.role) ? <Text style={{ fontSize: 11, color: accent, marginTop: 3 }}>{h.role}</Text> : null}
          {hasText(h.contact) ? <Text style={{ fontSize: 9.5, color: "#555555", marginTop: 3 }}>{h.contact}</Text> : null}
        </View>
        {h.photo ? (
          <Photo
            src={h.photo.dataUrl}
            aspect={h.photo.aspect}
            width={PHOTO}
            // Pulled up so it overlaps the band.
            style={{ marginTop: -62, borderWidth: 3, borderColor: "#ffffff" }}
          />
        ) : null}
      </View>
      {renderPoliticalSections(kit, doc)}
    </PdfDocument>
  );
}
