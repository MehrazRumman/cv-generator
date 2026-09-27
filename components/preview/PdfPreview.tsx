"use client";

import { useEffect, useRef, useState } from "react";
import { generatePdf } from "@/lib/pdf/generate";
import type { AnyDocument } from "@/lib/schemas";

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

/** pdf.js is loaded lazily, with its worker served from /public (copied by scripts/copy-pdf-worker.mjs). */
function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((mod) => {
    mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return mod;
  });
  return pdfjsPromise;
}

/** Renders every page to canvases off-screen, then swaps them in at once (no flicker while typing). */
async function renderPages(pdfjs: PdfJs, data: ArrayBuffer, width: number): Promise<HTMLCanvasElement[]> {
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;
  const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
  const canvases: HTMLCanvasElement[] = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: (width / base.width) * ratio });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    // Scale down with the container (e.g. a phone rotating) until the next render catches up.
    canvas.style.width = `${width}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    canvas.className = "block bg-white shadow-md ring-1 ring-zinc-900/5";
    await page.render({ canvas, viewport }).promise;
    canvases.push(canvas);
  }
  await task.destroy();
  return canvases;
}

export function PdfPreview({ doc, debounceMs = 450 }: { doc: AnyDocument | null; debounceMs?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "rendering" | "error">("idle");
  // The document the canvases currently show; while it differs from `doc`, the preview is stale.
  const [renderedDoc, setRenderedDoc] = useState<AnyDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [width, setWidth] = useState(0);
  const runRef = useRef(0);

  // Track available width so pages are rendered crisply at their display size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor(Math.min(entry.contentRect.width - 32, 820));
      setWidth((prev) => (Math.abs(prev - w) > 8 ? w : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || width <= 0) return;
    const run = ++runRef.current;
    const timer = setTimeout(async () => {
      setStatus("rendering");
      try {
        const [pdfjs, blob] = await Promise.all([loadPdfJs(), generatePdf(doc)]);
        if (run !== runRef.current) return; // a newer edit superseded this render
        const canvases = await renderPages(pdfjs, await blob.arrayBuffer(), width);
        if (run !== runRef.current || !pagesRef.current) return;
        pagesRef.current.replaceChildren(...canvases);
        setPageCount(canvases.length);
        setRenderedDoc(doc);
        setError(null);
        setStatus("idle");
      } catch (e) {
        if (run !== runRef.current) return;
        console.error(e);
        setError(e instanceof Error ? e.message : "Could not render the preview.");
        setStatus("error");
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [doc, width, debounceMs]);

  return (
    <div ref={containerRef} className="relative h-full overflow-auto bg-zinc-200/70">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-300/60 bg-zinc-100/90 px-4 py-1.5 text-xs text-zinc-600 backdrop-blur">
        <span>
          Preview{pageCount ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
        </span>
        <span aria-live="polite" className="flex items-center gap-1.5">
          {status === "rendering" || (status === "idle" && doc !== renderedDoc) ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" /> Updating…
            </>
          ) : status === "error" ? (
            <span className="text-red-600 dark:text-red-400">Preview error</span>
          ) : (
            <span className="text-zinc-400">Up to date</span>
          )}
        </span>
      </div>
      {error ? <p className="mx-4 mt-3 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
      <div ref={pagesRef} className="flex flex-col items-center gap-4 px-4 py-4" />
      {pageCount === 0 && status !== "error" ? (
        <p className="absolute inset-x-0 top-24 text-center text-sm text-zinc-500">Generating preview…</p>
      ) : null}
    </div>
  );
}
