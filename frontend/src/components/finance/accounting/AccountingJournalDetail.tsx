"use client";

import { useCallback, useState } from "react";
import { CashTransactionDetailDrawer } from "@/components/finance/cash-bank/CashTransactionDetailDrawer";
import { fetchCashTransactionDetail } from "@/services/cashTransactionService";
import type { CashTransactionDetail } from "@/types/cash-transaction";

export function useAccountingJournalDetail(budgetYearId: number | null) {
  const [detail, setDetail] = useState<CashTransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const openJournal = useCallback(
    async (noJurnal: string) => {
      if (!budgetYearId || !noJurnal) return;
      setLoading(true);
      setDetail(null);
      try {
        setDetail(await fetchCashTransactionDetail(budgetYearId, `acc:${noJurnal}`));
      } catch {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    },
    [budgetYearId]
  );

  const closeJournal = useCallback(() => {
    setDetail(null);
  }, []);

  const drawer = (
    <CashTransactionDetailDrawer detail={detail} loading={loading} onClose={closeJournal} />
  );

  return { openJournal, closeJournal, drawer };
}
