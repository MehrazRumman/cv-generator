"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { useController, type FieldPath, type FieldValues } from "react-hook-form";

/** Bumped by the editor when validation fails, so every section opens and errors are visible. */
export const ExpandAllContext = createContext(0);

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${checked ? "bg-indigo-600" : "bg-zinc-300"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SectionToggle<T extends FieldValues>({ name, title }: { name: FieldPath<T>; title: string }) {
  const { field } = useController<T>({ name });
  return <Switch checked={field.value === true} onChange={field.onChange} label={`Show ${title} in PDF`} />;
}

export function SectionCard<T extends FieldValues>({
  title,
  description,
  toggleName,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  /** Path of the boolean in `sections` that switches this section on/off in the PDF. */
  toggleName?: FieldPath<T>;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const expandAll = useContext(ExpandAllContext);
  const bodyId = useId();
  const [seenExpandAll, setSeenExpandAll] = useState(expandAll);
  if (expandAll !== seenExpandAll) {
    setSeenExpandAll(expandAll);
    setOpen(true);
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-surface shadow-xs">
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className={`text-zinc-400 transition ${open ? "rotate-90" : ""}`} aria-hidden>
            ▸
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-900">{title}</span>
            {description ? <span className="block text-xs text-zinc-500">{description}</span> : null}
          </span>
        </button>
        {toggleName ? <SectionToggle<T> name={toggleName} title={title} /> : null}
      </header>
      {open ? (
        <div id={bodyId} className="space-y-3 border-t border-zinc-100 px-4 py-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}
