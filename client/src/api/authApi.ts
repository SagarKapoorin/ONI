import { axiosInstance } from "./axios";
import type { AuthResponse, User } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return res.data;
  },
  signup: async (data: SignupPayload): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/signup", data);
    //console.log("Signup response data:", res.data.refreshToken);
    return res.data;
  },
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
  me: async (): Promise<User> => {
    const res = await axiosInstance.get<User>("/users/me");
    //console.log("Fetched current user:", res.data.accessToken);
    return res.data;
  },
};
