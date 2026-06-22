import { TaxModulePage } from "@/components/finance/tax/TaxModulePage";
import { TAX_LEGACY_SLUG_REDIRECT, TAX_MODULE_BY_SLUG } from "@/constants/tax-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type TaxSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(TAX_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

export default async function FinanceTaxSubPage({ params, searchParams }: TaxSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = TAX_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/tax/${legacy.slug}?tab=${legacy.tab}`);
  }

  const config = TAX_MODULE_BY_SLUG[slug];
  if (!config) notFound();

  return (
    <Suspense>
      <TaxModulePage config={config} initialTab={tab} />
    </Suspense>
  );
}
