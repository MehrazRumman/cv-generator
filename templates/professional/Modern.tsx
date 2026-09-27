import { Text, View } from "@react-pdf/renderer";
import { hasText } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import { accentOf, PdfDocument, Photo, type Kit } from "../shared/kit";
import { baseKitStyles, PAGE_MARGIN } from "../shared/presets";
import { contactItems, ContactLine, renderSections } from "./blocks";

/** Two-tone name, accent-led headings with a trailing rule. Modelled on Awesome-CV (LaTeX, LPPL). */
export function Modern({ doc }: { doc: PreparedProfessional }) {
  const accent = accentOf(doc.settings.accentColor);
  const p = { text: "#2b2b2b", muted: "#6b6b6b", accent };
  const kit: Kit = {
    s: baseKitStyles(p, 9.8, {
      entryDate: { color: accent, fontStyle: "italic" },
      entrySubtitle: { color: p.muted },
      bullet: { color: accent },
    }),
    bulletChar: "•",
    entryLayout: "stacked",
    dateColumnWidth: 0,
    Heading: ({ title }) => (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: 700 }}>
          <Text style={{ color: accent }}>{title.slice(0, 3)}</Text>
          {title.slice(3)}
        </Text>
        <View style={{ flex: 1, borderBottomWidth: 0.7, borderBottomColor: "#b5b5b5", marginLeft: 8, marginTop: 2 }} />
      </View>
    ),
  };
  const h = doc.data.header;
  const parts = h.fullName.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  return (
    <PdfDocument title={`${h.fullName} — CV`} author={h.fullName} settings={doc.settings} pageStyle={{ ...PAGE_MARGIN, color: p.text }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 28 }}>
            <Text style={{ color: "#777777" }}>{parts.join(" ")} </Text>
            <Text style={{ fontWeight: 700, color: "#222222" }}>{last}</Text>
          </Text>
          {hasText(h.jobTitle) ? (
            <Text style={{ fontSize: 9.5, color: accent, textTransform: "uppercase", letterSpacing: 1.6, marginTop: 4 }}>{h.jobTitle}</Text>
          ) : null}
          <ContactLine items={contactItems(doc)} separator="  |  " style={{ fontSize: 8.8, color: p.muted, marginTop: 6 }} />
        </View>
        {doc.show.photo && doc.data.photo ? (
          <Photo src={doc.data.photo.dataUrl} aspect={doc.data.photo.aspect} width={70} style={{ marginLeft: 12, borderRadius: 4 }} />
        ) : null}
      </View>
      {renderSections(kit, doc)}
    </PdfDocument>
  );
}
