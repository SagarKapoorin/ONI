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
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">My Profile</h1>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm">
          <span className="font-medium">Name:</span> {user.name}
        </p>
        <p className="text-sm">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p className="text-sm">
          <span className="font-medium">Role:</span> {user.role}
        </p>
      </div>

      <h2 className="mb-2 text-lg font-semibold text-slate-900">
        Borrowed books
      </h2>
      {isLoading && <Skeleton className="h-24" />}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-sm text-slate-600">
          You have not borrowed any books.
        </p>
      )}
      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border border-slate-200 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.book.title}</p>
                <p className="text-slate-600">by {item.book.author.name}</p>
                {item.returnedAt && (
                  <p className="text-xs text-slate-500">
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
    </div>
  );
};
