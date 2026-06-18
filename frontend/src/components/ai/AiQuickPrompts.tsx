"use client";

const QUICK_PROMPTS = [
  "Ringkasan keuangan bulan ini",
  "Approval pending saya",
  "Stok kritis",
  "Ringkasan eksekutif",
  "Ringkasan karyawan",
  "Realisasi anggaran",
];

type AiQuickPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function AiQuickPrompts({ onSelect, disabled }: AiQuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-sq-border bg-white px-3 py-1.5 text-xs font-medium text-sq-dark transition-colors hover:border-sq-teal hover:bg-sq-teal/5 hover:text-sq-navy disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
