"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useState, type ReactNode } from "react";
import { ExpandAllContext } from "./SectionCard";

interface SortableItemProps {
  id: string;
  index: number;
  count: number;
  title: string;
  invalid: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: ReactNode;
  initiallyOpen: boolean;
}

function SortableItem({ id, index, count, title, invalid, onMove, onRemove, children, initiallyOpen }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [open, setOpen] = useState(initiallyOpen);
  // A failed download opens rows with errors; collapsed rows don't render their fields, so the
  // errors would otherwise be invisible. The errors can arrive a render after the signal, so the
  // row opens on the first invalid render after each failed download (once, so it can be closed).
  const expandAll = useContext(ExpandAllContext);
  const [openedFor, setOpenedFor] = useState(expandAll);
  if (invalid && openedFor !== expandAll) {
    setOpenedFor(expandAll);
    setOpen(true);
  }
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-md border bg-zinc-50/60 ${isDragging ? "z-10 border-indigo-300 shadow-lg" : invalid ? "border-red-300 dark:border-red-500/60" : "border-zinc-200"}`}
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="icon-btn cursor-grab touch-none active:cursor-grabbing"
          aria-label={`Drag to reorder ${title}`}
        >
          ⠿
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className={`flex-1 truncate text-left text-sm font-medium ${invalid ? "text-red-700 dark:text-red-400" : "text-zinc-800"}`} aria-expanded={open}>
          {title}
        </button>
        <button type="button" className="icon-btn" onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label="Move up">
          ↑
        </button>
        <button type="button" className="icon-btn" onClick={() => onMove(index, index + 1)} disabled={index === count - 1} aria-label="Move down">
          ↓
        </button>
        <button
          type="button"
          className="icon-btn hover:bg-red-50 hover:text-red-600 dark:text-red-400"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${title}`}
        >
          ✕
        </button>
      </div>
      {open ? <div className="space-y-3 border-t border-zinc-200 bg-surface px-3 py-3">{children}</div> : null}
    </li>
  );
}

/**
 * A reorderable list for useFieldArray entries: drag handle, up/down buttons, remove, add.
 * `keys` are the field-array keys (stable per row); `titleOf(i)` labels the collapsed row.
 */
export function SortableList({
  keys,
  titleOf,
  invalidOf,
  renderItem,
  onMove,
  onRemove,
  onAdd,
  addLabel,
  emptyText,
}: {
  keys: string[];
  titleOf: (index: number) => string;
  /** True when the row has validation errors (outlined in red, opened by a failed download). */
  invalidOf?: (index: number) => boolean;
  renderItem: (index: number) => ReactNode;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  addLabel: string;
  emptyText?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // Newly added rows open automatically; existing ones start collapsed when the list is long.
  const [initialKeys] = useState(() => new Set(keys));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = keys.indexOf(String(active.id));
    const to = keys.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  };

  return (
    <div className="space-y-2">
      {keys.length === 0 && emptyText ? <p className="text-xs text-zinc-500">{emptyText}</p> : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={keys} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {keys.map((key, index) => (
              <SortableItem
                key={key}
                id={key}
                index={index}
                count={keys.length}
                title={titleOf(index)}
                invalid={invalidOf?.(index) ?? false}
                onMove={onMove}
                onRemove={onRemove}
                initiallyOpen={!initialKeys.has(key) || keys.length <= 2}
              >
                {renderItem(index)}
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button type="button" className="btn w-full border-dashed text-zinc-600" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}
