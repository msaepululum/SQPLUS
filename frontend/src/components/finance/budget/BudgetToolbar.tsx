"use client";

import { cn } from "@/lib/cn";
import { ChevronDown, Search } from "lucide-react";

/** Segmented control — enterprise pill tabs */
export function ToolbarSegmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; shortLabel?: string; icon?: React.ReactNode; hint?: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg bg-slate-100/90 p-0.5 ring-1 ring-inset ring-slate-200/80",
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[0.4375rem] px-2.5 py-1.5 text-[11px] font-semibold transition-all sm:px-3",
              active
                ? "bg-white text-[#0d6e63] shadow-sm ring-1 ring-slate-200/90"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">{opt.shortLabel ?? opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Compact filter dengan label uppercase micro */
export function ToolbarFilter({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="truncate text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-[6.5rem] max-w-[10.5rem] appearance-none truncate rounded-md border border-slate-200/90 bg-white py-1.5 pl-2 pr-7 text-[11px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          strokeWidth={2.5}
        />
      </div>
    </label>
  );
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder = "Cari...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
        Cari
      </span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-[30px] w-full min-w-[7rem] max-w-[11rem] rounded-md border border-slate-200/90 bg-white py-1.5 pl-7 pr-2 text-[11px] text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>
    </label>
  );
}

export function ToolbarKpi({
  items,
  className,
}: {
  items: { label: string; value: string; tone?: "default" | "plan" | "actual" | "muted" }[];
  className?: string;
}) {
  const toneClass = {
    default: "text-slate-700",
    plan: "text-[#0d6e63]",
    actual: "text-blue-700",
    muted: "text-slate-500",
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]",
        className
      )}
    >
      {items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="hidden text-slate-300 sm:inline">|</span>}
          <span className="text-slate-400">{item.label}</span>
          <span className={cn("font-semibold tabular-nums", toneClass[item.tone ?? "default"])}>
            {item.value}
          </span>
        </span>
      ))}
    </div>
  );
}

export function ToolbarShell({
  children,
  footer,
  className,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-2.5 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        {children}
      </div>
      {footer && (
        <div className="border-t border-slate-100/90 bg-slate-50/50 px-3 py-1.5">{footer}</div>
      )}
    </div>
  );
}

export function TableLegend({
  items,
  className,
}: {
  items: { color: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-[10px] text-slate-500", className)}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", item.color)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
