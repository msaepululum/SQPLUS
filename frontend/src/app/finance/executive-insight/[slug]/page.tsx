import { ExecutiveInsightModulePage } from "@/components/finance/executive-insight/ExecutiveInsightModulePage";
import {
  EXECUTIVE_INSIGHT_LEGACY_SLUG_REDIRECT,
  EXECUTIVE_INSIGHT_MODULE_BY_SLUG,
} from "@/constants/executive-insight-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ExecutiveInsightSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(EXECUTIVE_INSIGHT_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function ExecutiveInsightModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = EXECUTIVE_INSIGHT_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <ExecutiveInsightModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceExecutiveInsightSubPage({
  params,
  searchParams,
}: ExecutiveInsightSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = EXECUTIVE_INSIGHT_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    redirect(`/finance/executive-insight/${legacy.slug}?tab=${legacy.tab}`);
  }

  if (!EXECUTIVE_INSIGHT_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <ExecutiveInsightModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}