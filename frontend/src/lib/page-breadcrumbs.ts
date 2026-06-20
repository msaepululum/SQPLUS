import type { Crumb } from "@/components/layout/Breadcrumbs";
import { FINANCE_SUB_NAV } from "@/constants/finance-navigation";
import { HR_SUB_NAV } from "@/constants/hr-navigation";
import { resolveNavTrail } from "@/lib/nav-utils";

type TranslateFn = (key: string) => string;

type ModuleRoute = {
  prefix: string;
  moduleKey: string;
  href: string;
  children?: readonly { labelKey: string; href: string }[];
};

const MODULE_ROUTES: ModuleRoute[] = [
  {
    prefix: "/finance",
    moduleKey: "menu.finance",
    href: "/finance",
    children: FINANCE_SUB_NAV,
  },
  {
    prefix: "/hr",
    moduleKey: "menu.hr",
    href: "/hr",
    children: HR_SUB_NAV,
  },
  {
    prefix: "/procurement",
    moduleKey: "menu.procurement",
    href: "/procurement",
  },
  {
    prefix: "/supply-chain",
    moduleKey: "menu.supplyChain",
    href: "/supply-chain",
  },
];

const STANDALONE_LABELS: Record<string, string> = {
  "/profile": "Profil",
  "/notifications": "Notifikasi",
  "/approvals": "Persetujuan",
  "/system": "Sistem",
};

function homeCrumb(t: TranslateFn): Crumb {
  return { label: t("menu.home"), href: "/beranda" };
}

function resolveChildLabel(
  pathname: string,
  children: readonly { labelKey: string; href: string; children?: readonly { labelKey: string; href: string }[] }[],
  t: TranslateFn
): { crumbs: Crumb[] } | null {
  const trail = resolveNavTrail(pathname, children, t);
  if (!trail?.length) return null;
  return { crumbs: trail };
}

export function buildPageBreadcrumbs(pathname: string, t: TranslateFn): Crumb[] {
  const home = homeCrumb(t);

  if (pathname === "/beranda" || pathname === "/") {
    return [{ label: t("menu.home") }];
  }

  for (const mod of MODULE_ROUTES) {
    if (pathname !== mod.prefix && !pathname.startsWith(`${mod.prefix}/`)) {
      continue;
    }

    const crumbs: Crumb[] = [home, { label: t(mod.moduleKey), href: mod.href }];

    if (mod.children) {
      const resolved = resolveChildLabel(pathname, mod.children, t);
      if (resolved) {
        crumbs.push(...resolved.crumbs);
        return crumbs;
      }
    }

    if (pathname !== mod.prefix) {
      crumbs.push({ label: pathname.split("/").pop() ?? "" });
    }

    return crumbs;
  }

  const standalone = STANDALONE_LABELS[pathname];
  if (standalone) {
    return [home, { label: standalone }];
  }

  return [home];
}
