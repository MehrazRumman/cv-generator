import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, headingFont, PdfDocument, tint, type Kit } from "../../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../../shared/presets";
import { contactItems, renderSections } from "../blocks";
import { Avatar, ContactRows, type SideStyle } from "./parts";

/** Single column with a ringed round photo beside the name — photo-friendly but still ATS-readable. */
export function PhotoHeader({ doc }: { doc: PreparedProfessional }) {
  const hf = headingFont(doc.settings);
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2b2b2b", muted: "#666666", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.5, { entryTitle: { color: "#1f1f1f" }, entrySubtitle: { color: accent }, entryDate: { color: accent, fontStyle: "italic" }, bullet: { color: accent } }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ borderBottomWidth: 1, borderBottomColor: tint(accent, 0.5), paddingBottom: 3, marginBottom: 7 }}>
        <Text style={{ ...hf, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</Text>
      </View>
    ),
  };
  const contactStyle: SideStyle = { heading: () => null, text: { fontSize: 8.6, color: p.muted }, strong: {}, muted: {}, iconColor: accent };
  const items = contactItems(doc);
  const half = Math.ceil(items.length / 2);
  const h = doc.data.header;
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: accent }}>
        <Avatar doc={doc} size={96} ring={3} ringColor={accent} gap={3} fallbackBg={accent} />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text style={{ ...hf, fontSize: 24, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.8 }}>{h.fullName}</Text>
          {hasText(h.jobTitle) ? <Text style={{ fontSize: 11.5, color: p.muted, marginTop: 2, marginBottom: 7 }}>{h.jobTitle}</Text> : null}
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "50%", paddingRight: 8 }}>
              <ContactRows items={items.slice(0, half)} st={contactStyle} labelWidth={150} />
            </View>
            <View style={{ width: "50%" }}>
              <ContactRows items={items.slice(half)} st={contactStyle} labelWidth={150} />
            </View>
          </View>
        </View>
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
