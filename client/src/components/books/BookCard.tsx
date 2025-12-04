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
  //console.log("Rendering BookCard for book:", book.title, "isAdmin:", isAdmin);
  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-900">{book.title}</h3>
        <p className="text-sm text-slate-600">by {book.author.name}</p>
        <p className="mt-1 text-xs">
          Status:{" "}
          <span
            className={
              book.isBorrowed
                ? "text-red-600 font-medium"
                : "text-green-600 font-medium"
            }
          >
            {book.isBorrowed ? "Borrowed" : "Available"}
          </span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {user && !book.isBorrowed && onBorrow && (
          <Button loading={isBorrowing} onClick={onBorrow}>
            Borrow
          </Button>
        )}
        {user && book.isBorrowed && onReturn && (
          <Button onClick={onReturn}>Return</Button>
        )}
        {isAdmin && onEdit && (
          <Button onClick={onEdit} className="bg-slate-700 hover:bg-slate-800">
            Edit
          </Button>
        )}
        {isAdmin && onDelete && (
          <Button onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
