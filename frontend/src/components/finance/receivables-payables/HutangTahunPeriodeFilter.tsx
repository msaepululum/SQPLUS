"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import {
  HUTANG_TAHUN_PERIODE,
  type HutangTahunPeriodeId,
} from "@/constants/hutang-categories";

type HutangTahunPeriodeFilterProps = {
  value: HutangTahunPeriodeId | "";
  onChange: (id: HutangTahunPeriodeId | "") => void;
};

export function HutangTahunPeriodeFilter({ value, onChange }: HutangTahunPeriodeFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label="Periode Tahun"
      value={value}
      onChange={(v) => onChange((v || "") as HutangTahunPeriodeId | "")}
    >
      <option value="">Semua Tahun</option>
      {HUTANG_TAHUN_PERIODE.map((periode) => (
        <option key={periode.id} value={periode.id}>
          {t(periode.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
