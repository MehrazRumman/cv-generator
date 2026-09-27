"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { emptyDocument } from "@/lib/documents/defaults";
import { DOCUMENT_TYPE_META } from "@/lib/documents/meta";
import { documentResolver } from "@/lib/documents/validation";
import { buildFileName } from "@/lib/format/filename";
import { generatePdf } from "@/lib/pdf/generate";
import { SAMPLE_VARIANTS } from "@/lib/sample-data";
import type { AnyDocument, DocumentType } from "@/lib/schemas";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { Logo } from "../brand/Logo";
import { ThemeToggle } from "../theme/ThemeToggle";
import { documentOwnerName, downloadBlob, exportDocumentJson, importDocumentJson, repository } from "@/lib/storage";
import { AcademicForm } from "../forms/academic/AcademicForm";
import { BiodataForm } from "../forms/biodata/BiodataForm";
import { ProfessionalForm } from "../forms/professional/ProfessionalForm";
import { ExpandAllContext } from "../forms/SectionCard";
import { PdfPreview } from "../preview/PdfPreview";

const FORMS: Record<DocumentType, ComponentType> = {
  professional: ProfessionalForm,
  biodata: BiodataForm,
  academic: AcademicForm,
};

const pickDesign = (s: AnyDocument["settings"]) => ({
  templateId: s.templateId,
  paperSize: s.paperSize,
  fontId: s.fontId,
  banglaFontId: s.banglaFontId,
  accentColor: s.accentColor,
});

type Notice = { kind: "info" | "error" | "success"; text: string } | null;

/** Applies `?template=<id>` (links from the home page gallery), keeping the user's data. */
function withRequestedTemplate(doc: AnyDocument): AnyDocument {
  const id = new URLSearchParams(window.location.search).get("template");
  const template = id ? TEMPLATE_CATALOG[doc.type].find((t) => t.id === id) : undefined;
  if (!template || template.id === doc.settings.templateId) return doc;
  const sections = template.featuresPhoto && doc.type === "professional" ? { ...doc.sections, photo: true } : doc.sections;
  return {
    ...doc,
    sections,
    settings: { ...doc.settings, templateId: template.id, accentColor: template.accent, ...(template.fonts ?? {}) },
  } as AnyDocument;
}

