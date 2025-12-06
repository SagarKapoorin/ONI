import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "../utils/apiError";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  // console.log("user",user)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: SignupFormValues) => {
    const result = signupSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof SignupFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      }

      const firstIssue = result.error.issues[0];
      toast.error(
        firstIssue?.message || "Please fix the highlighted form fields.",
      );
      return;
    }

    try {
      await signup(
        result.data.name,
        result.data.email,
        result.data.password,
      );
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        "Failed to signup. Please try again.",
      );
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-md shadow-slate-200/80 backdrop-blur-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create an ONI Library account
        </h1>
        <p className="mb-5 text-sm text-slate-500">
          Sign up in seconds and start borrowing instantly.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" loading={isSubmitting}>
            Sign up
          </Button>
        </form>
      </div>
    </div>
  );
};
