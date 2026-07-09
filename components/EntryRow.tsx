"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Entry } from "@/lib/types";
import { formatRupee } from "@/lib/format";

type EntryRowProps = {
  entry: Entry;
  nameAsTitle?: boolean;
  onDelete: (id: string, pin: string) => Promise<void>;
};

export function EntryRow({
  entry,
  nameAsTitle = false,
  onDelete,
}: EntryRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!pin.trim()) {
      setError("Enter PIN");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onDelete(entry.id, pin);
      setConfirming(false);
      setPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const title = nameAsTitle ? entry.name : entry.reason;
  const subtitle = nameAsTitle ? entry.reason : `by ${entry.name}`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group border-b border-[var(--line)] py-4 last:border-b-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--ink)]">{title}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-lg tabular-nums text-[var(--gold-bright)]">
            {formatRupee(entry.amount)}
          </span>
          {!confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded px-1.5 py-0.5 text-xs text-[var(--muted)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--negative)] focus:opacity-100"
              aria-label={`Delete ${title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="field-gold w-24 !py-1.5"
                autoFocus
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="rounded-md border border-[var(--negative)] bg-[rgba(196,122,106,0.15)] px-3 py-1.5 text-xs font-medium text-[var(--negative)] transition hover:bg-[rgba(196,122,106,0.28)] disabled:opacity-50"
              >
                {busy ? "…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setPin("");
                  setError("");
                }}
                className="rounded-md px-2 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-[var(--negative)]">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
