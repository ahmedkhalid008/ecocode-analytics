"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  KeyRound,
  Settings,
  Leaf,
  LogOut,
  Building2,
  Code2,
} from "lucide-react";
import { clsx } from "clsx";
import { getUser, logout } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workloads & Telemetry", href: "/workloads", icon: Cpu },
  { name: "API Key Management", href: "/keys", icon: KeyRound },
  { name: "Quickstart & Integration", href: "/dashboard/integration", icon: Code2 },
  { name: "Organization & Tier", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const user = getUser();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-none">EcoCode</h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">Green FinOps Telemetry</p>
          </div>
        </div>

        {/* Active Organization Context */}
        <div className="mx-4 my-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate">
              {user ? user.email.split("@")[1].split(".")[0].toUpperCase() : "Tenant Org"}
            </span>
          </div>
          <Badge variant="emerald" className="text-[10px] py-0">STARTER</Badge>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.email || "developer@ecocode.io"}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role || "ADMIN"}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
