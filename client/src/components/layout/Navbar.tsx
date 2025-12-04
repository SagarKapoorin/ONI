import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
      <Link to="/" className="font-semibold text-lg">
        ONI Library
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:underline">
              My Profile
            </Link>
            {user.role === "ADMIN" && (
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
            )}
          </>
        )}
        {!user ? (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Signup
            </Link>
          </>
        ) : (
          <button
            onClick={() => logout()}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};