/** Loads the saved document (or an empty one), then mounts the form. */
export function Editor({ type }: { type: DocumentType }) {
  const [initial, setInitial] = useState<AnyDocument | null>(null);
  useEffect(() => {
    let cancelled = false;
    repository.load(type).then((saved) => {
      if (!cancelled) setInitial(withRequestedTemplate(saved ?? emptyDocument(type)));
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  if (!initial) {
    return <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">Loading your document…</div>;
  }
  return <EditorForm type={type} initial={initial} />;
}

function EditorForm({ type, initial }: { type: DocumentType; initial: AnyDocument }) {
  const router = useRouter();
  const form = useForm<AnyDocument>({ defaultValues: initial, resolver: documentResolver, mode: "onTouched" });
  const { getValues, reset, handleSubmit, watch } = form;
  const [previewDoc, setPreviewDoc] = useState<AnyDocument>(initial);
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [notice, setNotice] = useState<Notice>(null);
  const [downloading, setDownloading] = useState(false);
  const [expandAll, setExpandAll] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  // Bumped when the whole document is replaced (sample, import, reset) to remount the form and
  // discard per-field UI state such as expanded rows and half-typed values.
  const [formKey, setFormKey] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const Form = FORMS[type];
  // Memoised so autosave/preview state changes here don't re-render every field on each keystroke;
  // fields subscribe to the form store themselves.
  const formElement = useMemo(() => <Form key={formKey} />, [Form, formKey]);
  const meta = DOCUMENT_TYPE_META[type];

  // Autosave + preview: every change is debounced, snapshotted, saved and rendered.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = watch(() => {
      setSaveState("saving");
      clearTimeout(timer);
      timer = setTimeout(() => {
        const snapshot = structuredClone({ ...getValues(), updatedAt: new Date().toISOString() });
        setPreviewDoc(snapshot);
        repository
          .save(snapshot)
          .then(() => setSaveState("saved"))
          .catch((e: unknown) => {
            setSaveState("error");
            setNotice({ kind: "error", text: e instanceof Error ? e.message : "Couldn't save." });
          });
      }, 350);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [watch, getValues]);

  useEffect(() => {
    if (!notice || notice.kind === "error") return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const replaceDocument = useCallback(
    (doc: AnyDocument, message: string) => {
      reset(doc);
      setFormKey((k) => k + 1);
      setPreviewDoc(doc);
      void repository.save(doc);
      setNotice({ kind: "success", text: message });
    },
    [reset],
  );

  const onValid = async (values: AnyDocument) => {
    setDownloading(true);
    try {
      const blob = await generatePdf(values);
      downloadBlob(blob, buildFileName(documentOwnerName(values), values.type, "pdf"));
    } catch (e) {
      console.error(e);
      setNotice({ kind: "error", text: "Couldn't generate the PDF. Please try again." });
    } finally {
      setDownloading(false);
    }
  };

  const onInvalid = (errors: FieldErrors<AnyDocument>) => {
    setTab("form");
    setExpandAll((n) => n + 1);
    const count = JSON.stringify(errors).split('"message"').length - 1;
    setNotice({ kind: "error", text: `Please fix ${count} field${count === 1 ? "" : "s"} marked in red before downloading.` });
    // Sections open on the next render; then bring the first error into view.
    setTimeout(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const result = await importDocumentJson(file);
    if (!result.ok) return setNotice({ kind: "error", text: result.error });
    if (result.doc.type === type) {
      replaceDocument(result.doc, "Imported.");
    } else {
      await repository.save(result.doc);
      router.push(`/editor/${result.doc.type}`);
    }
  };

  const loadSample = (index: number) => {
    const variant = SAMPLE_VARIANTS[type][index];
    if (!variant) return;
    if (!window.confirm("Replace your current data with sample data? (Export first if you want to keep it.)")) return;
    // Keep the design the user already picked (template, paper, fonts, colour).
    const { settings } = getValues();
    const sample = variant.create();
    const merged = { ...sample, settings: { ...sample.settings, ...pickDesign(settings) } } as AnyDocument;
    replaceDocument(merged, `Loaded sample: ${variant.label}.`);
  };

  const resetAll = () => {
    if (!window.confirm("Clear everything and start from an empty form?")) return;
    replaceDocument(emptyDocument(type), "Started a new, empty document.");
  };

  return (
    <FormProvider {...form}>
      <ExpandAllContext.Provider value={expandAll}>
        <div className="flex h-dvh flex-col">
          {/* Toolbar */}
          <header className="z-20 flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-surface px-3 py-2 sm:px-4">
            <Link href="/" className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-zinc-100" aria-label="Back to home">
              <Logo size={26} />
            </Link>
            <div className="mr-auto min-w-0">
              <h1 className="truncate text-sm font-semibold text-zinc-900">{meta.title}</h1>
              <p className="text-[11px] text-zinc-500">
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : "Saved in this browser"}
              </p>
            </div>
            <select
              className="btn max-w-40 pr-7"
              value=""
              onChange={(e) => {
                loadSample(Number(e.target.value));
                e.target.value = "";
              }}
              aria-label="Load sample data"
            >
              <option value="" disabled>
                Load sample…
              </option>
              {SAMPLE_VARIANTS[type].map((v, i) => (
                <option key={v.label} value={i}>
                  {v.label}
                </option>
              ))}
            </select>
            <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
              Import
            </button>
            <button type="button" className="btn" onClick={() => exportDocumentJson(getValues())}>
              Export
            </button>
            <button type="button" className="btn btn-ghost text-zinc-500" onClick={resetAll}>
              Reset
            </button>
            <ThemeToggle />
            <button type="button" className="btn btn-primary" disabled={downloading} onClick={handleSubmit(onValid, onInvalid)}>
              {downloading ? "Preparing…" : "Download PDF"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                void onImport(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </header>

          {notice ? (
            <div
              role="status"
              className={`flex items-start justify-between gap-3 px-4 py-2 text-sm ${
                notice.kind === "error" ? "bg-red-50 text-red-800" : notice.kind === "success" ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
              }`}
            >
              <span>{notice.text}</span>
              <button type="button" onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100" aria-label="Dismiss">
                ✕
              </button>
            </div>
          ) : null}

          {/* Mobile tabs */}
          <div className="flex border-b border-zinc-200 bg-surface md:hidden" role="tablist">
            {(["form", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium capitalize ${tab === t ? "border-b-2 border-indigo-600 text-indigo-700" : "text-zinc-500"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1">
            <form
              noValidate
              onSubmit={(e) => e.preventDefault()}
              className={`min-h-0 w-full overflow-y-auto p-3 sm:p-4 md:block md:w-[46%] md:max-w-2xl md:border-r md:border-zinc-200 ${tab === "form" ? "block" : "hidden"}`}
            >
              {formElement}
              <p className="py-6 text-center text-xs text-zinc-400">Empty sections are never printed. Use the switches to hide sections you don&apos;t need.</p>
            </form>
            <div className={`min-h-0 flex-1 md:block ${tab === "preview" ? "block" : "hidden"}`}>
              <PdfPreview doc={previewDoc} />
            </div>
          </div>
        </div>
      </ExpandAllContext.Provider>
    </FormProvider>
  );
}
