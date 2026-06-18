"use client";

import {
  fetchMe,
  getStoredUser,
  getToken,
  login as loginRequest,
  logout as logoutRequest,
} from "@/services/auth";
import type { AuthUser } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setUser(getStoredUser());
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (noAbsen: string, password: string) => {
      const authUser = await loginRequest(noAbsen, password);
      setUser(authUser);
      router.push("/beranda");
    },
    [router]
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, login, logout, isAuthenticated: !!user };
}
