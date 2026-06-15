"use client";

import { HR_SUB_NAV } from "@/constants/hr-navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HrSubNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 px-1 pb-3 sm:mx-0 sm:flex-wrap sm:overflow-visible">
      {HR_SUB_NAV.map((item) => {
        const active =
          item.href === "/hr"
            ? pathname === "/hr"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sky-100 text-sky-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
