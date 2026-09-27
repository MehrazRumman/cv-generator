"use client";

import type { ReactNode } from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldArray,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useFieldError } from "./fields";
import { SortableList } from "./SortableList";

/**
 * A repeatable section (experience, education, publications…): add / remove / drag or ↑↓ to reorder.
 * `renderItem(prefix)` receives the row's path prefix, e.g. "data.experience.2".
 */
export function FieldArrayList<T extends FieldValues, N extends FieldArrayPath<T>>({
  name,
  create,
  titleOf,
  renderItem,
  addLabel,
  emptyText,
}: {
  name: N;
  create: () => FieldArray<T, N>;
  /** Row label from the row's current value. */
  titleOf: (item: FieldArray<T, N> | undefined, index: number) => string;
  renderItem: (prefix: `${N}.${number}`, index: number) => ReactNode;
  addLabel: string;
  emptyText?: string;
}) {
  const { control } = useFormContext<T>();
  // keyName keeps RHF's generated key separate from our own `id` field.
  const { fields, append, remove, move } = useFieldArray<T, N, "fieldKey">({ control, name, keyName: "fieldKey" });
  const values = useWatch({ control, name: name as unknown as FieldPath<T> }) as unknown as (FieldArray<T, N> | undefined)[] | undefined;
  const error = useFieldError<T>(name as unknown as FieldPath<T>);
  return (
    <>
      <SortableList
        keys={fields.map((f) => f.fieldKey)}
        titleOf={(i) => titleOf(values?.[i], i)}
        renderItem={(i) => renderItem(`${name}.${i}` as `${N}.${number}`, i)}
        onMove={move}
        onRemove={remove}
        onAdd={() => append(create())}
        addLabel={addLabel}
        emptyText={emptyText}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </>
  );
}
