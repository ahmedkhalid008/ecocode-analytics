"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchRecommendationInsights } from "@/lib/api";
import { RecommendationInsight } from "@/lib/types";
import {
  Lightbulb,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RefreshCw,
  TrendingDown,
  ArrowRight,
  Code2,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface AIRecommendationsProps {
  apiKey?: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ apiKey }) => {
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchRecommendationInsights(apiKey);
      setInsights(data);
    } catch (err: any) {
      console.error("Failed to fetch recommendation insights:", err);
      if (err?.response?.status === 404) {
        setError("Advisor service initializing or endpoint not deployed yet. Please verify backend status.");
      } else {
        setError("Unable to connect to Smart Green FinOps Advisor. Please check network connectivity.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiKey]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const renderSeverityBadge = (severity: string) => {
    const sev = severity.toUpperCase();
    if (sev === "CRITICAL") {
      return (
        <Badge variant="rose" className="gap-1 px-2.5 py-1 text-xs font-bold shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>High Urgency</span>
        </Badge>
      );
    } else if (sev === "WARNING") {
      return (
        <Badge variant="amber" className="gap-1 px-2.5 py-1 text-xs font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Optimize</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="emerald" className="gap-1 px-2.5 py-1 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Healthy</span>
        </Badge>
      );
    }
  };

  return (
    <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 border-b border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight">
                  Smart Green FinOps Advisor
                </CardTitle>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Automated carbon waste detection, memory leak diagnosis, and code refactoring guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadInsights}
              disabled={isLoading || isRefreshing}
              className="gap-1.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Advisor</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                loadInsights();
              }}
              className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 flex-shrink-0"
            >
              Retry
            </Button>
          </div>
        ) : insights.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero Code Waste Detected</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All active telemetry workloads are operating within optimal latency (&lt;1000ms) and memory limits (&lt;512MB).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                  item.severity.toUpperCase() === "CRITICAL"
                    ? "bg-rose-50/30 border-rose-200/80"
                    : item.severity.toUpperCase() === "WARNING"
                    ? "bg-amber-50/30 border-amber-200/80"
                    : "bg-emerald-50/20 border-emerald-200/80"
                }`}
              >
                {/* Item Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 text-emerald-400 font-mono text-xs font-bold tracking-tight">
                      {item.algorithm_name}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.metric_value}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderSeverityBadge(item.severity)}
                  </div>
                </div>

                {/* Title & Root-Cause Diagnosis */}
                <div className="mt-3 space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    {item.type === "latency" ? (
                      <Zap className="w-4 h-4 text-amber-500" />
                    ) : item.type === "memory" ? (
                      <Cpu className="w-4 h-4 text-rose-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.insight}
                  </p>
                </div>

                {/* Action Box */}
                <div className="mt-3.5 p-3 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recommended Refactoring Action</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-2 rounded border border-slate-200/60">
                    {item.action}
                  </p>
                </div>

                {/* Potential Saving Pill */}
                <div className="mt-3 flex items-center justify-between pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Potential Savings: {item.potential_saving}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Rule-Based FinOps ID: {item.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
