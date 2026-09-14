import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(clsx("animate-shimmer rounded-lg bg-slate-200", className))}
      {...props}
    />
  );
};
