"use client";

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import type { Entry, EntryType } from "@/lib/types";

type EntryFormProps = {
  onCreated: (entry: Entry) => void;
};

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "sponsor", label: "Sponsor" },
  { value: "expenditure", label: "Expense" },
  { value: "due", label: "Due" },
];

export function EntryForm({ onCreated }: EntryFormProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<EntryType>("sponsor");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function onAmountChange(value: string) {
    setAmount(value.replace(/\D/g, ""));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const amountNum = Number(amount);
    if (!name.trim() || !reason.trim()) {
      setError(
        type === "due"
          ? "Member name and note are required"
          : "Name and reason are required",
      );
      return;
    }
    if (!amount || !Number.isInteger(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount in rupees");
      return;
    }
    if (!pin) {
      setError("PIN is required");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          reason: reason.trim(),
          amount: amountNum,
          type,
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");

      onCreated(data.entry as Entry);
      setReason("");
      setAmount("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  const isDue = type === "due";

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="w-full border-t border-[var(--line)] pt-8 lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
    >
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--ink)]">
        Add entry
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            Type
          </span>
          <div
            role="group"
            aria-label="Entry type"
            className="grid grid-cols-3 gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] p-1"
          >
            {TYPE_OPTIONS.map(({ value, label }) => {
              const active = type === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  aria-pressed={active}
                  className={`relative rounded-[0.25rem] px-1 py-2 text-[0.65rem] font-semibold tracking-wide sm:text-xs ${
                    active
                      ? "text-[#0a0a0a]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="type-toggle-pill"
                      className="absolute inset-0 rounded-[0.25rem] shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                      style={{ background: "var(--gold-gradient)" }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            {isDue ? "Member" : "Name"}
          </span>
          <input
            className="field-gold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isDue ? "Who owes this" : "Who is adding this"}
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            {isDue ? "Note" : "Reason"}
          </span>
          <input
            className="field-gold"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isDue ? "What they owe for" : "What for"}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            Amount (₹)
          </span>
          <input
            className="field-gold"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            PIN
          </span>
          <input
            className="field-gold"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            required
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="btn-gold mt-1 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add"}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[var(--negative)]"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[var(--gold)]"
          >
            Added
          </motion.p>
        )}
      </form>
    </motion.aside>
  );
}
