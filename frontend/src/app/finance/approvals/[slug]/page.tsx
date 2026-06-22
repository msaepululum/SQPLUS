import { ApprovalsModulePage } from "@/components/finance/approvals/ApprovalsModulePage";
import {
  APPROVALS_LEGACY_SLUG_REDIRECT,
  APPROVALS_MODULE_BY_SLUG,
} from "@/constants/approvals-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type ApprovalsSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; jenis?: string }>;
};

export function generateStaticParams() {
  return Object.keys(APPROVALS_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function ApprovalsModuleContent({
  slug,
  initialTab,
  initialJenis,
}: {
  slug: string;
  initialTab?: string;
  initialJenis?: string;
}) {
  const config = APPROVALS_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return (
    <ApprovalsModulePage
      config={config}
      initialTab={initialTab}
      initialJenis={initialJenis}
    />
  );
}

export default async function FinanceApprovalsSubPage({
  params,
  searchParams,
}: ApprovalsSubPageProps) {
  const { slug } = await params;
  const { tab, jenis } = await searchParams;

  const legacy = APPROVALS_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    const qs = new URLSearchParams({ tab: legacy.tab });
    if (jenis) qs.set("jenis", jenis);
    redirect(`/finance/approvals/${legacy.slug}?${qs.toString()}`);
  }

  if (!APPROVALS_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <ApprovalsModuleContent slug={slug} initialTab={tab} initialJenis={jenis} />
    </Suspense>
  );
}
