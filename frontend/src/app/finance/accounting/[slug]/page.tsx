import { AccountingModulePage } from "@/components/finance/accounting/AccountingModulePage";
import {
  ACCOUNTING_LEGACY_SLUG_REDIRECT,
  ACCOUNTING_MODULE_BY_SLUG,
} from "@/constants/accounting-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type AccountingSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(ACCOUNTING_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function AccountingModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = ACCOUNTING_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <AccountingModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceAccountingSubPage({
  params,
  searchParams,
}: AccountingSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = ACCOUNTING_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/accounting/${legacy.slug}?tab=${legacy.tab}`);
  }

  if (!ACCOUNTING_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <AccountingModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
