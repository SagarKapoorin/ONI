import { useState } from "react";
import { useBooks, useBorrowBook } from "../hooks/useBooks";
import { useDebounce } from "../hooks/useDebounce";
import { BookCard } from "../components/books/BookCard";
import { Skeleton } from "../components/common/Skeleton";
import { authorsApi } from "../api/authorsApi";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
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

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Browse the catalog
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter and borrow books in one responsive dashboard.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/80 md:w-72 md:flex-shrink-0 md:self-start md:sticky md:top-24">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
            Filters
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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

        <main className="flex-1 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/80 sm:p-5">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-2xl" />
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
                            await borrowMutation.mutateAsync(book.id);
                            toast.success("Book borrowed");
                          }
                    }
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-slate-300 sm:flex-row sm:text-sm">
                {/* Pagination */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 shadow-sm shadow-slate-200/80 transition hover:border-sky-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {data.page} of {totalPages || 1}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 shadow-sm shadow-slate-200/80 transition hover:border-sky-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </section>
  );
};
