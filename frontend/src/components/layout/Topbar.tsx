"use client";

import { useMobileNav } from "@/components/layout/MobileNavContext";
import { ThemeMenu } from "@/components/layout/ThemeMenu";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  CheckSquare,
  Menu,
  MessageSquare,
  PanelLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function Topbar({
  onToggleCollapse,
}: {
  onToggleCollapse?: () => void;
}) {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const { toggle } = useMobileNav();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-sq-border bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
      {/* Mobile: buka drawer */}
      <button
        type="button"
        onClick={toggle}
        aria-label={t("topbar.openMenu")}
        className="rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      {/* Desktop: ciutkan sidebar */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={t("topbar.collapseSidebar")}
          className="hidden rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
        >
          <PanelLeft className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {/* Search */}
      <div className="relative hidden min-w-0 max-w-md flex-1 items-center md:flex">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-sq-slate" strokeWidth={2} />
        <input
          ref={searchRef}
          type="search"
          placeholder={t("topbar.searchPlaceholder")}
          className="h-9 w-full rounded-lg border border-sq-border bg-sq-bg pl-9 pr-16 text-sm text-sq-dark placeholder:text-sq-slate/70 focus:border-sq-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-sq-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
        />
        <kbd className="pointer-events-none absolute right-2 hidden items-center gap-0.5 rounded border border-sq-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-sq-slate dark:border-slate-700 dark:bg-slate-900 lg:inline-flex">
          Ctrl K
        </kbd>
      </div>

      {/* Search icon (mobile) */}
      <button
        type="button"
        aria-label={t("topbar.search")}
        onClick={() => searchRef.current?.focus()}
        className="rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
      >
        <Search className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
        {/* Pesan */}
        <button
          type="button"
          aria-label={t("topbar.messages")}
          className="relative hidden rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
        >
          <MessageSquare className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* Approval Saya */}
        <Button variant="secondary" icon={CheckSquare} className="hidden lg:inline-flex">
          {t("topbar.myApprovals")}
        </Button>

        {/* Notifikasi */}
        <button
          type="button"
          aria-label={t("topbar.notifications")}
          className="relative rounded-lg border border-sq-border p-2 text-sq-slate hover:bg-sq-soft dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Tema */}
        <LanguageSwitcher
          buttonClassName="border-sq-border bg-white text-sq-dark dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />

        <ThemeMenu />

        {/* Profil */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg border border-sq-border bg-white px-2 py-1.5 hover:bg-sq-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sq-navy to-sq-blue text-xs font-bold text-white">
            {(user?.name ?? "Budi Santoso").charAt(0).toUpperCase()}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-[10rem] truncate text-xs font-semibold text-sq-dark dark:text-slate-100">
              {user?.name ?? "Dr. Budi Santoso"}
            </span>
            <span className="block text-[11px] text-sq-slate">{t("topbar.directorRole")}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
