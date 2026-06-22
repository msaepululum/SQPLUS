"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { PIUTANG_JENIS, type PiutangJenisId } from "@/constants/piutang-categories";

type PiutangJenisFilterProps = {
  value: PiutangJenisId | "";
  onChange: (id: PiutangJenisId | "") => void;
};

export function PiutangJenisFilter({ value, onChange }: PiutangJenisFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label="Jenis Piutang"
      value={value}
      onChange={(v) => onChange((v || "") as PiutangJenisId | "")}
    >
      <option value="">Semua Jenis</option>
      {PIUTANG_JENIS.map((jenis) => (
        <option key={jenis.id} value={jenis.id}>
          {t(jenis.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
