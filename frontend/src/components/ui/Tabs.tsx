"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";

export type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  className?: string;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(
    defaultValue ?? items[0]?.key ?? ""
  );
  const active = value ?? internal;

  function handleSelect(key: string) {
    if (value === undefined) setInternal(key);
    onChange?.(key);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto border-b border-sq-border dark:border-slate-800 sq-scroll",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleSelect(item.key)}
            className={cn(
              "relative shrink-0 px-3.5 py-2.5 text-xs font-semibold transition-colors",
              isActive
                ? "text-sq-blue dark:text-sky-400"
                : "text-sq-slate hover:text-sq-dark dark:hover:text-slate-200"
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors",
                isActive ? "bg-sq-blue" : "bg-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
