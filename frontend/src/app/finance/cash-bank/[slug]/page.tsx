import { CashBankModulePage } from "@/components/finance/cash-bank/CashBankModulePage";
import {
  CASH_BANK_LEGACY_SLUG_REDIRECT,
  CASH_BANK_MODULE_BY_SLUG,
} from "@/constants/cash-bank-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type CashBankSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(CASH_BANK_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function CashBankModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = CASH_BANK_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <CashBankModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceCashBankSubPage({
  params,
  searchParams,
}: CashBankSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = CASH_BANK_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/cash-bank/${legacy.slug}?tab=${legacy.tab}`);
  }

  if (!CASH_BANK_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <CashBankModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
