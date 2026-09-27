import { notFound } from "next/navigation";
import { DOCUMENT_TYPE_META, isDocumentType } from "@/lib/documents/meta";
import { DOCUMENT_TYPES } from "@/lib/schemas";
import { EditorLoader } from "./EditorLoader";

export function generateStaticParams() {
  return DOCUMENT_TYPES.map((type) => ({ type }));
}

export async function generateMetadata(props: PageProps<"/editor/[type]">) {
  const { type } = await props.params;
  return { title: isDocumentType(type) ? `${DOCUMENT_TYPE_META[type].title} — CV Generator` : "CV Generator" };
}

export default async function EditorPage(props: PageProps<"/editor/[type]">) {
  const { type } = await props.params;
  if (!isDocumentType(type)) notFound();
  return <EditorLoader type={type} />;
}
