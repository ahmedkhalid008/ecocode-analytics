"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getUser } from "@/lib/auth";
import { Building2, Shield, Zap, Users, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const user = getUser();

  // Simulated subscription usage metrics
  const currentRuns = 1420;
  const limitRuns = 10000;
  const usagePercentage = Math.min(Math.round((currentRuns / limitRuns) * 100), 100);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Organization Settings & Billing Tier"
        subtitle="Manage your Green FinOps subscription, telemetry quota limits, and workspace details"
      />

      <main className="p-8 space-y-6 flex-1 max-w-5xl">
        {/* Organization Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Organization Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Organization Name
                </label>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {user ? user.email.split("@")[1].split(".")[0].toUpperCase() + " FinOps Workspace" : "Demo Workspace"}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Subscription Tier
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="emerald">STARTER TIER</Badge>
                  <span className="text-xs text-slate-500 font-medium">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Run Quota Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Monthly Telemetry Run Quota</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{currentRuns.toLocaleString()} / {limitRuns.toLocaleString()} runs used</span>
              <span className="text-emerald-600 font-bold">{usagePercentage}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <p className="text-xs text-slate-500">
              Resets on the 1st of every calendar month. Upgrade your plan to increase throughput limits.
            </p>
          </CardContent>
        </Card>

        {/* Plan Tier Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Available Subscription Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="border border-emerald-500 bg-emerald-50/20 rounded-xl p-5 relative flex flex-col justify-between">
                <Badge variant="emerald" className="absolute -top-3 left-4">Current Plan</Badge>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Starter</h4>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">$0 <span className="text-xs font-medium text-slate-500">/ mo</span></p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 10,000 runs / month</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 3 API Keys</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Executive Dashboard</li>
                  </ul>
                </div>
              </div>

              {/* Growth */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Growth</h4>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">$299 <span className="text-xs font-medium text-slate-500">/ mo</span></p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 250,000 runs / month</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 25 API Keys</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Power BI Exports</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="mt-6">Upgrade to Growth</Button>
              </div>

              {/* Enterprise */}
              <div className="border border-slate-200 bg-white rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Enterprise</h4>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">Custom</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unlimited runs</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated RAPL Hardware</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SLA & 24/7 Support</li>
                  </ul>
                </div>
                <Button variant="secondary" size="sm" className="mt-6">Contact Sales</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
