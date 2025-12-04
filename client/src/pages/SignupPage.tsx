import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signup(values.name, values.email, values.password);
      // console.log("Signup successful");
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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          Create an ONI Library account
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
