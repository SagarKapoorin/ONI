import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export const Button = ({
  loading,
  children,
  disabled,
  ...rest
}: ButtonProps) => {
  const { className, ...buttonProps } = rest;
  return (
    <button
      {...buttonProps}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed ${
        className ?? ""
      }`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
