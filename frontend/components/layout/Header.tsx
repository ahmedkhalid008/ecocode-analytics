"use client";

import React from "react";
import { Search, Bell, ShieldCheck } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search telemetry or workloads..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ingestion Active</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
