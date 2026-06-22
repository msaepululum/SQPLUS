"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { fetchBudgetYears } from "@/services/budgetYearService";
import type { BudgetYear } from "@/types/budget-year";
import { cn } from "@/lib/cn";
import { ChevronDown, Loader2 } from "lucide-react";

type BudgetYearScopeValue = {
  years: BudgetYear[];
  loading: boolean;
  budgetYearId: number | null;
  budgetYear: BudgetYear | null;
  setBudgetYearId: (id: number) => void;
  reloadYears: () => Promise<void>;
};

const BudgetYearScopeContext = createContext<BudgetYearScopeValue | null>(null);

export function useBudgetYearScope(): BudgetYearScopeValue {
  const ctx = useContext(BudgetYearScopeContext);
  if (!ctx) {
    throw new Error("useBudgetYearScope harus dipakai di dalam BudgetYearScopeProvider");
  }
  return ctx;
}

export function BudgetYearScopeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [years, setYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBudgetYears();
      setYears(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadYears();
  }, [reloadYears]);

  const budgetYearIdFromUrl = searchParams.get("budget_year_id");
  const budgetYearId = budgetYearIdFromUrl ? Number(budgetYearIdFromUrl) : null;

  const budgetYear = useMemo(
    () => years.find((y) => y.id === budgetYearId) ?? null,
    [years, budgetYearId]
  );

  useEffect(() => {
    if (loading || years.length === 0) return;
    if (budgetYearId && years.some((y) => y.id === budgetYearId)) return;

    const active = years.find((y) => y.status === "active");
    const fallback = active ?? years[0];
    if (!fallback) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("budget_year_id", String(fallback.id));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [loading, years, budgetYearId, pathname, router, searchParams]);

  const setBudgetYearId = useCallback(
    (id: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("budget_year_id", String(id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const value = useMemo(
    () => ({
      years,
      loading,
      budgetYearId: budgetYear?.id ?? null,
      budgetYear,
      setBudgetYearId,
      reloadYears,
    }),
    [years, loading, budgetYear, setBudgetYearId, reloadYears]
  );

  return (
    <BudgetYearScopeContext.Provider value={value}>{children}</BudgetYearScopeContext.Provider>
  );
}

export function BudgetYearScopeBar({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { years, loading, budgetYearId, budgetYear, setBudgetYearId } = useBudgetYearScope();

  if (compact) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/60 px-2 py-1 shadow-sm ring-1 ring-slate-100",
          className
        )}
      >
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Tahun
        </span>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        ) : years.length === 0 ? (
          <span className="text-[10px] text-amber-600">—</span>
        ) : (
          <div className="relative">
            <select
              value={budgetYearId ? String(budgetYearId) : ""}
              onChange={(e) => setBudgetYearId(Number(e.target.value))}
              className="h-7 min-w-[5.5rem] appearance-none rounded-md border border-slate-200/90 bg-white py-0 pl-2 pr-6 text-[11px] font-semibold text-[#0d6e63] shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.tahun}
                  {y.status === "active" ? " · Aktif" : y.status === "closed" ? " · Tutup" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>
        )}
        {budgetYear && (
          <span
            className="hidden text-[10px] tabular-nums text-slate-400 2xl:inline"
            title={budgetYear.nama}
          >
            {budgetYear.tanggal_mulai.slice(5, 10)}–{budgetYear.tanggal_selesai.slice(5, 10)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("mt-3 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5", className)}>
      <div className="min-w-[12rem] flex-1">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">
            Tahun Anggaran <span className="text-red-500">*</span>
          </span>
          {loading ? (
            <div className="flex h-10 items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat tahun...
            </div>
          ) : years.length === 0 ? (
            <p className="text-xs text-amber-600">
              Belum ada tahun anggaran. Tambahkan di Referensi → Tahun Anggaran.
            </p>
          ) : (
            <Select
              value={budgetYearId ? String(budgetYearId) : ""}
              onChange={(e) => setBudgetYearId(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.tahun} — {y.nama}
                  {y.status === "active" ? " (Aktif)" : y.status === "closed" ? " (Ditutup)" : ""}
                </option>
              ))}
            </Select>
          )}
        </label>
      </div>
      {budgetYear && (
        <p className="text-xs text-slate-500">
          Periode: {budgetYear.tanggal_mulai.slice(0, 10)} s/d{" "}
          {budgetYear.tanggal_selesai.slice(0, 10)}
        </p>
      )}
    </Card>
  );
}

/** Filter tahun inline — selaras dengan ToolbarFilter modul lain */
export function BudgetYearToolbarFilter({ className }: { className?: string }) {
  const { years, loading, budgetYearId, setBudgetYearId } = useBudgetYearScope();

  if (loading) {
    return (
      <div className={cn("flex h-[30px] items-center gap-1.5 text-[11px] text-slate-400", className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Tahun...
      </div>
    );
  }

  if (years.length === 0) {
    return <span className={cn("text-[10px] text-amber-600", className)}>Tahun —</span>;
  }

  return (
    <ToolbarFilter
      label="Tahun"
      value={budgetYearId ? String(budgetYearId) : ""}
      onChange={(v) => setBudgetYearId(Number(v))}
      className={className}
    >
      {years.map((y) => (
        <option key={y.id} value={y.id}>
          {y.tahun}
          {y.status === "active" ? " · Aktif" : y.status === "closed" ? " · Tutup" : ""}
        </option>
      ))}
    </ToolbarFilter>
  );
}

export function BudgetYearScopedContent({
  children,
  emptyDescription = "Pilih tahun anggaran untuk melanjutkan.",
}: {
  children: ReactNode;
  emptyDescription?: string;
}) {
  const { loading, budgetYearId, years } = useBudgetYearScope();

  if (loading) {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat konteks tahun anggaran...
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <EmptyState
        title="Tahun anggaran belum tersedia"
        description="Buat data tahun anggaran terlebih dahulu di menu Referensi Anggaran."
        className="mt-3"
      />
    );
  }

  if (!budgetYearId) {
    return (
      <EmptyState
        title="Tahun anggaran wajib dipilih"
        description={emptyDescription}
        className="mt-3"
      />
    );
  }

  return <>{children}</>;
}
