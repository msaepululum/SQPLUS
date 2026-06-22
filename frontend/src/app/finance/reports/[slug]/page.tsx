import { ReportsModulePage } from "@/components/finance/reports/ReportsModulePage";
import { EXECUTIVE_INSIGHT_LEGACY_SLUG_REDIRECT } from "@/constants/executive-insight-pages";
import {
  REPORTS_LEGACY_SLUG_REDIRECT,
  REPORTS_MODULE_BY_SLUG,
} from "@/constants/reports-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ReportsSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(REPORTS_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function ReportsModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = REPORTS_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <ReportsModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceReportsSubPage({
  params,
  searchParams,
}: ReportsSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = REPORTS_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/reports/${legacy.slug}?tab=${legacy.tab}`);
  }

  const insightLegacy = EXECUTIVE_INSIGHT_LEGACY_SLUG_REDIRECT[slug];
  if (insightLegacy) {
    redirect(`/finance/executive-insight/${insightLegacy.slug}?tab=${insightLegacy.tab}`);
  }

  if (!REPORTS_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <ReportsModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
