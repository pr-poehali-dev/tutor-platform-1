import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import func2url from "../../backend/func2url.json";

const AUTH_URL = (func2url as Record<string, string>).auth;
const TOKEN_KEY = "uchispro_auth_token_v1";

export interface AuthUser {
  id: number;
  phone?: string | null;
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
  register: (email: string, password: string, name?: string) => Promise<{ ok: boolean; message?: string; isNew?: boolean }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
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

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch(`${AUTH_URL}?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        return { ok: false, message: data.error || "Не удалось зарегистрироваться" };
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${AUTH_URL}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        return { ok: false, message: data.error || "Не удалось войти" };
      }
      saveToken(data.token);
      setToken(data.token);
      setUser(data.user ?? null);
      await refresh();
      return { ok: true };
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
    register,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Безопасная заглушка — используется только если контекст не найден
 *  (например, при HMR в dev-режиме Vite, когда React теряет ссылку на провайдер).
 *  В прод-сборке контекст всегда есть — этот fallback не активируется. */
const AUTH_FALLBACK: AuthState = {
  token: null,
  user: null,
  subscription: null,
  loading: false,
  isAuthenticated: false,
  isModalOpen: false,
  openLogin: () => {
    if (typeof window !== "undefined") window.location.reload();
  },
  closeLogin: () => {},
  register: async () => ({ ok: false, message: "Контекст ещё не готов" }),
  login: async () => ({ ok: false, message: "Контекст ещё не готов" }),
  logout: async () => {},
  refresh: async () => {},
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof window !== "undefined") {
      // Сигнализируем в консоль, но не валим всё приложение
      console.warn("[useAuth] AuthContext не найден — использую fallback (вероятно, HMR в dev)");
    }
    return AUTH_FALLBACK;
  }
  return ctx;
}