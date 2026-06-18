import type { AuthUser, LoginResponse } from "@/types/auth";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "@/utils/token";
import { apiFetch } from "./api";

export { getStoredUser, getToken } from "@/utils/token";

export async function login(noAbsen: string, password: string): Promise<AuthUser> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ no_absen: noAbsen, password }),
  });

  setSession(response.data.token, response.data.user);
  return response.data.user;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore — clear local session anyway
    }
  }
  clearSession();
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await apiFetch<{ data: AuthUser }>("/auth/me");

  setSession(token, response.data);
  return response.data;
}

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.roles.includes("super_admin")) return true;
  return user.permissions.includes(permission);
}
