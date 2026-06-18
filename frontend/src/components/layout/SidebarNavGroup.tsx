"use client";

import type { MenuItem } from "@/constants/menu";
import { isModuleChildActive } from "@/lib/nav-utils";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SidebarNavGroupProps = {
  item: MenuItem;
  label: string;
  childLabels: Record<string, string>;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
};

export function SidebarNavGroup({
  item,
  label,
  childLabels,
  pathname,
  collapsed,
  onNavigate,
}: SidebarNavGroupProps) {
  const moduleActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const [open, setOpen] = useState(moduleActive);
  const Icon = item.icon;
  const children = item.children ?? [];

  useEffect(() => {
    if (moduleActive) {
      setOpen(true);
    }
  }, [moduleActive]);

  if (collapsed) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        title={label}
        className={cn(
          "flex items-center justify-center rounded-lg px-0 py-2.5 transition-colors",
          moduleActive
            ? "bg-gradient-to-r from-sq-teal to-sq-blue text-white shadow-sm"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
          moduleActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul className="ml-4 flex flex-col gap-0.5 border-l border-white/10 py-0.5 pl-2">
          {children.map((child) => {
            const active = isModuleChildActive(pathname, child.href);
            const childLabel = childLabels[child.labelKey] ?? child.labelKey;

            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-gradient-to-r from-sq-teal to-sq-blue text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {childLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
