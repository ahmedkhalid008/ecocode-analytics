"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkloadCO2Ranking } from "@/lib/types";

interface AlgorithmBarChartProps {
  rankings: WorkloadCO2Ranking[];
  isLoading: boolean;
}

export const AlgorithmBarChart: React.FC<AlgorithmBarChartProps> = ({ rankings, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="p-6 h-80 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts horizontal bar layout
  const chartData = rankings.map((item) => ({
    name: item.workload_name.length > 22 ? `${item.workload_name.slice(0, 20)}...` : item.workload_name,
    fullName: item.workload_name,
    category: item.workload_category,
    co2: item.total_co2_grams,
    runs: item.total_runs,
  }));

  const BAR_COLOR = "#059669"; // Emerald 600

  return (
    <Card className="h-[420px] flex flex-col">
      <CardHeader className="py-4">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">Total CO2 (g) by algorithm_name</CardTitle>
          <p className="text-xs text-slate-500">Ranked by total carbon footprint</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            No workload telemetry recorded for selected criteria.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} unit=" g" />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#334155" }}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700">
                        <p className="font-bold text-emerald-400">{data.fullName}</p>
                        <p className="text-slate-300 mt-1">Category: {data.category}</p>
                        <p className="text-slate-300">Total CO2: <span className="text-white font-semibold">{data.co2} g</span></p>
                        <p className="text-slate-300">Total Executions: <span className="text-white font-semibold">{data.runs}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="co2" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
