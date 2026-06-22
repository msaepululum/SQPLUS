import { ExpenditureModulePage } from "@/components/finance/expenditure/ExpenditureModulePage";
import {
  EXPENDITURE_LEGACY_SLUG_REDIRECT,
  EXPENDITURE_MODULE_BY_SLUG,
} from "@/constants/expenditure-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ExpenditureSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; jenis?: string }>;
};

export function generateStaticParams() {
  return Object.keys(EXPENDITURE_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function ExpenditureModuleContent({
  slug,
  initialTab,
  initialJenis,
}: {
  slug: string;
  initialTab?: string;
  initialJenis?: string;
}) {
  const config = EXPENDITURE_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return (
    <ExpenditureModulePage
      config={config}
      initialTab={initialTab}
      initialJenis={initialJenis}
    />
  );
}

export default async function FinanceExpenditureSubPage({
  params,
  searchParams,
}: ExpenditureSubPageProps) {
  const { slug } = await params;
  const { tab, jenis } = await searchParams;

  const legacy = EXPENDITURE_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    const qs = new URLSearchParams({ tab: legacy.tab });
    if (legacy.jenis) qs.set("jenis", legacy.jenis);
    else if (jenis) qs.set("jenis", jenis);
    redirect(`/finance/expenditure/${legacy.slug}?${qs.toString()}`);
  }

  if (!EXPENDITURE_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <ExpenditureModuleContent slug={slug} initialTab={tab} initialJenis={jenis} />
    </Suspense>
  );
}
