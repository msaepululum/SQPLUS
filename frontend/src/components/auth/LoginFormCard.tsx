"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Shield,
  User,
} from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginFormCard() {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("admin@sqplus.local");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError("Username/NIP atau kata sandi salah.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F6F9] dark:bg-slate-950">
      {/* Mobile logo */}
      <div className="flex shrink-0 items-center gap-2 px-5 pt-5 lg:hidden">
        <span className="text-xl font-bold text-[#071A3D] dark:text-white">
          SQ<span className="text-[#10B9A6]">+</span>
        </span>
        <span className="text-[11px] text-sq-slate">
          Sistem Integrasi Rumah Sakit
        </span>
      </div>

      {/* Language */}
      <div className="flex shrink-0 justify-end px-5 pt-5 lg:px-8 lg:pt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-sq-border bg-white px-3 py-1.5 text-xs font-medium text-[#071A3D] shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Globe className="h-3.5 w-3.5 text-sq-slate" strokeWidth={2} />
          Bahasa Indonesia
          <ChevronDown className="h-3.5 w-3.5 text-sq-slate" strokeWidth={2} />
        </button>
      </div>

      {/* Form — center vertikal, tanpa scroll di desktop */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8 lg:py-0">
        <div className="w-full max-w-[400px] rounded-2xl border border-sq-border bg-white p-5 shadow-[0_8px_30px_rgba(7,26,61,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <p className="text-xs text-sq-slate">Selamat Datang Kembali</p>
          <h1 className="mt-0.5 text-xl font-bold text-[#071A3D] dark:text-white sm:text-2xl">
            Masuk Ke Akun{" "}
            <span className="text-[#10B9A6]">
              SQ<span className="text-[#2563EB]">+</span>
            </span>
          </h1>
          <p className="mt-1.5 text-[13px] leading-snug text-sq-slate">
            Masukkan kredensial Anda untuk mengakses dashboard manajemen rumah
            sakit.
          </p>

          <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login-username"
                className="mb-1 block text-xs font-medium text-[#071A3D] dark:text-slate-200"
              >
                Username atau NIP
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sq-slate"
                  strokeWidth={2}
                />
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan username atau NIP"
                  className="h-9 w-full rounded-lg border border-sq-border bg-white pl-10 pr-3 text-sm text-[#071A3D] placeholder:text-sq-slate/60 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-xs font-medium text-[#071A3D] dark:text-slate-200"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sq-slate"
                  strokeWidth={2}
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="h-9 w-full rounded-lg border border-sq-border bg-white pl-10 pr-10 text-sm text-[#071A3D] placeholder:text-sq-slate/60 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
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
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-sq-slate">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-sq-border text-[#2563EB] focus:ring-[#2563EB]/30"
                />
                Ingat saya
              </label>
              <button
                type="button"
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {error && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#10B9A6] text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock className="h-4 w-4" strokeWidth={2} />
              {submitting ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="mt-4 flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50/90 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-500/10">
            <Shield
              className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB] dark:text-sky-400"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-relaxed text-sq-slate dark:text-slate-400">
              Akses ini tercatat dalam audit log sistem. Pastikan Anda logout
              setelah selesai menggunakan aplikasi di perangkat bersama.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
