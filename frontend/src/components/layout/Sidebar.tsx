"use client";

import { useMobileNav } from "@/components/layout/MobileNavContext";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { HOME_MENU, MAIN_MENU } from "@/constants/menu";
import { SidebarNavGroup } from "@/components/layout/SidebarNavGroup";
import { cn } from "@/lib/cn";
import { flattenNavItems } from "@/lib/nav-utils";
import {
  ChevronLeft,
  LogOut,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-gradient-to-r from-sq-teal to-sq-blue text-white shadow-sm"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { t } = useTranslation();
  const { open, close } = useMobileNav();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-[100dvh] flex-col bg-sq-dark text-slate-200 transition-all duration-300 ease-in-out lg:relative lg:z-auto lg:h-screen lg:translate-x-0",
        collapsed ? "w-[240px] lg:w-[72px]" : "w-[240px]",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center gap-2.5 border-b border-white/10 px-4",
          collapsed && "lg:justify-center lg:px-0"
        )}
      >
        <Link
          href="/beranda"
          onClick={close}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sq-teal to-sq-blue text-sm font-bold text-white">
            SQ
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-base font-bold leading-tight text-white">
                SQ+
              </span>
              <span className="block truncate text-[11px] leading-tight text-slate-400">
                {t("common.appSubtitle")}
              </span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={close}
          aria-label={t("sidebar.closeMenu")}
          className="ml-auto rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Menu */}
      <nav className="sq-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <SidebarLink
          href={HOME_MENU.href}
          label={t(HOME_MENU.labelKey)}
          icon={HOME_MENU.icon}
          collapsed={collapsed}
          active={pathname === HOME_MENU.href}
          onNavigate={close}
        />

        {!collapsed && (
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("menu.mainModules")}
          </p>
        )}
        {MAIN_MENU.map((item) =>
          item.children && item.children.length > 0 ? (
            <SidebarNavGroup
              key={item.href}
              item={item}
              label={t(item.labelKey)}
              childLabels={Object.fromEntries(
                flattenNavItems(item.children).map((child) => [
                  child.labelKey,
                  t(child.labelKey),
                ])
              )}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={close}
            />
          ) : (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              icon={item.icon}
              collapsed={collapsed}
              active={isActive(pathname, item.href)}
              onNavigate={close}
            />
          )
        )}
      </nav>

      {/* Footer: profil ringkas + collapse */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sq-teal to-sq-blue text-xs font-bold text-white">
            {(user?.name ?? "Budi Santoso").charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name ?? "Dr. Budi Santoso"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {user?.email ?? "Direktur Utama"}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => logout()}
              aria-label={t("sidebar.logout")}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "mt-2 hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:flex",
              collapsed && "justify-center px-0"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                collapsed && "rotate-180"
              )}
              strokeWidth={2}
            />
            {!collapsed && <span>{t("sidebar.collapseMenu")}</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

/** Tombol aksi cepat opsional (mis. tambah data) — diekspor untuk reuse. */
export function SidebarQuickAction({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-sq-teal to-sq-blue px-3 py-2 text-xs font-semibold text-white"
    >
      <Plus className="h-4 w-4" strokeWidth={2.2} />
      {label}
    </button>
  );
}
