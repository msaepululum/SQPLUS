import { HrPageShell } from "@/components/hr/HrPageShell";
import {
  HR_LEGACY_PATH_REDIRECT,
  HR_LEGACY_TAB_REDIRECT,
  HR_PAGE_BY_PATH,
} from "@/constants/hr-pages";
import type { HrPagePath } from "@/constants/hr-navigation";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type HrCatchAllProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ tab?: string }>;
};

export function generateStaticParams() {
  return Object.keys(HR_PAGE_BY_PATH).map((path) => ({
    slug: path.split("/"),
  }));
}

function HrPageContent({ path, initialTab }: { path: HrPagePath; initialTab?: string }) {
  const config = HR_PAGE_BY_PATH[path];
  if (!config) notFound();
  return <HrPageShell config={config} initialTab={initialTab} path={path} />;
}

export default async function HrCatchAllPage({ params, searchParams }: HrCatchAllProps) {
  const segments = (await params).slug;
  const { tab } = await searchParams;
  const path = segments.join("/");

  if (segments.length === 1) {
    const legacyPath = HR_LEGACY_PATH_REDIRECT[segments[0]];
    if (legacyPath) redirect(legacyPath);
  }

  if (segments.length >= 1) {
    const legacyModule = segments[0];
    const legacyTabMap = HR_LEGACY_TAB_REDIRECT[legacyModule];
    if (legacyTabMap && tab && legacyTabMap[tab]) {
      redirect(legacyTabMap[tab]);
    }
    if (legacyTabMap && !tab && segments.length === 1 && HR_LEGACY_TAB_REDIRECT[legacyModule]) {
      const firstTab = Object.keys(legacyTabMap)[0];
      if (firstTab && !HR_PAGE_BY_PATH[path as HrPagePath]) {
        redirect(legacyTabMap[firstTab]);
      }
    }
  }

  const config = HR_PAGE_BY_PATH[path as HrPagePath];
  if (!config) notFound();

  return (
    <Suspense>
      <HrPageContent path={path as HrPagePath} initialTab={tab} />
    </Suspense>
  );
}
