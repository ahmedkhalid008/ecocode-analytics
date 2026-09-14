"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchAnalyticsByAlgorithm } from "@/lib/api";
import { WorkloadCO2Ranking } from "@/lib/types";
import { Search, Filter, Cpu } from "lucide-react";

export default function WorkloadsPage() {
  const [workloads, setWorkloads] = useState<WorkloadCO2Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    async function loadWorkloads() {
      setIsLoading(true);
      try {
        const data = await fetchAnalyticsByAlgorithm({ time_range: "all", limit: 100 });
        setWorkloads(data);
      } catch (err) {
        console.error("Failed to load workloads:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkloads();
  }, []);

  const filteredWorkloads = workloads.filter((w) => {
    const matchesSearch = w.workload_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.workload_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || w.workload_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryBadgeVariant = (cat: string) => {
    if (cat === "Algorithms") return "emerald";
    if (cat === "Model Training") return "teal";
    if (cat === "ETL Pipelines") return "navy";
    return "amber";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Software Workloads & Telemetry Inventory"
        subtitle="Detailed inventory of profiled algorithms, machine learning models, and ETL pipelines"
      />

      <main className="p-8 space-y-6 flex-1">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Profiled Functions ({filteredWorkloads.length})</span>
              </CardTitle>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter by function name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="ETL Pipelines">ETL Pipelines</option>
                  <option value="Model Training">Model Training</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredWorkloads.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                No software workloads found matching filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Workload / Function Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3 text-right">Executions</th>
                      <th className="px-6 py-3 text-right">Avg Duration (sec)</th>
                      <th className="px-6 py-3 text-right">Energy (kWh)</th>
                      <th className="px-6 py-3 text-right">Total CO2 (g)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredWorkloads.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900 font-mono">
                          {w.workload_name}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant={categoryBadgeVariant(w.workload_category)}>
                            {w.workload_category}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">{w.total_runs.toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-right font-mono">{w.avg_execution_time_sec.toFixed(4)}s</td>
                        <td className="px-6 py-3.5 text-right font-mono">{w.total_energy_kwh.toFixed(4)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-emerald-700 font-bold">
                          {w.total_co2_grams.toFixed(2)} g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
