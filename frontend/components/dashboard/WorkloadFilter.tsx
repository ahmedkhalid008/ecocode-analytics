import React from "react";
import { clsx } from "clsx";

interface WorkloadFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { label: "All Workloads", value: null },
  { label: "Algorithms", value: "Algorithms" },
  { label: "ETL Pipelines", value: "ETL Pipelines" },
  { label: "Model Training", value: "Model Training" },
];

export const WorkloadFilter: React.FC<WorkloadFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.value;
        return (
          <button
            key={cat.label}
            onClick={() => onSelectCategory(cat.value)}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              isActive
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
