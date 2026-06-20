import { RevenueModulePage } from "@/components/finance/revenue/RevenueModulePage";
import {
  REVENUE_LEGACY_SLUG_REDIRECT,
  REVENUE_MODULE_BY_SLUG,
} from "@/constants/revenue-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type RevenueSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; kategori?: string }>;
};

export function generateStaticParams() {
  return Object.keys(REVENUE_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function RevenueModuleContent({
  slug,
  initialTab,
  initialCategory,
}: {
  slug: string;
  initialTab?: string;
  initialCategory?: string;
}) {
  const config = REVENUE_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return (
    <RevenueModulePage
      config={config}
      initialTab={initialTab}
      initialCategory={initialCategory}
    />
  );
}

export default async function FinanceRevenueSubPage({
  params,
  searchParams,
}: RevenueSubPageProps) {
  const { slug } = await params;
  const { tab, kategori } = await searchParams;

  const legacy = REVENUE_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    const qs = new URLSearchParams({ tab: legacy.tab });
    if (kategori) qs.set("kategori", kategori);
    redirect(`/finance/revenue/${legacy.slug}?${qs.toString()}`);
  }

  if (!REVENUE_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <RevenueModuleContent slug={slug} initialTab={tab} initialCategory={kategori} />
    </Suspense>
  );
}
