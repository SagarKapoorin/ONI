import { axiosInstance } from "./axios";
import type {
  PaginatedResponse,
  User,
  BorrowedBook,
  Book,
  Author,
} from "../types";

export type BorrowedWithBook = BorrowedBook & {
  book: Book & { author: Author };
};

export type BorrowedWithUserAndBook = BorrowedBook & {
  user: User;
  book: Book & { author: Author };
};

export const usersApi = {
  list: async (
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<User>> => {
    const res = await axiosInstance.get<PaginatedResponse<User>>("/users", {
      params: { page, limit },
    });
    // console.log("Fetched users:", res.data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await axiosInstance.get<User>("/users/me");
    return res.data;
  },
  borrowedByUser: async (userId: number): Promise<BorrowedWithBook[]> => {
    const res = await axiosInstance.get<BorrowedWithBook[]>(
      `/users/${userId}/borrowed`,
    );
    //console.log("Fetched borrowed books for user:", userId, res.data);
    return res.data;
  },
  getAllBorrowed: async (): Promise<BorrowedWithUserAndBook[]> => {
    const res =
      await axiosInstance.get<BorrowedWithUserAndBook[]>("/users/borrowed");
    return res.data;
  },
};
