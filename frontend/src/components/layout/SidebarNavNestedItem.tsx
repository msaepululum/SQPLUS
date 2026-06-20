"use client";

import type { NavChild } from "@/constants/menu";
import { isModuleChildActive } from "@/lib/nav-utils";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SidebarNavNestedItemProps = {
  child: NavChild;
  label: string;
  childLabels: Record<string, string>;
  pathname: string;
  onNavigate: () => void;
};

export function SidebarNavNestedItem({
  child,
  label,
  childLabels,
  pathname,
  onNavigate,
}: SidebarNavNestedItemProps) {
  const nested = child.children ?? [];
  const groupActive = isModuleChildActive(pathname, child.href);
  const [open, setOpen] = useState(groupActive);

  useEffect(() => {
    if (groupActive) {
      setOpen(true);
    }
  }, [groupActive]);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
          groupActive
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 py-0.5 pl-2">
          {nested.map((item) => {
            const active = isModuleChildActive(pathname, item.href);
            const itemLabel = childLabels[item.labelKey] ?? item.labelKey;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-gradient-to-r from-sq-teal to-sq-blue text-white shadow-sm"
                      : "text-slate-500 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {itemLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
