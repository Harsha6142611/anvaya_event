"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatRupee } from "@/lib/format";

function AnimatedAmount({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 90, damping: 22 });
  const display = useTransform(spring, (v) => formatRupee(Math.round(v)));
  const [text, setText] = useState(formatRupee(value));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display]);

  return <span>{text}</span>;
}

type BalanceHeaderProps = {
  balance: number;
  sponsors: number;
  expenditures: number;
  dues: number;
};

export function BalanceHeader({
  balance,
  sponsors,
  expenditures,
  dues,
}: BalanceHeaderProps) {
  const positive = balance >= 0;

  return (
    <header className="relative overflow-hidden border-b border-[var(--line)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(212,175,55,0.12),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(122,92,45,0.15),transparent_45%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25),transparent_70%)] blur-xl" />
            <Image
              src="/anvaya-logo.png"
              alt="Anvaya 2026 — Many branches, one belonging"
              width={160}
              height={160}
              priority
              className="relative h-28 w-28 rounded-full object-cover shadow-[0_0_40px_rgba(212,175,55,0.2)] sm:h-36 sm:w-36 md:h-40 md:w-40"
            />
          </motion.div>

          <div className="text-center sm:text-left">
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-[var(--gold)]">
              Event finance · 2026
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-[0.08em] text-gold sm:text-5xl md:text-6xl">
              Anvaya
            </h1>
            <p className="mt-2 max-w-sm text-xs uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[0.7rem]">
              Many branches, one belonging
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Track sponsors, expenditures, and member dues. Balance updates as
              you go.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-center sm:text-right lg:min-w-[14rem]"
        >
          <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            Current balance
          </p>
          <p
            className={`font-[family-name:var(--font-display)] text-4xl tabular-nums tracking-tight sm:text-5xl ${
              positive
                ? "text-[var(--gold-bright)]"
                : "text-[var(--negative)]"
            }`}
          >
            <AnimatedAmount value={balance} />
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-[var(--muted)] sm:justify-end">
            <span>
              In{" "}
              <span className="tabular-nums text-[var(--gold-bright)]">
                {formatRupee(sponsors)}
              </span>
            </span>
            <span>
              Out{" "}
              <span className="tabular-nums text-[var(--ink)]">
                {formatRupee(expenditures)}
              </span>
            </span>
            <span>
              Due{" "}
              <span className="tabular-nums text-[var(--gold)]">
                {formatRupee(dues)}
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
