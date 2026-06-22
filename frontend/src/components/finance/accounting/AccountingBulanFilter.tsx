"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";

const BULAN_OPTIONS = [
  { value: "", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function useAccountingBulanFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bulanParam = searchParams.get("bulan");
  const bulan = bulanParam ? Number(bulanParam) : undefined;

  const setBulan = useCallback(
    (value: number | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("bulan", String(value));
      else params.delete("bulan");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { bulan, setBulan };
}

export function AccountingBulanToolbarFilter() {
  const { bulan, setBulan } = useAccountingBulanFilter();

  return (
    <ToolbarFilter
      label="Bulan"
      value={bulan ? String(bulan) : ""}
      onChange={(v) => setBulan(v ? Number(v) : undefined)}
    >
      {BULAN_OPTIONS.map((o) => (
        <option key={o.value || "all"} value={o.value}>
          {o.label}
        </option>
      ))}
    </ToolbarFilter>
  );
}
