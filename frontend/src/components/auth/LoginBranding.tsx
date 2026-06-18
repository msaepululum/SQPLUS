"use client";

import {
  BarChart3,
  BadgeCheck,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/components/providers/LocaleProvider";

const FEATURE_KEYS = [
  {
    icon: BarChart3,
    titleKey: "branding.featureRealtimeTitle",
    descriptionKey: "branding.featureRealtimeDesc",
  },
  {
    icon: Shield,
    titleKey: "branding.featureSecurityTitle",
    descriptionKey: "branding.featureSecurityDesc",
  },
  {
    icon: Users,
    titleKey: "branding.featureCollaborationTitle",
    descriptionKey: "branding.featureCollaborationDesc",
  },
  {
    icon: TrendingUp,
    titleKey: "branding.featureDecisionTitle",
    descriptionKey: "branding.featureDecisionDesc",
  },
] as const;

export function LoginBranding() {
  const { t } = useTranslation();

  return (
    <aside className="relative hidden h-full shrink-0 overflow-hidden bg-[#071A3D] lg:flex lg:w-[42%] xl:w-[40%]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[46%]">
        <Image
          src="/images/hospital.png"
          alt={t("branding.hospitalAlt")}
          fill
          sizes="(max-width: 1280px) 42vw, 40vw"
          className="object-cover object-[center_38%] saturate-[1.15] contrast-[1.06] brightness-[0.9]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A3D] from-0% via-[#071A3D]/92 via-[12%] via-[#071A3D]/70 via-[28%] via-[#071A3D]/35 via-[42%] to-transparent to-[68%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D] from-0% via-[#071A3D]/75 via-[22%] to-transparent to-[50%]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B9A6]/30 via-transparent to-[#2563EB]/15 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[#0B1D5D]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#10B9A6]/10 mix-blend-color" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col px-7 py-6 xl:px-9 xl:py-7">
        <header className="shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[1.35rem] font-bold leading-none tracking-tight text-white xl:text-2xl">
              SQ<span className="text-[#10B9A6]">+</span>
            </span>
            <span className="text-[10px] leading-tight text-slate-400 xl:text-[11px]">
              {t("common.appSubtitle")}
            </span>
          </div>
        </header>

        <div className="mt-5 shrink-0 max-w-[22rem] xl:mt-6">
          <h1 className="text-[1.5rem] font-bold leading-[1.2] tracking-tight text-white xl:text-[1.75rem]">
            {t("branding.heroTitle")}{" "}
            <span className="text-[#10B9A6]">{t("branding.heroHighlight")}</span>{" "}
            {t("branding.heroTitleEnd")}
          </h1>
          <p className="mt-2.5 text-[13px] leading-snug text-slate-400 xl:mt-3 xl:text-sm">
            {t("branding.heroDescription")}
          </p>
        </div>

        <ul className="mt-4 shrink-0 space-y-2.5 xl:mt-5 xl:space-y-3">
          {FEATURE_KEYS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.titleKey} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0B1D5D]/70 text-[#10B9A6] ring-1 ring-white/10 xl:h-9 xl:w-9 xl:rounded-lg">
                  <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight text-white xl:text-sm">
                    {t(item.titleKey)}
                  </p>
                  <p className="text-[11px] leading-snug text-slate-400 xl:text-xs">
                    {t(item.descriptionKey)}
                  </p>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="min-h-0 flex-1" aria-hidden />

        <footer className="shrink-0 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] text-slate-400 xl:text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck
                className="h-3 w-3 text-[#10B9A6] xl:h-3.5 xl:w-3.5"
                strokeWidth={2}
              />
              {t("branding.isoBadge")}
            </span>
            <span className="text-slate-500">{t("common.copyrightFull")}</span>
          </div>
        </footer>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-[28%] h-48 w-48 rounded-full bg-[#10B9A6]/10 blur-3xl"
      />
    </aside>
  );
}
