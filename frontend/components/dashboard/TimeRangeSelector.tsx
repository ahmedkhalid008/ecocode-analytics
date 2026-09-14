import React from "react";
import { Calendar } from "lucide-react";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onSelectRange: (range: string) => void;
}

const timeRanges = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onSelectRange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-slate-400" />
      <select
        value={selectedRange}
        onChange={(e) => onSelectRange(e.target.value)}
        className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
      >
        {timeRanges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};
