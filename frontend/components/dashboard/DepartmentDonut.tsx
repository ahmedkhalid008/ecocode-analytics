"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { DepartmentCO2Breakdown } from "@/lib/types";

interface DepartmentDonutProps {
  breakdown: DepartmentCO2Breakdown[];
  isLoading: boolean;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  "AI/ML": "#0D9488",         // Teal
  "Data Eng": "#1E293B",      // Dark Slate / Navy
  "Software Eng": "#F59E0B",  // Amber
};

const DEFAULT_COLOR = "#10B981"; // Emerald

export const DepartmentDonut: React.FC<DepartmentDonutProps> = ({ breakdown, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="h-[420px]">
        <CardHeader className="py-4">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="p-6 h-80 flex items-center justify-center">
          <Skeleton className="w-48 h-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = breakdown.map((item) => ({
    name: item.department,
    value: item.total_energy_kwh,
    co2: item.total_co2_grams,
    percentage: item.percentage_of_total,
    color: DEPARTMENT_COLORS[item.department] || DEFAULT_COLOR,
  }));

  return (
    <Card className="h-[420px] flex flex-col">
      <CardHeader className="py-4">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">Total Energy (kWh) by department</CardTitle>
          <p className="text-xs text-slate-500">Departmental breakdown of software power consumption</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            No departmental data recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700">
                        <p className="font-bold" style={{ color: data.color }}>{data.name}</p>
                        <p className="text-slate-300 mt-1">Energy: <span className="text-white font-semibold">{data.value} kWh</span></p>
                        <p className="text-slate-300">CO2: <span className="text-white font-semibold">{data.co2} g</span></p>
                        <p className="text-slate-300">Total Share: <span className="text-white font-semibold">{data.percentage}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-slate-700 px-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
