import { axiosInstance } from "./axios";
import type { Author } from "../types";

export const authorsApi = {
  list: async (): Promise<Author[]> => {
    const res = await axiosInstance.get<Author[]>("/authors");
    //console.log("Fetched authors:", res.data);
    return res.data;
  },
  create: async (data: { name: string }): Promise<Author> => {
    const res = await axiosInstance.post<Author>("/authors", data);
    return res.data;
  },
  update: async (id: number, data: { name: string }): Promise<Author> => {
    const res = await axiosInstance.put<Author>(`/authors/${id}`, data);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/authors/${id}`);
  },
};
