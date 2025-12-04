import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "../utils/apiError";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { user, login } = useAuth();
  // console.log("user",login)
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        "Failed to login. Please check your credentials.",
      );
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          Login to ONI Library
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" loading={isSubmitting}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
