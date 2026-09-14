import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                "block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500",
                icon && "pl-10",
                error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
