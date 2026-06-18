"use client";

import { useLocale, type Locale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPTIONS: { value: Locale; labelKey: "language.id" | "language.en" }[] = [
  { value: "id", labelKey: "language.id" },
  { value: "en", labelKey: "language.en" },
];

type LanguageSwitcherProps = {
  className?: string;
  buttonClassName?: string;
  showChevron?: boolean;
};

export function LanguageSwitcher({
  className,
  buttonClassName,
  showChevron = true,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
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

  function selectLanguage(value: Locale) {
    setLocale(value);
    setOpen(false);
  }

  const currentLabel = locale === "id" ? t("language.id") : t("language.en");

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language.select")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sq-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#071A3D] shadow-sm sm:gap-2 sm:px-3 sm:text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
          buttonClassName
        )}
      >
        <Globe className="h-3.5 w-3.5 text-sq-slate" strokeWidth={2} />
        {currentLabel}
        {showChevron && (
          <ChevronDown className="h-3.5 w-3.5 text-sq-slate" strokeWidth={2} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-sq-border bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-sq-slate">
            {t("language.label")}
          </p>
          {OPTIONS.map((opt) => {
            const active = locale === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => selectLanguage(opt.value)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-sq-soft dark:hover:bg-slate-800",
                  active && "bg-sq-soft/80 dark:bg-slate-800/80"
                )}
              >
                <span className="min-w-0 flex-1 text-sq-dark dark:text-slate-100">
                  {t(opt.labelKey)}
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
