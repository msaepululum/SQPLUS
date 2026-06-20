"use client";

import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { REVENUE_CATEGORIES, type RevenueCategoryId } from "@/constants/revenue-categories";
import { useTranslation } from "@/components/providers/LocaleProvider";

type RevenueCategoryFilterProps = {
  value: RevenueCategoryId | "";
  onChange: (id: RevenueCategoryId | "") => void;
  label?: string;
};

export function RevenueCategoryFilter({
  value,
  onChange,
  label = "Kategori",
}: RevenueCategoryFilterProps) {
  const { t } = useTranslation();

  return (
    <ToolbarFilter
      label={label}
      value={value}
      onChange={(v) => onChange((v || "") as RevenueCategoryId | "")}
    >
      <option value="">Semua Kategori</option>
      {REVENUE_CATEGORIES.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.kode} — {t(cat.labelKey)}
        </option>
      ))}
    </ToolbarFilter>
  );
}
