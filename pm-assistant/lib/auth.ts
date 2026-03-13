const TOKEN_KEY = "pm_analyst_session_token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function checkAuthStatus(
  token: string
): Promise<{ authenticated: boolean }> {
  try {
    const res = await fetch(
      `${API_URL}/auth/microsoft/status?token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

export function getLoginUrl(): string {
  return `${API_URL}/auth/microsoft/login`;
}
