"use client";

import dynamic from "next/dynamic";
import type { DocumentType } from "@/lib/schemas";

// The editor uses localStorage, canvas and react-pdf, so it only runs in the browser.
const Editor = dynamic(() => import("@/components/editor/Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading editor…</div>,
});

export function EditorLoader({ type }: { type: DocumentType }) {
  return <Editor type={type} />;
}
