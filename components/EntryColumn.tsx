"use client";

import { AnimatePresence } from "framer-motion";
import type { Entry } from "@/lib/types";
import { formatRupee } from "@/lib/format";
import { EntryRow } from "./EntryRow";

type EntryColumnProps = {
  title: string;
  total: number;
  entries: Entry[];
  emptyLabel: string;
  accent: "gold" | "muted" | "due";
  nameAsTitle?: boolean;
  onDelete: (id: string, pin: string) => Promise<void>;
};

export function EntryColumn({
  title,
  total,
  entries,
  emptyLabel,
  accent,
  nameAsTitle = false,
  onDelete,
}: EntryColumnProps) {
  const accentClass =
    accent === "gold"
      ? "text-[var(--gold-bright)]"
      : accent === "due"
        ? "text-[var(--gold)]"
        : "text-[var(--gold-deep)]";

  return (
    <section className="min-h-0 flex-1">
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--ink)]">
          {title}
        </h2>
        <span
          className={`font-[family-name:var(--font-display)] text-lg tabular-nums ${accentClass}`}
        >
          {formatRupee(total)}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="py-8 text-sm text-[var(--muted)]">{emptyLabel}</p>
      ) : (
        <ul className="max-h-[min(28rem,55vh)] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                nameAsTitle={nameAsTitle}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
