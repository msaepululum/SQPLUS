import { SettingsModulePage } from "@/components/finance/settings/SettingsModulePage";
import {
  SETTINGS_LEGACY_SLUG_REDIRECT,
  SETTINGS_MODULE_BY_SLUG,
} from "@/constants/settings-pages";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type SettingsSubPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(SETTINGS_MODULE_BY_SLUG).map((slug) => ({ slug }));
}

function SettingsModuleContent({
  slug,
  initialTab,
}: {
  slug: string;
  initialTab?: string;
}) {
  const config = SETTINGS_MODULE_BY_SLUG[slug];
  if (!config) notFound();
  return <SettingsModulePage config={config} initialTab={initialTab} />;
}

export default async function FinanceSettingsSubPage({
  params,
  searchParams,
}: SettingsSubPageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const legacy = SETTINGS_LEGACY_SLUG_REDIRECT[slug];
  if (legacy) {
    const qs = new URLSearchParams({ tab: legacy.tab });
    redirect(`/finance/settings/${legacy.slug}?${qs.toString()}`);
  }

  if (!SETTINGS_MODULE_BY_SLUG[slug]) {
    notFound();
  }

  return (
    <Suspense>
      <SettingsModuleContent slug={slug} initialTab={tab} />
    </Suspense>
  );
}
