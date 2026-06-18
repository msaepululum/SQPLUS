"use client";

import {
  useTheme,
  type ThemePreference,
} from "@/components/providers/ThemeProvider";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPTIONS: {
  value: ThemePreference;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
  descriptionKey:
    | "theme.lightDescription"
    | "theme.darkDescription"
    | "theme.systemDescription";
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    labelKey: "theme.light",
    descriptionKey: "theme.lightDescription",
    icon: Sun,
  },
  {
    value: "dark",
    labelKey: "theme.dark",
    descriptionKey: "theme.darkDescription",
    icon: Moon,
  },
  {
    value: "system",
    labelKey: "theme.system",
    descriptionKey: "theme.systemDescription",
    icon: Monitor,
  },
];

function TriggerIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "dark") return <Moon className="h-5 w-5" strokeWidth={2} />;
  if (preference === "light") return <Sun className="h-5 w-5" strokeWidth={2} />;
  return <Monitor className="h-5 w-5" strokeWidth={2} />;
}

export function ThemeMenu() {
  const { preference, setTheme } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectTheme(value: ThemePreference) {
    setTheme(value);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("theme.select")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <TriggerIcon preference={preference} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-sq-border bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-sq-slate">
            {t("theme.label")}
          </p>
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => selectTheme(opt.value)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-sq-soft dark:hover:bg-slate-800",
                  active && "bg-sq-soft/80 dark:bg-slate-800/80"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-sq-blue dark:text-sky-400" : "text-sq-slate"
                  )}
                  strokeWidth={2}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-sq-dark dark:text-slate-100">
                    {t(opt.labelKey)}
                  </span>
                  <span className="block text-[11px] text-sq-slate">
                    {t(opt.descriptionKey)}
                  </span>
                </span>
                {active && (
                  <Check
                    className="h-4 w-4 shrink-0 text-sq-blue dark:text-sky-400"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
