"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";

export function LoginFormCard() {
  const { login } = useAuthContext();
  const { t } = useTranslation();
  const [noAbsen, setNoAbsen] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(noAbsen, password);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(t("login.errorNetwork"));
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(t("login.errorInvalid"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden lg:bg-[#F4F6F9] dark:lg:bg-slate-950">
      {/* Mobile background — foto hospital + overlay navy */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#071A3D] lg:hidden"
      >
        <div className="absolute inset-x-0 bottom-0 top-[28%]">
          <Image
            src="/images/hospital.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_38%] saturate-[1.15] contrast-[1.06] brightness-[0.9]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071A3D] from-0% via-[#071A3D]/92 via-[12%] via-[#071A3D]/70 via-[28%] via-[#071A3D]/35 via-[42%] to-transparent to-[68%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D] from-0% via-[#071A3D]/75 via-[22%] to-transparent to-[50%]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B9A6]/30 via-transparent to-[#2563EB]/15 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-[#0B1D5D]/35 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#10B9A6]/10 mix-blend-color" />
        </div>
        <div className="absolute inset-x-0 top-0 h-[34%] bg-[#071A3D]" />
      </div>

      {/* Mobile header — overlay agar card bisa center penuh */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 pb-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] lg:relative lg:z-10 lg:hidden">
        <div className="min-w-0">
          <span className="text-lg font-bold text-white sm:text-xl">
            SQ<span className="text-[#10B9A6]">+</span>
          </span>
          <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
            {t("common.appSubtitle")}
          </p>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Desktop language */}
      <div className="hidden shrink-0 justify-end px-8 pt-6 lg:flex xl:px-12 xl:pt-8 2xl:px-16">
        <LanguageSwitcher />
      </div>

      {/* Form — center di mobile & desktop, scroll saat keyboard */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2.75rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,env(safe-area-inset-top))] sm:py-4 sm:pb-[max(3rem,env(safe-area-inset-bottom))] sm:pt-[max(4.75rem,env(safe-area-inset-top))] lg:overflow-hidden lg:px-10 lg:py-0 lg:pb-0 lg:pt-0 xl:px-14 2xl:px-20">
        <div className="my-auto w-full max-w-[min(100%,25rem)] sm:max-w-[26rem] lg:max-w-[clamp(26rem,34vw,36rem)]">
          <div className="rounded-2xl border border-sq-border bg-white p-4 shadow-[0_8px_30px_rgba(7,26,61,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:shadow-[0_8px_30px_rgba(7,26,61,0.08)] xl:p-8 2xl:p-10">
          <p className="text-xs text-sq-slate xl:text-sm">{t("login.welcome")}</p>
          <h1 className="mt-0.5 text-xl font-bold text-[#071A3D] dark:text-white sm:text-2xl xl:text-3xl 2xl:text-[2.125rem]">
            {t("login.title")}{" "}
            <span className="text-[#10B9A6]">
              SQ<span className="text-[#2563EB]">+</span>
            </span>
          </h1>
          <p className="mt-1.5 text-[13px] leading-snug text-sq-slate xl:mt-2 xl:text-[15px] 2xl:text-base">
            {t("login.subtitle")}
          </p>

          <form className="mt-5 space-y-3.5 xl:mt-6 xl:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login-employee-number"
                className="mb-1 block text-xs font-medium text-[#071A3D] dark:text-slate-200 xl:mb-1.5 xl:text-sm"
              >
                {t("login.employeeNumberLabel")}
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sq-slate xl:left-3.5 xl:h-[1.125rem] xl:w-[1.125rem]"
                  strokeWidth={2}
                />
                <input
                  id="login-employee-number"
                  name="no_absen"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="username"
                  value={noAbsen}
                  onChange={(e) => setNoAbsen(e.target.value)}
                  placeholder={t("login.employeeNumberPlaceholder")}
                  className="h-9 w-full rounded-lg border border-sq-border bg-white pl-10 pr-3 text-sm text-[#071A3D] placeholder:text-sq-slate/60 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 xl:h-11 xl:rounded-xl xl:pl-11 xl:pr-4 xl:text-base"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-xs font-medium text-[#071A3D] dark:text-slate-200 xl:mb-1.5 xl:text-sm"
              >
                {t("login.passwordLabel")}
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sq-slate xl:left-3.5 xl:h-[1.125rem] xl:w-[1.125rem]"
                  strokeWidth={2}
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="h-9 w-full rounded-lg border border-sq-border bg-white pl-10 pr-10 text-sm text-[#071A3D] placeholder:text-sq-slate/60 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 xl:h-11 xl:rounded-xl xl:pl-11 xl:pr-12 xl:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sq-slate hover:text-[#071A3D] dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-sq-slate xl:text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-sq-border text-[#2563EB] focus:ring-[#2563EB]/30"
                />
                {t("login.rememberMe")}
              </label>
              <button
                type="button"
                className="text-xs font-medium text-[#2563EB] hover:underline xl:text-sm"
              >
                {t("login.forgotPassword")}
              </button>
            </div>

            {error && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300 xl:text-sm"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#10B9A6] text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 xl:h-11 xl:rounded-xl xl:text-sm"
            >
              <Lock className="h-4 w-4 xl:h-[1.125rem] xl:w-[1.125rem]" strokeWidth={2} />
              {submitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <div className="mt-4 flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50/90 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-500/10 xl:mt-5 xl:gap-3 xl:px-4 xl:py-3">
            <Shield
              className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB] dark:text-sky-400 xl:h-5 xl:w-5"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-relaxed text-sq-slate dark:text-slate-400 xl:text-xs 2xl:text-sm">
              {t("login.securityNotice")}
            </p>
          </div>
        </div>
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 text-center text-[10px] text-slate-400 lg:hidden">
        {t("common.copyright")}
      </footer>
    </div>
  );
}
