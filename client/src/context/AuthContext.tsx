import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { setAccessToken } from "../api/axios";
import type { User } from "../types";
import { AuthContext } from "./auth-context";

const ACCESS_TOKEN_KEY = "oni_access_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    return Boolean(token);
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return;
    }

    setAccessToken(token);
    authApi
      .me()
      .then((me) => {
        setUser(me);
      })
      .finally(() => setIsLoading(false));
  }, [setUser]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      setAccessToken(result.accessToken);
      setUser(result.user);
    },
    [setUser],
  );

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authApi.signup({ name, email, password });
      window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      setAccessToken(result.accessToken);
      setUser(result.user);
    },
    [setUser],
  );

  const handleLogout = useCallback(async () => {
    await authApi.logout();
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient, setUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
    }),
    [user, isLoading, handleLogin, handleSignup, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
