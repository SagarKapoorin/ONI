import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...rest }: InputProps) => {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        {...rest}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
};
