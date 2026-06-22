"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { APPROVAL_JENIS, type ApprovalJenisId } from "@/constants/approval-categories";

type ApprovalJenisFilterProps = {
  value: ApprovalJenisId | "";
  onChange: (id: ApprovalJenisId | "") => void;
};

export function ApprovalJenisFilter({ value, onChange }: ApprovalJenisFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label="Jenis Approval"
      value={value}
      onChange={(v) => onChange((v || "") as ApprovalJenisId | "")}
    >
      <option value="">Semua Jenis</option>
      {APPROVAL_JENIS.map((jenis) => (
        <option key={jenis.id} value={jenis.id}>
          {t(jenis.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
