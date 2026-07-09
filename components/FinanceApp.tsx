"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Entry } from "@/lib/types";
import { computeBalance } from "@/lib/format";
import { BalanceHeader } from "./BalanceHeader";
import { EntryColumn } from "./EntryColumn";
import { EntryForm } from "./EntryForm";

export function FinanceApp() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/entries");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) {
          setEntries(data.entries as Entry[]);
          setLoadError("");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { balance, sponsors, expenditures, dues } = computeBalance(entries);
  const sponsorEntries = entries.filter((e) => e.type === "sponsor");
  const expenditureEntries = entries.filter((e) => e.type === "expenditure");
  const dueEntries = entries.filter((e) => e.type === "due");

  function handleCreated(entry: Entry) {
    setEntries((prev) => [entry, ...prev]);
  }

  async function handleDelete(id: string, pin: string) {
    const res = await fetch(`/api/entries/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="flex min-h-full flex-col">
      <BalanceHeader
        balance={balance}
        sponsors={sponsors}
        expenditures={expenditures}
        dues={dues}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 sm:px-10 sm:py-10">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        ) : loadError ? (
          <p className="text-sm text-[var(--negative)]">{loadError}</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-10 lg:flex-row lg:gap-12"
          >
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
              <EntryColumn
                title="Sponsors"
                total={sponsors}
                entries={sponsorEntries}
                emptyLabel="No sponsors yet"
                accent="gold"
                onDelete={handleDelete}
              />
              <EntryColumn
                title="Expenditures"
                total={expenditures}
                entries={expenditureEntries}
                emptyLabel="No expenditures yet"
                accent="muted"
                onDelete={handleDelete}
              />
              <EntryColumn
                title="Member dues"
                total={dues}
                entries={dueEntries}
                emptyLabel="No dues yet"
                accent="due"
                nameAsTitle
                onDelete={handleDelete}
              />
            </div>
            <EntryForm onCreated={handleCreated} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
