"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { BANGLA_FONTS, LATIN_FONTS } from "@/lib/pdf/fonts-meta";
import type { AnyDocument } from "@/lib/schemas";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { createFields } from "./fields";
import { SectionCard } from "./SectionCard";

const F = createFields<AnyDocument>();

export function DesignSettings({ extra }: { extra?: React.ReactNode }) {
  const { control, setValue } = useFormContext<AnyDocument>();
  const type = useWatch({ control, name: "type" });
  const templateId = useWatch({ control, name: "settings.templateId" });
  const accent = useWatch({ control, name: "settings.accentColor" });
  const templates = TEMPLATE_CATALOG[type];

  return (
    <SectionCard<AnyDocument> title="Design" description="Template, paper, fonts and colour — your content is kept when you switch.">
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-700">Template</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {templates.map((t) => {
            const active = t.id === templateId;
            return (
              <button
                key={t.id}
                type="button"
                title={t.inspiredBy ? `Inspired by ${t.inspiredBy}` : undefined}
                onClick={() => {
                  // Adopt the new template's colour only if the user hasn't picked their own.
                  const current = templates.find((c) => c.id === templateId);
                  const customised = current !== undefined && accent.toLowerCase() !== current.accent.toLowerCase();
                  setValue("settings.templateId", t.id, { shouldDirty: true });
                  if (!customised) setValue("settings.accentColor", t.accent, { shouldDirty: true });
                }}
                className={`rounded-md border p-2 text-left transition ${active ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.accent }} />
                  <span className="text-sm font-medium text-zinc-900">{t.name}</span>
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">{t.description}</span>
                {type === "professional" ? (
                  <span className={`mt-1 inline-block rounded px-1 text-[10px] font-medium ${t.atsFriendly ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {t.atsFriendly ? "ATS-friendly" : "Not ATS-optimised"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <F.Select
          name="settings.paperSize"
          label="Paper size"
          options={[
            { value: "A4", label: "A4 (210 × 297 mm)" },
            { value: "LETTER", label: "US Letter (8.5 × 11 in)" },
          ]}
        />
        <div>
          <label htmlFor="accent" className="mb-1 block text-xs font-medium text-zinc-700">
            Accent colour
          </label>
          <div className="flex items-center gap-2">
            <input
              id="accent"
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(accent) ? accent : "#1f4e79"}
              onChange={(e) => setValue("settings.accentColor", e.target.value, { shouldDirty: true })}
              className="h-8 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-0.5"
            />
            <span className="font-mono text-xs text-zinc-500">{accent}</span>
          </div>
        </div>
        <F.Select name="settings.fontId" label="English font" options={Object.values(LATIN_FONTS).map((f) => ({ value: f.id, label: `${f.label} (${f.category})` }))} />
        <F.Select name="settings.banglaFontId" label="Bangla font" options={Object.values(BANGLA_FONTS).map((f) => ({ value: f.id, label: f.label }))} />
        {extra}
      </div>
    </SectionCard>
  );
}
