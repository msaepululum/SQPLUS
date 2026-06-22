"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { HUTANG_JENIS, type HutangJenisId } from "@/constants/hutang-categories";

type HutangJenisFilterProps = {
  value: HutangJenisId | "";
  onChange: (id: HutangJenisId | "") => void;
};

export function HutangJenisFilter({ value, onChange }: HutangJenisFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label="Jenis Hutang"
      value={value}
      onChange={(v) => onChange((v || "") as HutangJenisId | "")}
    >
      <option value="">Semua Jenis</option>
      {HUTANG_JENIS.map((jenis) => (
        <option key={jenis.id} value={jenis.id}>
          {t(jenis.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
