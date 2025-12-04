import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorsApi } from "../api/authorsApi";
import { booksApi } from "../api/booksApi";
import { usersApi } from "../api/usersApi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { toast } from "react-toastify";
import { BookCard } from "../components/books/BookCard";
import { extractApiErrorMessage } from "../utils/apiError";

const authorSchema = z.object({
  name: z.string().min(2),
});

const bookSchema = z.object({
  title: z.string().min(1),
  authorId: z.string().min(1),
});

type AuthorFormValues = z.infer<typeof authorSchema>;
type BookFormValues = z.infer<typeof bookSchema>;

export const AdminPage = () => {
  const queryClient = useQueryClient();
  const { data: authors } = useQuery({
    queryKey: ["authors"],
    queryFn: () => authorsApi.list(),
  });
  const { data: books } = useQuery({
    queryKey: ["books", "admin"],
    queryFn: () => booksApi.list({ page: 1, limit: 50 }),
  });
  const { data: borrowed } = useQuery({
    queryKey: ["admin", "borrowed"],
    queryFn: () => usersApi.getAllBorrowed(),
  });

  const authorMutation = useMutation({
    mutationFn: (values: AuthorFormValues) =>
      authorsApi.create({ name: values.name }),
    onSuccess: () => {
      toast.success("Author created");
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, "Failed to create author");
      toast.error(message);
    },
  });

  const bookMutation = useMutation({
    mutationFn: (values: BookFormValues) =>
      booksApi.create({
        title: values.title,
        authorId: Number(values.authorId),
      }),
    onSuccess: () => {
      toast.success("Book created");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", "admin"] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, "Failed to create book");
      toast.error(message);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => booksApi.remove(id),
    onSuccess: () => {
      toast.success("Book deleted");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", "admin"] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, "Failed to delete book");
      toast.error(message);
    },
  });

  const {
    register: registerAuthor,
    handleSubmit: handleSubmitAuthor,
    formState: { errors: authorErrors, isSubmitting: isAuthorSubmitting },
    reset: resetAuthor,
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
  });

  const {
    register: registerBook,
    handleSubmit: handleSubmitBook,
    formState: { errors: bookErrors, isSubmitting: isBookSubmitting },
    reset: resetBook,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
  });

  const onSubmitAuthor = async (values: AuthorFormValues) => {
    await authorMutation.mutateAsync(values);
    resetAuthor();
  };

  const onSubmitBook = async (values: BookFormValues) => {
    await bookMutation.mutateAsync(values);
    resetBook();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Admin panel
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage authors, books and monitor all currently borrowed items.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/80 sm:p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Add author
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmitAuthor(onSubmitAuthor)}
          >
            <Input
              label="Name"
              {...registerAuthor("name")}
              error={authorErrors.name?.message}
            />
            <Button type="submit" loading={isAuthorSubmitting}>
              Add author
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/80 sm:p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Add book
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmitBook(onSubmitBook)}
          >
            <Input
              label="Title"
              {...registerBook("title")}
              error={bookErrors.title?.message}
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-800">Author</span>
              <select
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...registerBook("authorId")}
              >
                <option value="">Select author</option>
                {authors?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {bookErrors.authorId && (
                <span className="text-xs text-red-500">
                  {bookErrors.authorId.message}
                </span>
              )}
            </label>
            <Button type="submit" loading={isBookSubmitting}>
              Add book
            </Button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Manage books
        </h2>
        {books && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.items.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onDelete={() => deleteBookMutation.mutate(book.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Currently borrowed books
        </h2>
        {!borrowed || borrowed.length === 0 ? (
          <p className="text-sm text-slate-500">
            No books are currently borrowed.
          </p>
        ) : (
          <div className="space-y-3">
            {borrowed.map((item) => (
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
                    </span>{" "}
                    · Borrowed by{" "}
                    <span className="text-slate-800">
                      {item.user.name} ({item.user.email})
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
