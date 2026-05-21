import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import func2url from "../../backend/func2url.json";

const AUTH_URL = (func2url as Record<string, string>).auth;
const TOKEN_KEY = "uchispro_auth_token_v1";

export interface AuthUser {
  id: number;
  phone: string;
  name?: string | null;
  email?: string | null;
  created_at?: string | null;
}

export interface AuthSubscription {
  plan_id: string;
  status: string;
  expires_at: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  subscription: AuthSubscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  isModalOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  sendCode: (phone: string) => Promise<{ ok: boolean; message?: string; testMode?: boolean }>;
  verifyCode: (phone: string, code: string) => Promise<{ ok: boolean; message?: string; isNew?: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<AuthSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    const currentToken = loadToken();
    if (!currentToken) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${AUTH_URL}?action=me`, {
        method: "GET",
        headers: { "X-Auth-Token": currentToken },
      });
      if (!res.ok) {
        saveToken(null);
        setToken(null);
        setUser(null);
        setSubscription(null);
      } else {
        const data = await res.json();
        setUser(data.user ?? null);
        setSubscription(data.subscription ?? null);
      }
    } catch {
      // оставляем токен — может быть временный сетевой сбой
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendCode = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`${AUTH_URL}?action=send_code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не удалось отправить код" };
      return { ok: true, testMode: !!data.test_mode };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    try {
      const res = await fetch(`${AUTH_URL}?action=verify_code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        return { ok: false, message: data.error || "Не удалось проверить код" };
      }
      saveToken(data.token);
      setToken(data.token);
      setUser(data.user ?? null);
      await refresh();
      return { ok: true, isNew: !!data.is_new };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    const currentToken = loadToken();
    if (currentToken) {
      try {
        await fetch(`${AUTH_URL}?action=logout`, {
          method: "POST",
          headers: { "X-Auth-Token": currentToken, "Content-Type": "application/json" },
          body: "{}",
        });
      } catch {
        // ignore
      }
    }
    saveToken(null);
    setToken(null);
    setUser(null);
    setSubscription(null);
  }, []);

  const value: AuthState = {
    token,
    user,
    subscription,
    loading,
    isAuthenticated: !!user,
    isModalOpen,
    openLogin: () => setIsModalOpen(true),
    closeLogin: () => setIsModalOpen(false),
    sendCode,
    verifyCode,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
