const ACCESS_TOKEN_KEY = "oni_access_token";

export const tokenStorage = {
  get: () => window.localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string) => window.localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(ACCESS_TOKEN_KEY),
};
