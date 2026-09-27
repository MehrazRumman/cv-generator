import Link from "next/link";
import { DOCUMENT_TYPE_META } from "@/lib/documents/meta";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/schemas";
import { TEMPLATE_CATALOG } from "@/templates/catalog";

const ACCENT: Record<DocumentType, string> = {
  professional: "from-indigo-500 to-sky-500",
  biodata: "from-rose-500 to-amber-500",
  academic: "from-emerald-500 to-teal-500",
};

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">CV Generator</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">What would you like to create?</h1>
        <p className="mt-3 text-zinc-600">
          Fill in a form, watch the PDF update live, and download it. Your data stays in this browser — nothing is uploaded.
          Bangla (বাংলা) text is fully supported.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {DOCUMENT_TYPES.map((type) => {
          const meta = DOCUMENT_TYPE_META[type];
          const templateCount = TEMPLATE_CATALOG[type].length;
          return (
            <Link
              key={type}
              href={`/editor/${type}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <div className={`h-2 bg-gradient-to-r ${ACCENT[type]}`} />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{meta.tagline}</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-900">{meta.title}</h2>
                <p className="mt-2 text-sm text-zinc-600">{meta.description}</p>
                <ul className="mt-4 space-y-1 text-sm text-zinc-700">
                  {meta.bestFor.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-zinc-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-500">
                    {templateCount} template{templateCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm font-semibold text-indigo-600 group-hover:underline">Start →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
