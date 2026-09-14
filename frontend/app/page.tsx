import Link from "next/link";
import { Leaf, ArrowRight, ShieldCheck, Zap, BarChart3, Terminal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">EcoCode Analytics</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-time Code Carbon Telemetry & Green FinOps Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Measure & Cut Your <span className="text-emerald-600">Software Carbon Footprint</span> Down to the Function Line
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          EcoCode Analytics provides real-time CPU power, energy (kWh), and CO2 telemetry for algorithms, ETL pipelines, and AI models—enabling software teams to reduce cloud electricity costs by up to 45%.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2 shadow-lg shadow-emerald-600/20">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Explore Live Demo</Button>
          </Link>
        </div>
      </section>

      {/* Code Snippet Instrument Demo */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-slate-400">instrumentation.py</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              pip install ecocode
            </span>
          </div>

          <pre className="text-sm font-mono leading-relaxed overflow-x-auto text-emerald-300">
{`from ecocode import track_carbon

@track_carbon(
    workload_name="quicksort_benchmark",
    category="Algorithms",
    department="Software Eng"
)
def optimize_sorting_pipeline(dataset: list):
    # Real-time Watts, kWh, and gCO2 are automatically calculated & streamed
    return sorted(dataset)`}
          </pre>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-12">
          Engineered for Enterprise Green FinOps & Sustainability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hardware Power Sampler</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Samples CPU utilization, RAM usage, and active TDP draw to calculate precise kWh energy consumption across any OS.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Executive BI Analytics</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Replaces legacy Power BI DAX models with instant department energy donuts and workload carbon rankings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4 border border-slate-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Non-Blocking Queue SDK</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Thread-safe background daemon dispatcher streams telemetry without adding latency to your application.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 EcoCode Analytics Inc. All rights reserved. Code-Level Green FinOps Platform.</p>
      </footer>
    </div>
  );
}
