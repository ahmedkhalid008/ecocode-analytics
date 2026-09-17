"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { AlgorithmBarChart } from "@/components/dashboard/AlgorithmBarChart";
import { DepartmentDonut } from "@/components/dashboard/DepartmentDonut";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { WorkloadFilter } from "@/components/dashboard/WorkloadFilter";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { Button } from "@/components/ui/Button";
import {
  fetchAnalyticsSummary,
  fetchAnalyticsByAlgorithm,
  fetchAnalyticsByDepartment,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import {
  AnalyticsSummary,
  WorkloadCO2Ranking,
  DepartmentCO2Breakdown,
} from "@/lib/types";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rankings, setRankings] = useState<WorkloadCO2Ranking[]>([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<DepartmentCO2Breakdown[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        time_range: timeRange,
        workload_category: selectedCategory || undefined,
      };

      const [summaryRes, rankingsRes, deptRes] = await Promise.all([
        fetchAnalyticsSummary(params),
        fetchAnalyticsByAlgorithm(params),
        fetchAnalyticsByDepartment(params),
      ]);

      setSummary(summaryRes);
      setRankings(rankingsRes);
      setDepartmentBreakdown(deptRes);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const user = getUser();
  const orgName = user ? user.email.split("@")[1].split(".")[0].toUpperCase() + " Workspace" : "Tenant Organization";

  const handleExportCSV = () => {
    exportToCSV(rankings);
  };

  const handleExportPDF = () => {
    exportToPDF(summary, rankings, orgName, timeRange);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="EcoCode Analytics | Software Carbon & Energy Telemetry Dashboard"
        subtitle="Real-time green FinOps executive telemetry and algorithm emissions profiling"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Controls & Export Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Workload Category Slicer
              </span>
              <WorkloadFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Time Filter
              </span>
              <TimeRangeSelector
                selectedRange={timeRange}
                onSelectRange={setTimeRange}
              />
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-semibold"
              onClick={handleExportCSV}
              disabled={isLoading || rankings.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="gap-2 text-xs font-semibold shadow-sm"
              onClick={handleExportPDF}
              disabled={isLoading || rankings.length === 0}
            >
              <FileText className="w-4 h-4" />
              Download PDF Audit
            </Button>
          </div>
        </div>

        {/* 4 Floating Metric Cards */}
        <MetricCards summary={summary} isLoading={isLoading} />

        {/* Executive BI Visuals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Visual: Donut Chart of Energy Consumption by Department */}
          <div className="lg:col-span-5">
            <DepartmentDonut breakdown={departmentBreakdown} isLoading={isLoading} />
          </div>

          {/* Right Visual: Horizontal Bar Chart Ranking Workloads by CO2 Emitted */}
          <div className="lg:col-span-7">
            <AlgorithmBarChart rankings={rankings} isLoading={isLoading} />
          </div>
        </div>

        {/* Smart Green FinOps Advisor Widget */}
        <AIRecommendations />
      </main>
    </div>
  );
}
