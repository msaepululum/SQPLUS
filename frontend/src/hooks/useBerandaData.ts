"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCashBankDashboard } from "@/services/cashBankDashboardService";
import { fetchFinanceReportDashboard } from "@/services/financeReportService";
import { getHrDashboard } from "@/services/hr";
import { fetchProcurementDashboard } from "@/services/procurementService";
import { fetchRevenueDashboard } from "@/services/revenueCollectService";
import { fetchSupplyChainDashboard } from "@/services/supplyChainService";
import type { CashBankDashboardData } from "@/types/cash-bank-dashboard";
import type { FinanceReportDashboardData } from "@/types/finance-reports";
import type { HrDashboard } from "@/types/hr";
import type { ProcurementDashboard } from "@/types/procurement";
import type { RevenueDashboardData } from "@/types/revenue-dashboard";
import type { SupplyChainDashboard } from "@/types/supply-chain";

export type BerandaDataBundle = {
  finance: FinanceReportDashboardData | null;
  revenue: RevenueDashboardData | null;
  cashBank: CashBankDashboardData | null;
  hr: HrDashboard | null;
  procurement: ProcurementDashboard | null;
  supplyChain: SupplyChainDashboard | null;
};

const EMPTY: BerandaDataBundle = {
  finance: null,
  revenue: null,
  cashBank: null,
  hr: null,
  procurement: null,
  supplyChain: null,
};

export function useBerandaData(budgetYearId: number | null, tahun: number | null) {
  const [data, setData] = useState<BerandaDataBundle>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!budgetYearId || !tahun) {
      setData(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      fetchFinanceReportDashboard(budgetYearId),
      fetchRevenueDashboard(budgetYearId),
      fetchCashBankDashboard(tahun),
      getHrDashboard(),
      fetchProcurementDashboard(budgetYearId),
      fetchSupplyChainDashboard(),
    ]);

    const next: BerandaDataBundle = {
      finance: results[0].status === "fulfilled" ? results[0].value : null,
      revenue: results[1].status === "fulfilled" ? results[1].value : null,
      cashBank: results[2].status === "fulfilled" ? results[2].value : null,
      hr: results[3].status === "fulfilled" ? results[3].value : null,
      procurement: results[4].status === "fulfilled" ? results[4].value : null,
      supplyChain: results[5].status === "fulfilled" ? results[5].value : null,
    };

    const allFailed = Object.values(next).every((v) => v === null);
    if (allFailed) {
      setError("Gagal memuat data beranda. Periksa koneksi backend.");
    }

    setData(next);
    setLoading(false);
  }, [budgetYearId, tahun]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
