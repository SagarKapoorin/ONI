import { axiosInstance } from "./axios";
import type { Book, BooksQueryParams, PaginatedResponse } from "../types";

export const booksApi = {
  list: async (params: BooksQueryParams): Promise<PaginatedResponse<Book>> => {
    const res = await axiosInstance.get<PaginatedResponse<Book>>("/books", {
      params: {
        page: params.page,
        limit: params.limit,
        authorId: params.authorId,
        isBorrowed:
          typeof params.isBorrowed === "boolean"
            ? String(params.isBorrowed)
            : undefined,
        search: params.search,
      },
    });
    return res.data;
  },
  getById: async (id: number): Promise<Book> => {
    const res = await axiosInstance.get<Book>(`/books/${id}`);
    return res.data;
  },
  create: async (data: { title: string; authorId: number }): Promise<Book> => {
    const res = await axiosInstance.post<Book>("/books", data);
    //console.log("Created book:", res.data);
    return res.data;
  },
  update: async (
    id: number,
    data: Partial<{ title: string; authorId: number; isBorrowed: boolean }>,
  ): Promise<Book> => {
    const res = await axiosInstance.put<Book>(`/books/${id}`, data);
    return res.data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/books/${id}`);
  },
  borrow: async (id: number) => {
    const res = await axiosInstance.post(`/books/${id}/borrow`);
    //console.log("Borrowed book response:", res.data);
    return res.data;
  },
  return: async (id: number) => {
    const res = await axiosInstance.post(`/books/${id}/return`);
    return res.data;
  },
};
