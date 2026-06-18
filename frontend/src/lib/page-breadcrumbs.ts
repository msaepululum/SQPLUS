import type { Crumb } from "@/components/layout/Breadcrumbs";
import { FINANCE_SUB_NAV } from "@/constants/finance-navigation";
import { HR_SUB_NAV } from "@/constants/hr-navigation";

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
  children: readonly { labelKey: string; href: string }[],
  t: TranslateFn
): string | null {
  const match = children.find(
    (child) =>
      pathname === child.href || pathname.startsWith(`${child.href}/`)
  );
  return match ? t(match.labelKey) : null;
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
      const childLabel = resolveChildLabel(pathname, mod.children, t);
      if (childLabel) {
        crumbs.push({ label: childLabel });
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
