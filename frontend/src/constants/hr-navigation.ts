export type HrNavItem = {
  labelKey:
    | "hr.nav.summary"
    | "hr.nav.employees"
    | "hr.nav.attendance"
    | "hr.nav.leave"
    | "hr.nav.payroll";
  href: string;
};

export const HR_SUB_NAV: HrNavItem[] = [
  { labelKey: "hr.nav.summary", href: "/hr" },
  { labelKey: "hr.nav.employees", href: "/hr/employees" },
  { labelKey: "hr.nav.attendance", href: "/hr/attendance" },
  { labelKey: "hr.nav.leave", href: "/hr/leave" },
  { labelKey: "hr.nav.payroll", href: "/hr/payroll" },
];
