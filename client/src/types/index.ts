export type Role = "USER" | "ADMIN";

export interface Author {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}
export interface BorrowedBook {
  id: number;
  borrowedAt: string;
  returnedAt: string | null;
  userId: number;
  bookId: number;
}

export interface Book {
  id: number;
  title: string;
  isBorrowed: boolean;
  authorId: number;
  author: Author;
  borrowedInfo?: BorrowedBook | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface BooksQueryParams {
  page?: number;
  limit?: number;
  authorId?: number;
  isBorrowed?: boolean;
  search?: string;
}
