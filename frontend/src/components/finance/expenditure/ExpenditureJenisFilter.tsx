"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import {
  EXPENDITURE_JENIS,
  type ExpenditureJenisId,
} from "@/constants/expenditure-categories";

type ExpenditureJenisFilterProps = {
  value: ExpenditureJenisId | "";
  onChange: (id: ExpenditureJenisId | "") => void;
  label?: string;
};

export function ExpenditureJenisFilter({
  value,
  onChange,
  label = "Jenis Belanja",
}: ExpenditureJenisFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label={label}
      value={value}
      onChange={(v) => onChange((v || "") as ExpenditureJenisId | "")}
    >
      <option value="">Semua Jenis</option>
      {EXPENDITURE_JENIS.map((jenis) => (
        <option key={jenis.id} value={jenis.id}>
          {t(jenis.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
