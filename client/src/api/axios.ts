import axios, { type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Let caller handle redirect / logout; no automatic retry
    }
    return Promise.reject(error);
  },
);
