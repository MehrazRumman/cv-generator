import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DOCUMENT_TYPE_META } from "@/lib/documents/meta";
import { LATIN_FONTS } from "@/lib/pdf/fonts-meta";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/schemas";
import { TEMPLATE_CATALOG } from "@/templates/catalog";

const REPO_URL = "https://github.com/MehrazRumman/cv-generator";

const TYPE_STYLE: Record<DocumentType, { gradient: string; ring: string; chip: string; cover: string }> = {
  professional: { gradient: "from-indigo-500 to-sky-500", ring: "hover:ring-indigo-300", chip: "bg-indigo-50 text-indigo-700", cover: "modern" },
  biodata: { gradient: "from-rose-500 to-amber-500", ring: "hover:ring-rose-300", chip: "bg-rose-50 text-rose-700", cover: "classic" },
  academic: { gradient: "from-emerald-500 to-teal-500", ring: "hover:ring-emerald-300", chip: "bg-emerald-50 text-emerald-700", cover: "classic" },
};

const thumb = (type: DocumentType, id: string) => `/templates/${type}-${id}.jpg`;
const templateCount = DOCUMENT_TYPES.reduce((n, t) => n + TEMPLATE_CATALOG[t].length, 0);

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const FEATURES: { title: string; text: string; icon: string }[] = [
  { title: "Live PDF preview", text: "Every keystroke updates a real PDF beside the form — what you see is exactly what you download.", icon: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { title: "ATS-friendly text", text: "Selectable text, standard headings and single-column layouts that applicant tracking systems can read.", icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { title: "বাংলা supported", text: "Bangla renders with correct conjuncts. Biodata headings can be printed in Bangla or English.", icon: "M4 5h7M7.5 5c0 6-3.5 9-3.5 9M5 10c1.5 2.5 4 4 6 4M13 19l4-10 4 10M14.5 16h5" },
  { title: "Private by design", text: "No account and no server: everything is saved in your own browser. Export a JSON backup anytime.", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" },
  { title: `${Object.keys(LATIN_FONTS).length} fonts, any colour`, text: "Pair a heading font with a body font, choose your accent colour, and print on A4 or US Letter.", icon: "M4 20h16M6 16L12 4l6 12M8.5 11h7" },
  { title: "Smart page breaks", text: "Headings never strand at the bottom of a page and entries aren't split awkwardly. Empty sections never print.", icon: "M4 4h16v6H4zM4 14h16v6H4z" },
];

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{title}</h2>
      {children ? <p className="mt-3 text-zinc-600">{children}</p> : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-surface/80 backdrop-blur">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <Logo size={28} />
            CV Generator
          </Link>
          <div className="ml-auto hidden items-center gap-6 text-sm text-zinc-600 sm:flex">
            <a href="#create" className="hover:text-zinc-900">Create</a>
            <a href="#templates" className="hover:text-zinc-900">Templates</a>
            <a href="#features" className="hover:text-zinc-900">Features</a>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <ThemeToggle />
            <SignOutButton />
            <a href={REPO_URL} className="btn" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(99,102,241,0.18),transparent),radial-gradient(40%_50%_at_10%_80%,rgba(14,165,233,0.14),transparent)]" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-surface/70 px-3 py-1 text-xs font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Free · No sign-up · Data stays in your browser
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Your CV, Biodata or Academic CV —{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">ready in minutes.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600">
              Fill in a simple form, pick one of {templateCount} templates and watch your PDF update live. Download a polished,
              ATS-readable PDF — with full বাংলা support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/editor/professional" className="btn btn-primary px-5 py-2.5 text-base">
                Create a CV
              </Link>
              <Link href="/editor/biodata" className="btn px-5 py-2.5 text-base">
                Biodata
              </Link>
              <Link href="/editor/academic" className="btn px-5 py-2.5 text-base">
                Academic CV
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[
                [String(templateCount), "templates"],
                [String(Object.keys(LATIN_FONTS).length), "fonts"],
                ["0", "sign-ups"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-zinc-200 bg-surface/70 px-2 py-3">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-bold text-zinc-900">{value}</dd>
                  <dd className="text-xs text-zinc-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Fanned document previews */}
          <div className="relative mx-auto hidden h-[440px] w-full max-w-md sm:block" aria-hidden>
            {(
              [
                ["academic", "banner", "-rotate-6 left-0 top-10"],
                ["biodata", "classic", "rotate-6 right-0 top-10"],
                ["professional", "modern", "left-1/2 top-0 -translate-x-1/2"],
              ] as const
            ).map(([type, id, pos]) => (
              <div key={type} className={`absolute w-[58%] overflow-hidden rounded-lg bg-surface shadow-2xl ring-1 ring-zinc-900/10 ${pos}`}>
                <Image src={thumb(type, id)} alt="" width={420} height={594} className="h-auto w-full" preload />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document types */}
      <section id="create" className="scroll-mt-16 bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <SectionTitle eyebrow="Step 1" title="What would you like to create?">
            Each type has its own form, sample data and templates. Switch templates any time — your content stays.
          </SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {DOCUMENT_TYPES.map((type) => {
              const meta = DOCUMENT_TYPE_META[type];
              const style = TYPE_STYLE[type];
              return (
                <Link
                  key={type}
                  href={`/editor/${type}`}
                  className={`group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-surface shadow-sm ring-2 ring-transparent transition hover:-translate-y-1 hover:shadow-lg ${style.ring}`}
                >
                  <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${style.gradient}`}>
                    <div className="absolute inset-x-10 top-6 overflow-hidden rounded-t-md shadow-xl transition group-hover:top-4">
                      <Image src={thumb(type, style.cover)} alt={`${meta.title} example`} width={420} height={594} className="h-auto w-full" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>{meta.tagline}</span>
                    <h3 className="mt-3 text-xl font-semibold text-zinc-900">{meta.title}</h3>
                    <p className="mt-2 text-sm text-zinc-600">{meta.description}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-zinc-700">
                      {meta.bestFor.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden className="text-emerald-500">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <span className="text-xs text-zinc-500">{TEMPLATE_CATALOG[type].length} templates</span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition group-hover:translate-x-0.5">Start now →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Template gallery */}
      <section id="templates" className="scroll-mt-16 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <SectionTitle eyebrow="Templates" title={`${templateCount} templates, one click apart`}>
            Modelled on popular open-source CV designs. Click one to start with it — you can switch later without retyping anything.
          </SectionTitle>
          {DOCUMENT_TYPES.map((type) => (
            <div key={type} className="mb-12 last:mb-0">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">{DOCUMENT_TYPE_META[type].title}</h3>
                <Link href={`/editor/${type}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Open editor →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {TEMPLATE_CATALOG[type].map((t) => (
                  <Link key={t.id} href={`/editor/${type}?template=${t.id}`} className="group" title={t.inspiredBy ? `Inspired by ${t.inspiredBy}` : undefined}>
                    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-surface shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-2 group-hover:ring-indigo-400">
                      <Image src={thumb(type, t.id)} alt={`${t.name} template`} width={420} height={594} className="h-auto w-full" />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                      <span className="text-sm font-medium text-zinc-900">{t.name}</span>
                      {type === "professional" && !t.atsFriendly ? (
                        <span className="ml-auto rounded bg-amber-50 px-1 text-[10px] font-medium text-amber-700">Not ATS</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{t.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <SectionTitle eyebrow="Why this generator" title="Everything a good CV needs — nothing it doesn't" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:text-indigo-400">
                  <Icon path={f.icon} />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <SectionTitle eyebrow="How it works" title="Three steps to a finished PDF" />
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              ["Pick a document", "CV, biodata or academic CV. Load sample data to see how it looks."],
              ["Fill in the form", "Add, reorder and hide sections. The preview updates as you type."],
              ["Download the PDF", "Named like Name_CV_2026-09-28.pdf and ready to send."],
            ].map(([title, text], i) => (
              <li key={title} className="relative rounded-xl border border-zinc-200 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-10 text-center text-white">
            <h3 className="text-2xl font-bold">Ready to start?</h3>
            <p className="max-w-lg text-indigo-100">It takes about ten minutes, and your data never leaves this browser.</p>
            <Link href="/editor/professional" className="btn border-white bg-white px-5 py-2.5 text-base text-[#4338ca] hover:bg-[#eef2ff]">
              Create my CV
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-zinc-500 sm:flex-row">
          <span className="flex items-center gap-2">
            <Logo size={20} /> CV Generator — open source
          </span>
          <span>Templates modelled on open-source designs; fonts under the SIL Open Font License.</span>
          <a href={REPO_URL} className="hover:text-zinc-800" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
