import type { Book } from "../../types";
import { Button } from "../common/Button";
import { useAuth } from "../../hooks/useAuth";

interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  onReturn?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isBorrowing?: boolean;
}

export const BookCard = ({
  book,
  onBorrow,
  onReturn,
  onEdit,
  onDelete,
  isBorrowing,
}: BookCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const statusLabel = book.isBorrowed ? "Borrowed" : "Available";
  const statusClasses = book.isBorrowed
    ? "bg-red-50 text-red-600 ring-1 ring-red-100"
    : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100";

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md hover:shadow-sky-100">
      <div>
        <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
          {book.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
          by <span className="text-slate-800">{book.author.name}</span>
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${statusClasses}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {user && !book.isBorrowed && onBorrow && (
          <Button loading={isBorrowing} onClick={onBorrow}>
            Borrow
          </Button>
        )}
        {user && book.isBorrowed && onReturn && (
          <Button onClick={onReturn}>Return</Button>
        )}
        {isAdmin && onEdit && (
          <Button
            onClick={onEdit}
            className="bg-slate-700 hover:bg-slate-800"
          >
            Edit
          </Button>
        )}
        {isAdmin && onDelete && (
          <Button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        )}
      </div>
    </article>
  );
};
