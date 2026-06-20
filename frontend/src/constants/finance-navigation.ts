import { BUDGET_SUB_NAV } from "./budget-navigation";
import { REVENUE_SUB_NAV } from "./revenue-navigation";

export type FinanceSubNavItem = {
  labelKey: string;
  href: string;
  children?: readonly FinanceSubNavItem[];
};

export type FinanceNavItem = {
  labelKey:
    | "finance.nav.dashboard"
    | "finance.nav.budget"
    | "finance.nav.revenue"
    | "finance.nav.expenditure"
    | "finance.nav.cashBank"
    | "finance.nav.receivablesPayables"
    | "finance.nav.payments"
    | "finance.nav.accounting"
    | "finance.nav.reports"
    | "finance.nav.executiveInsight"
    | "finance.nav.approvals"
    | "finance.nav.settings";
  href: string;
  children?: readonly FinanceSubNavItem[];
};

/** Sub-menu modul Keuangan & RenGar */
export const FINANCE_SUB_NAV: FinanceNavItem[] = [
  { labelKey: "finance.nav.dashboard", href: "/finance" },
  {
    labelKey: "finance.nav.budget",
    href: "/finance/budget",
    children: BUDGET_SUB_NAV,
  },
  {
    labelKey: "finance.nav.revenue",
    href: "/finance/revenue",
    children: REVENUE_SUB_NAV,
  },
  { labelKey: "finance.nav.expenditure", href: "/finance/expenditure" },
  { labelKey: "finance.nav.cashBank", href: "/finance/cash-bank" },
  { labelKey: "finance.nav.receivablesPayables", href: "/finance/receivables-payables" },
  { labelKey: "finance.nav.payments", href: "/finance/payments" },
  { labelKey: "finance.nav.accounting", href: "/finance/accounting" },
  { labelKey: "finance.nav.reports", href: "/finance/reports" },
  { labelKey: "finance.nav.executiveInsight", href: "/finance/executive-insight" },
  { labelKey: "finance.nav.approvals", href: "/finance/approvals" },
  { labelKey: "finance.nav.settings", href: "/finance/settings" },
];

import { isModuleChildActive } from "@/lib/nav-utils";

export function isFinanceNavActive(pathname: string, href: string): boolean {
  return isModuleChildActive(pathname, href);
}
