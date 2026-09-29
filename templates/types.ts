import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { PreparedAcademic, PreparedBiodata, PreparedEuropass, PreparedPolitical, PreparedProfessional } from "@/lib/documents/prepare";
import type { DocumentType } from "@/lib/schemas";

export interface PreparedByType {
  professional: PreparedProfessional;
  europass: PreparedEuropass;
  biodata: PreparedBiodata;
  academic: PreparedAcademic;
  political: PreparedPolitical;
}

/** Templates are pure: prepared data in, a react-pdf <Document> out. */
export type TemplateComponent<T extends DocumentType> = (props: { doc: PreparedByType[T] }) => ReactElement<DocumentProps>;
