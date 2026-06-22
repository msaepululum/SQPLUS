"use client";

import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

type ExecutiveInsightModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export function ExecutiveInsightModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide,
}: ExecutiveInsightModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:rounded-xl ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ei-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 id="ei-modal-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <Button type="button" variant="ghost" className="h-8 w-8 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sq-scroll">{children}</div>
      </div>
    </div>
  );
}
