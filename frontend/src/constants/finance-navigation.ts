import { SETTINGS_SUB_NAV } from "./settings-navigation";
import { APPROVALS_SUB_NAV } from "./approvals-navigation";
import { ACCOUNTING_SUB_NAV } from "./accounting-navigation";
import { BUDGET_SUB_NAV } from "./budget-navigation";
import { EXECUTIVE_INSIGHT_SUB_NAV } from "./executive-insight-navigation";
import { REPORTS_SUB_NAV } from "./reports-navigation";
import { CASH_BANK_SUB_NAV } from "./cash-bank-navigation";
import { EXPENDITURE_SUB_NAV } from "./expenditure-navigation";
import { PAYMENTS_SUB_NAV } from "./payments-navigation";
import { TAX_SUB_NAV } from "./tax-navigation";
import { RECEIVABLES_PAYABLES_SUB_NAV } from "./receivables-payables-navigation";
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
    | "finance.nav.tax"
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
  {
    labelKey: "finance.nav.expenditure",
    href: "/finance/expenditure",
    children: EXPENDITURE_SUB_NAV,
  },
  {
    labelKey: "finance.nav.cashBank",
    href: "/finance/cash-bank",
    children: CASH_BANK_SUB_NAV,
  },
  {
    labelKey: "finance.nav.receivablesPayables",
    href: "/finance/receivables-payables",
    children: RECEIVABLES_PAYABLES_SUB_NAV,
  },
  {
    labelKey: "finance.nav.payments",
    href: "/finance/payments",
    children: PAYMENTS_SUB_NAV,
  },
  {
    labelKey: "finance.nav.tax",
    href: "/finance/tax",
    children: TAX_SUB_NAV,
  },
  {
    labelKey: "finance.nav.accounting",
    href: "/finance/accounting",
    children: ACCOUNTING_SUB_NAV,
  },
  {
    labelKey: "finance.nav.reports",
    href: "/finance/reports",
    children: REPORTS_SUB_NAV,
  },
  {
    labelKey: "finance.nav.executiveInsight",
    href: "/finance/executive-insight",
    children: EXECUTIVE_INSIGHT_SUB_NAV,
  },
  {
    labelKey: "finance.nav.approvals",
    href: "/finance/approvals",
    children: APPROVALS_SUB_NAV,
  },
  {
    labelKey: "finance.nav.settings",
    href: "/finance/settings",
    children: SETTINGS_SUB_NAV,
  },
];

import { isModuleChildActive } from "@/lib/nav-utils";

export function isFinanceNavActive(pathname: string, href: string): boolean {
  return isModuleChildActive(pathname, href);
}
