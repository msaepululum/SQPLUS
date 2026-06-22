"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { PAYMENT_JENIS, type PaymentJenisId } from "@/constants/payment-categories";

type PaymentJenisFilterProps = {
  value: PaymentJenisId | "";
  onChange: (id: PaymentJenisId | "") => void;
};

export function PaymentJenisFilter({ value, onChange }: PaymentJenisFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label="Jenis Pembayaran"
      value={value}
      onChange={(v) => onChange((v || "") as PaymentJenisId | "")}
    >
      <option value="">Semua Jenis</option>
      {PAYMENT_JENIS.map((jenis) => (
        <option key={jenis.id} value={jenis.id}>
          {t(jenis.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
