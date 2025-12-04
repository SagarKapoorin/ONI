import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
      isActive
        ? "bg-sky-500 text-white shadow-sm shadow-sky-300/60"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-xs font-bold text-white shadow-md shadow-sky-400/60">
            ONI
          </span>
          <span className="hidden text-base sm:inline">ONI Library</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {user && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                My profile
              </NavLink>
              {user.role === "ADMIN" && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Sign up
              </NavLink>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 lg:inline">
                Signed in as{" "}
                <span className="font-semibold text-slate-900">
                  {user.name}
                </span>
              </span>
              <button
                onClick={() => logout()}
                className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-sm shadow-slate-400/60 transition hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm shadow-slate-200/80 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {user && (
              <>
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/profile"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  My profile
                </NavLink>
                {user.role === "ADMIN" && (
                  <NavLink
                    to="/admin"
                    className={navLinkClass}
                    onClick={closeMenu}
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Sign up
                </NavLink>
              </>
            )}

            {user && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="mt-1 inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-sm shadow-red-300/60 transition hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
