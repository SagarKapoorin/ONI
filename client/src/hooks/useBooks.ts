import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { booksApi } from "../api/booksApi";
import type { BooksQueryParams, Book, PaginatedResponse } from "../types";
import { extractApiErrorMessage } from "../utils/apiError";

const booksListKey = (params: BooksQueryParams) => ["books", "list", params];

export const useBooks = (params: BooksQueryParams) => {
  return useQuery<PaginatedResponse<Book>, Error>({
    queryKey: booksListKey(params),
    queryFn: () => booksApi.list(params),
  });
};

export const useBorrowBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => booksApi.borrow(id),
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: ["books", "list"] });
      const previous = queryClient.getQueriesData<{ items: Book[] }>({
        queryKey: ["books", "list"],
      });
      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((b) =>
            b.id === bookId ? { ...b, isBorrowed: true } : b,
          ),
        });
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (!context) return;
      context.previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, data);
      });
      const message = extractApiErrorMessage(error, "Failed to borrow book");
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => booksApi.return(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["me", "borrowed"] });
    },
  });
};
