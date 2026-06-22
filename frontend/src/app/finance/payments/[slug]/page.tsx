import { PaymentsModulePage } from "@/components/finance/payments/PaymentsModulePage";
import {
  PAYMENTS_LEGACY_SLUG_REDIRECT,
  PAYMENTS_MODULE_BY_SLUG,
} from "@/constants/payments-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type PaymentsSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; jenis?: string }>;
};

export function generateStaticParams() {
  return Object.keys(PAYMENTS_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function PaymentsModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = PAYMENTS_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return (
    <PaymentsModulePage config={config} initialTab={initialTab} />
  );
}

export default async function FinancePaymentsSubPage({
  params,
  searchParams,
}: PaymentsSubPageProps) {
  const { slug } = await params;
  const { tab, jenis } = await searchParams;

  const legacy = PAYMENTS_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    const qs = new URLSearchParams({ tab: legacy.tab });
    if (legacy.jenis) qs.set("jenis", legacy.jenis);
    else if (jenis) qs.set("jenis", jenis);
    redirect(`/finance/payments/${legacy.slug}?${qs.toString()}`);
  }

  if (!PAYMENTS_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <PaymentsModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
