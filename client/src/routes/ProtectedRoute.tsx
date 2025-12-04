import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  // console.log("user:", user, "isLoading:", isLoading);
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-600">Loading session...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
