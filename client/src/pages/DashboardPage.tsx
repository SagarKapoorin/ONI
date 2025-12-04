import { useState } from "react";
import { useBooks, useBorrowBook } from "../hooks/useBooks";
import { useDebounce } from "../hooks/useDebounce";
import { BookCard } from "../components/books/BookCard";
import { Skeleton } from "../components/common/Skeleton";
import { authorsApi } from "../api/authorsApi";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 10;

export const DashboardPage = () => {
  const [page, setPage] = useState(1);
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [status, setStatus] = useState<"all" | "available" | "borrowed">("all");
  const [search, setSearch] = useState("");
  //console.log("DashboardPage rendered with search:", search);
  const searchDebounced = useDebounce(search, 400);

  const { data: authors } = useQuery({
    queryKey: ["authors"],
    queryFn: () => authorsApi.list(),
  });

  const { data, isLoading } = useBooks({
    page,
    limit: PAGE_SIZE,
    authorId,
    isBorrowed:
      status === "all" ? undefined : status === "borrowed" ? true : false,
    search: searchDebounced || undefined,
  });

  const borrowMutation = useBorrowBook();
  // console.log(data)

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;
  //console.log("Total pages:", totalPages);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:flex-row">
      <aside className="w-full rounded-lg border border-slate-200 bg-white p-4 md:w-64">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Filters</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={authorId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setAuthorId(value ? Number(value) : undefined);
              setPage(1);
            }}
          >
            <option value="">All authors</option>
            {authors?.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              const next = e.target.value;
              if (
                next === "all" ||
                next === "available" ||
                next === "borrowed"
              ) {
                setStatus(next);
                setPage(1);
              }
            }}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>
      </aside>
      <main className="flex-1">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          Books catalog
        </h1>
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        )}
        {!isLoading && data && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isBorrowing={borrowMutation.isPending}
                  onBorrow={
                    book.isBorrowed
                      ? undefined
                      : async () => {
                          try {
                            await borrowMutation.mutateAsync(book.id);
                            toast.success("Book borrowed");
                          } catch (error) {
                            const message = extractApiErrorMessage(
                              error,
                              "Failed to borrow book",
                            );
                            toast.error(message);
                          }
                        }
                  }
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {data.page} of {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
