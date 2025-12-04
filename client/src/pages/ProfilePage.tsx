import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { useAuth } from "../hooks/useAuth";
import { Skeleton } from "../components/common/Skeleton";
import { Button } from "../components/common/Button";
import { useReturnBook } from "../hooks/useBooks";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "../utils/apiError";
import { formatDate } from "../utils/date";
import type { BorrowedWithBook } from "../api/usersApi";

export const ProfilePage = () => {
  const { user } = useAuth();
  const returnMutation = useReturnBook();

  const { data, isLoading } = useQuery<BorrowedWithBook[]>({
    queryKey: ["me", "borrowed", user?.id],
    queryFn: () => usersApi.borrowedByUser(user!.id),
    enabled: Boolean(user),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          My profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your account details and manage your borrowed books.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/80 sm:p-5">
        <p className="text-sm text-slate-800">
          <span className="font-medium text-slate-900">Name:</span> {user.name}
        </p>
        <p className="mt-1 text-sm text-slate-800">
          <span className="font-medium text-slate-900">Email:</span>{" "}
          {user.email}
        </p>
        <p className="mt-1 text-sm text-slate-800">
          <span className="font-medium text-slate-900">Role:</span> {user.role}
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Borrowed books
        </h2>
        {isLoading && <Skeleton className="h-24 rounded-2xl" />}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-slate-500">
            You have not borrowed any books.
          </p>
        )}
        {!isLoading && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 text-sm shadow-sm shadow-slate-200/80 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.book.title}
                  </p>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    by{" "}
                    <span className="text-slate-800">
                      {item.book.author.name}
                    </span>
                  </p>
                  {item.returnedAt && (
                    <p className="mt-1 text-xs text-slate-400">
                      Returned on {formatDate(item.returnedAt)}
                    </p>
                  )}
                </div>
                {!item.returnedAt && (
                  <Button
                    loading={returnMutation.isPending}
                    onClick={async () => {
                      try {
                        await returnMutation.mutateAsync(item.bookId);
                        toast.success("Book returned");
                      } catch (error) {
                        const message = extractApiErrorMessage(
                          error,
                          "Failed to return book",
                        );
                        toast.error(message);
                      }
                    }}
                  >
                    Return
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
