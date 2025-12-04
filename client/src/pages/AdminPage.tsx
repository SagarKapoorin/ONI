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
      // console.log("Creating author with values:", values)
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
      //console.log("Book created successfully");
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
    //console.log("Author form rendered",registerAuthor,handleSubmitAuthor);
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
    //console.log("Book form submitted with values:", values);
    resetBook();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <h1 className="text-xl font-semibold text-slate-900">Admin panel</h1>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-slate-200 bg-white p-4">
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

        <div className="rounded border border-slate-200 bg-white p-4">
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
                className="rounded border border-slate-300 px-3 py-2 text-sm"
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
                <span className="text-xs text-red-600">
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
          <p className="text-sm text-slate-600">
            No books are currently borrowed.
          </p>
        ) : (
          <div className="space-y-3">
            {borrowed.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-slate-200 bg-white p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.book.title}</p>
                  <p className="text-slate-600">
                    by {item.book.author.name} — Borrowed by {item.user.name} (
                    {item.user.email})
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
