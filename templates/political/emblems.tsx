import { Image } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { PreparedPolitical } from "@/lib/documents/prepare";
import { partyLogoSrc } from "@/lib/pdf/party-logos";

/** The logo the header shows: one the user uploaded, else the party's official logo (none for "other"). */
function emblemSrc(doc: PreparedPolitical): string | null {
  return doc.data.partyLogo?.dataUrl ?? partyLogoSrc(doc.data.party);
}

/** The party logo, kept in proportion inside a `size` × `size` box. */
export function PartyEmblem({ doc, size, style }: { doc: PreparedPolitical; size: number; style?: Style }) {
  const src = emblemSrc(doc);
  if (!src) return null;
  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt attribute
  return <Image src={src} style={[{ width: size, height: size, objectFit: "contain" }, style ?? {}]} />;
}

/** True when the header has a logo to show. */
export const hasEmblem = (doc: PreparedPolitical) => emblemSrc(doc) !== null;
