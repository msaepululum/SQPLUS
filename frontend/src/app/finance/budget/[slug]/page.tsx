import { BudgetModulePage } from "@/components/finance/budget/BudgetModulePage";
import {
  BUDGET_LEGACY_SLUG_REDIRECT,
  BUDGET_MODULE_BY_SLUG,
} from "@/constants/budget-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type BudgetSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(BUDGET_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function BudgetModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = BUDGET_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <BudgetModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceBudgetSubPage({
  params,
  searchParams,
}: BudgetSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = BUDGET_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/budget/${legacy.slug}?tab=${legacy.tab}`);
  }

  if (!BUDGET_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <BudgetModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
