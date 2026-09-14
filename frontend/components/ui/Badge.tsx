import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "teal" | "navy" | "amber" | "slate" | "rose";
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "emerald", ...props }) => {
  const variants = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    navy: "bg-slate-100 text-slate-800 border-slate-300",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
