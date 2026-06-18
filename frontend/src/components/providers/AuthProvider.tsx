"use client";

import { AUTH_TOKEN_KEY } from "@/constants/auth";
import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (noAbsen: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      const hasCookie = document.cookie.includes(`${AUTH_TOKEN_KEY}=`);
      if (!hasCookie) {
        window.location.href = "/login";
      }
    }
    return null;
  }

  return <>{children}</>;
}
