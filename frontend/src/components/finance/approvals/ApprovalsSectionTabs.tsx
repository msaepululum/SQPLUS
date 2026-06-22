"use client";

import type { ApprovalsSection } from "@/constants/approvals-pages";
import { cn } from "@/lib/cn";

type ApprovalsSectionTabsProps = {
  sections: ApprovalsSection[];
  labels: Record<string, string>;
  activeId: string;
  onChange: (id: string) => void;
};

export function ApprovalsSectionTabs({
  sections,
  labels,
  activeId,
  onChange,
}: ApprovalsSectionTabsProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-slate-100 p-1 sq-scroll">
      <div className="flex min-w-max gap-0.5">
        {sections.map((section, index) => {
          const isActive = section.id === activeId;
          const label = labels[section.labelKey] ?? section.labelKey;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors sm:px-3.5 sm:text-[0.8125rem]",
                isActive
                  ? "bg-[#0d6e63] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-800"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.6875rem] font-bold",
                  isActive ? "bg-white/25 text-white" : "text-slate-400"
                )}
              >
                {index + 1}
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
