"use client";

import { useId, useState, type ReactNode } from "react";
import { useController, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

export function FieldShell({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-zinc-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const c = cols === 1 ? "sm:grid-cols-1" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`grid grid-cols-1 gap-3 ${c}`}>{children}</div>;
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asStringArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

function groupOptions(options: readonly SelectOption[]): [string, SelectOption[]][] {
  const groups = new Map<string, SelectOption[]>();
  for (const o of options) {
    const key = o.group ?? "";
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }
  return [...groups.entries()];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ */
/* Typed field factory                                                 */
/* ------------------------------------------------------------------ */

interface BaseProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
}

/**
 * Field components bound to one form's value type, so `name` is checked against real paths:
 *   const F = createFields<ProfessionalDocument>();  <F.Text name="data.header.fullName" label="Full name" />
 */
export function createFields<T extends FieldValues>() {
  /** Builds a child path ("period" + ".start"); RHF paths are strings, TS can't prove the join is valid. */
  const child = (name: FieldPath<T>, key: string) => `${name}.${key}` as FieldPath<T>;

  function Text({ name, label, hint, className, placeholder, type = "text", autoComplete }: BaseProps<T> & {
    placeholder?: string;
    type?: "text" | "email" | "tel" | "url";
    autoComplete?: string;
  }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    return (
      <FieldShell id={id} label={label} hint={hint} error={fieldState.error?.message} className={className}>
        <input
          id={id}
          ref={ref}
          name={field.name}
          type={type}
          className="input"
          value={asString(field.value)}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={fieldState.error ? true : undefined}
          aria-describedby={fieldState.error ? `${id}-error` : undefined}
        />
      </FieldShell>
    );
  }

  function TextArea({ name, label, hint, className, placeholder, rows = 4 }: BaseProps<T> & { placeholder?: string; rows?: number }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    return (
      <FieldShell id={id} label={label} hint={hint} error={fieldState.error?.message} className={className}>
        <textarea
          id={id}
          ref={ref}
          name={field.name}
          rows={rows}
          className="input resize-y leading-relaxed"
          value={asString(field.value)}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder={placeholder}
          aria-invalid={fieldState.error ? true : undefined}
        />
      </FieldShell>
    );
  }

  /** Options with a `group` are rendered inside <optgroup>s, in first-seen group order. */
  function Select({ name, label, hint, className, options }: BaseProps<T> & { options: readonly SelectOption[] }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    return (
      <FieldShell id={id} label={label} hint={hint} error={fieldState.error?.message} className={className}>
        <select
          id={id}
          ref={ref}
          name={field.name}
          className="input"
          value={asString(field.value)}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
        >
          {groupOptions(options).map(([group, opts]) =>
            group ? (
              <optgroup key={group} label={group}>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            ),
          )}
        </select>
      </FieldShell>
    );
  }

  function Checkbox({ name, label, className }: BaseProps<T>) {
    const id = useId();
    const {
      field: { ref, ...field },
    } = useController<T>({ name });
    return (
      <label htmlFor={id} className={`inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700 ${className ?? ""}`}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
          checked={field.value === true}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
        />
        {label}
      </label>
    );
  }

  /** string[] edited as a textarea, one item per line (blank lines are kept while typing, dropped in the PDF). */
  function Lines({ name, label, hint, className, placeholder, rows = 4 }: BaseProps<T> & { placeholder?: string; rows?: number }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    return (
      <FieldShell id={id} label={label} hint={hint ?? "One item per line."} error={fieldState.error?.message} className={className}>
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          className="input resize-y leading-relaxed"
          value={asStringArray(field.value).join("\n")}
          onChange={(e) => field.onChange(e.target.value === "" ? [] : e.target.value.split("\n"))}
          onBlur={field.onBlur}
          placeholder={placeholder}
        />
      </FieldShell>
    );
  }

  /** string[] edited as comma-separated text. Keeps the raw text locally so typing ", " feels natural. */
  function Tags({ name, label, hint, className, placeholder }: BaseProps<T> & { placeholder?: string }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    const items = asStringArray(field.value);
    const joined = items.join(", ");
    const [text, setText] = useState(joined);
    const [lastJoined, setLastJoined] = useState(joined);
    const parse = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    // Re-sync when the value changes from outside (sample data, import, reset) — adjusted during render.
    if (joined !== lastJoined) {
      setLastJoined(joined);
      if (parse(text).join("\u0000") !== items.join("\u0000")) setText(joined);
    }
    return (
      <FieldShell id={id} label={label} hint={hint ?? "Separate with commas."} error={fieldState.error?.message} className={className}>
        <input
          id={id}
          ref={ref}
          className="input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            field.onChange(parse(e.target.value));
          }}
          onBlur={() => {
            setText(parse(text).join(", "));
            field.onBlur();
          }}
          placeholder={placeholder}
        />
      </FieldShell>
    );
  }

  /** "" | "YYYY" | "YYYY-MM" as an optional month select + year input. */
  function PartialDate({ name, label, hint, className, disabled }: BaseProps<T> & { disabled?: boolean }) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    const value = asString(field.value);
    // Year and month are kept locally so a month picked before the year (or a half-typed year) isn't lost.
    const [yearText, setYearText] = useState(value.slice(0, 4));
    const [month, setMonth] = useState(value.length >= 7 ? value.slice(5, 7) : "");
    const [lastValue, setLastValue] = useState(value);
    // Follow outside changes (sample data, import) that don't come from this input.
    if (value !== lastValue) {
      setLastValue(value);
      const emitted = yearText === "" ? "" : month && /^\d{4}$/.test(yearText) ? `${yearText}-${month}` : yearText;
      if (value !== emitted) {
        setYearText(value.slice(0, 4));
        setMonth(value.length >= 7 ? value.slice(5, 7) : "");
      }
    }
    const emit = (y: string, m: string) => {
      const next = y === "" ? "" : m && /^\d{4}$/.test(y) ? `${y}-${m}` : y;
      setLastValue(next);
      field.onChange(next);
    };
    return (
      <FieldShell id={id} label={label} hint={hint} error={fieldState.error?.message} className={className}>
        <div className="flex gap-1.5">
          <select
            aria-label="Month"
            className="input w-[42%] px-1.5"
            value={month}
            disabled={disabled}
            onChange={(e) => {
              setMonth(e.target.value);
              emit(yearText, e.target.value);
            }}
            onBlur={field.onBlur}
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>
          <input
            id={id}
            ref={ref}
            inputMode="numeric"
            maxLength={4}
            placeholder="Year"
            className="input"
            value={yearText}
            disabled={disabled}
            onChange={(e) => {
              const y = e.target.value.replace(/\D/g, "").slice(0, 4);
              setYearText(y);
              emit(y, month);
            }}
            onBlur={field.onBlur}
            aria-invalid={fieldState.error ? true : undefined}
          />
        </div>
      </FieldShell>
    );
  }

  /** { start, end, current } — "Present" checkbox disables the end date. */
  function DateRange({ name, label, presentLabel = "Present", className }: BaseProps<T> & { presentLabel?: string }) {
    const { watch } = useFormContext<T>();
    const current = watch(child(name, "current")) === true;
    return (
      <fieldset className={className}>
        {label ? <legend className="mb-1 text-xs font-medium text-zinc-700">{label}</legend> : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <PartialDate name={child(name, "start")} label={<span className="font-normal text-zinc-500">Start</span>} />
          <PartialDate name={child(name, "end")} label={<span className="font-normal text-zinc-500">End</span>} disabled={current} />
          <Checkbox name={child(name, "current")} label={presentLabel} className="pb-2" />
        </div>
      </fieldset>
    );
  }

  function IsoDate({ name, label, hint, className }: BaseProps<T>) {
    const id = useId();
    const {
      field: { ref, ...field },
      fieldState,
    } = useController<T>({ name });
    return (
      <FieldShell id={id} label={label} hint={hint} error={fieldState.error?.message} className={className}>
        <input
          id={id}
          ref={ref}
          type="date"
          className="input"
          value={asString(field.value)}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          aria-invalid={fieldState.error ? true : undefined}
        />
      </FieldShell>
    );
  }

  return { Text, TextArea, Select, Checkbox, Lines, Tags, PartialDate, DateRange, IsoDate, child };
}

/** Error summary for a whole array/object path (e.g. "Add at least one author"). */
export function useFieldError<T extends FieldValues>(name: FieldPath<T>): string | undefined {
  const { getFieldState, formState } = useFormContext<T>();
  return getFieldState(name, formState).error?.message;
}
