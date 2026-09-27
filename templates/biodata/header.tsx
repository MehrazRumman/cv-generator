import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedBiodata } from "@/lib/documents/prepare";
import { labelsFor } from "./blocks";

/** Title, name and one-line subtitle shared by all biodata headers. */
export function headerInfo(doc: PreparedBiodata) {
  const { t, lang } = labelsFor(doc);
  const first = doc.data.occupation[0];
  const c = doc.data.contact;
  return {
    title: t.title[doc.data.mode],
    name: doc.data.personal.fullName.trim(),
    subtitle: first ? joinParts([first.position, first.organization], ", ") : "",
    contact: joinParts([c.phone, c.email], "  ·  "),
    photo: doc.show.photo ? doc.data.photo : null,
    lang,
    hasSubtitle: !!first && hasText(joinParts([first.position, first.organization], "")),
  };
}
