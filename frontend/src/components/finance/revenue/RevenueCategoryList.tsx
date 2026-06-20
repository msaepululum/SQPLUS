"use client";

import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { REVENUE_CATEGORIES } from "@/constants/revenue-categories";
import { cardClassName } from "@/components/ui/Card";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { cn } from "@/lib/cn";

type RevenueCategoryListProps = {
  /** Kolom nilai opsional (rencana / realisasi) */
  showValueColumns?: boolean;
  className?: string;
};

export function RevenueCategoryList({
  showValueColumns = false,
  className,
}: RevenueCategoryListProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cardClassName({
        variant: "default",
        className: cn("!p-0", tableGridShellClassName, className),
      })}
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="text-xs font-semibold text-slate-800">Klasifikasi Pendapatan BLU</h3>
        <p className="text-[10px] text-slate-400">8 kategori resmi — satu-satunya pembagian pendapatan</p>
      </div>
      <Table embedded>
        <THead>
          <TR>
            <TH className="w-12">Kode</TH>
            <TH>Kategori Pendapatan</TH>
            {showValueColumns && (
              <>
                <TH className="text-right">Rencana</TH>
                <TH className="text-right">Realisasi</TH>
              </>
            )}
          </TR>
        </THead>
        <TBody>
          {REVENUE_CATEGORIES.map((cat) => (
            <TR key={cat.id}>
              <TD className="font-mono text-[10px] text-slate-500">{cat.kode}</TD>
              <TD className="text-[11px] font-medium text-slate-700">{t(cat.labelKey)}</TD>
              {showValueColumns && (
                <>
                  <TD className="text-right text-[11px] text-slate-300">—</TD>
                  <TD className="text-right text-[11px] text-slate-300">—</TD>
                </>
              )}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
