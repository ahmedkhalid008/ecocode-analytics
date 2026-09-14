import React from "react";
import { DollarSign, Zap, Leaf, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnalyticsSummary } from "@/lib/types";

interface MetricCardsProps {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary, isLoading }) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Cost ($)",
      value: `$${summary.total_cost_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "@ $0.15/kWh electricity factor",
      icon: DollarSign,
      iconBg: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      title: "Total Energy (kWh)",
      value: summary.total_energy_kwh.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
      subtext: `${summary.total_runs.toLocaleString()} runs recorded`,
      icon: Zap,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      title: "Total CO2 (g)",
      value: summary.total_co2_grams.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      subtext: "Estimated carbon footprint",
      icon: Leaf,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "CO2 Optimization Savings",
      value: `${summary.estimated_savings_pct}%`,
      subtext: "Achieved via code optimization",
      icon: TrendingDown,
      iconBg: "bg-emerald-100 text-emerald-700 border-emerald-300",
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card key={idx} className="transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
                <h3 className={`text-2xl font-bold mt-1 tracking-tight ${c.highlight ? "text-emerald-600" : "text-slate-900"}`}>
                  {c.value}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{c.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${c.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
