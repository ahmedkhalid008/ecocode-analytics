import Cookies from "js-cookie";
import { User, Token } from "./types";

const TOKEN_KEY = "ecocode_token";
const USER_KEY = "ecocode_user";

export function setAuthToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "lax" });
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | undefined {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;
  }
  return Cookies.get(TOKEN_KEY);
}

export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function setUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      try {
        return JSON.parse(data) as User;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function logout(): void {
  removeAuthToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
