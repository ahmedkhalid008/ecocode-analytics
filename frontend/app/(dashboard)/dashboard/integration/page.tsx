"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchApiKeys } from "@/lib/api";
import { APIKey } from "@/lib/types";
import {
  Code2,
  Terminal,
  KeyRound,
  Copy,
  Check,
  Zap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Plus,
  FileCode,
  CheckCircle2,
  Sparkles,
  Cpu,
  Layers,
} from "lucide-react";

export default function IntegrationPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [customKeyInput, setCustomKeyInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"decorator" | "curl" | "sdk">("decorator");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const backendIngestUrl = "https://ecocode-backend-si2i.onrender.com/api/v1/telemetry/ingest";

  useEffect(() => {
    async function loadKeys() {
      setIsLoadingKeys(true);
      try {
        const data = await fetchApiKeys();
        setKeys(data);
        const activeKeys = data.filter((k) => k.is_active);
        if (activeKeys.length > 0) {
          setSelectedKeyId(activeKeys[0].id);
          setCustomKeyInput(activeKeys[0].key_prefix + "••••••••••••••••");
        } else {
          setCustomKeyInput("eco_live_YOUR_API_KEY_HERE");
        }
      } catch (err) {
        console.error("Failed to fetch API keys for integration page:", err);
        setCustomKeyInput("eco_live_YOUR_API_KEY_HERE");
      } finally {
        setIsLoadingKeys(false);
      }
    }
    loadKeys();
  }, []);

  const activeKeys = keys.filter((k) => k.is_active);

  const handleSelectKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedKeyId(val);
    if (val === "custom") {
      setCustomKeyInput("eco_live_YOUR_API_KEY_HERE");
    } else {
      const found = keys.find((k) => k.id === val);
      if (found) {
        setCustomKeyInput(found.key_prefix + "••••••••••••••••");
      }
    }
  };

  const getEffectiveApiKey = () => {
    return customKeyInput.trim() || "eco_live_YOUR_API_KEY_HERE";
  };

  const effectiveApiKey = getEffectiveApiKey();

  // Python Decorator Script Code
  const pythonScriptCode = `import time
import json
import platform
import urllib.request
from datetime import datetime, timezone

# ------------------------------------------------------------------
# EcoCode Telemetry Configuration
# ------------------------------------------------------------------
API_INGEST_URL = "${backendIngestUrl}"
X_API_KEY = "${effectiveApiKey}"

def track_telemetry(
    workload_name: str,
    category: str = "Algorithms",
    department: str = "Software Eng"
):
    """
    Python Decorator for capturing execution runtime (ms), estimating CPU power & CO2,
    and posting telemetry to the EcoCode Analytics backend.
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            
            # Execute wrapped target function
            result = func(*args, **kwargs)
            
            end_time = time.perf_counter()
            execution_time_sec = end_time - start_time
            execution_time_ms = round(execution_time_sec * 1000, 2)
            
            # Hardware power estimation (Average 35W CPU TDP, 475g CO2/kWh grid factor)
            cpu_power_watt = 35.0
            energy_consumed_kwh = (cpu_power_watt * execution_time_sec) / 3_600_000.0
            co2_emitted_grams = energy_consumed_kwh * 475.0
            ram_usage_mb = 128.0  # Process memory footprint estimation
            
            payload = {
                "workload_name": workload_name,
                "workload_category": category,
                "department": department,
                "execution_time_sec": round(execution_time_sec, 6),
                "cpu_power_watt": round(cpu_power_watt, 2),
                "energy_consumed_kwh": float(f"{energy_consumed_kwh:.8f}"),
                "co2_emitted_grams": float(f"{co2_emitted_grams:.6f}"),
                "ram_usage_mb": ram_usage_mb,
                "host_os": f"{platform.system()} {platform.release()}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Stream payload via HTTP POST with X-API-Key header
            try:
                req = urllib.request.Request(
                    API_INGEST_URL,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "X-API-Key": X_API_KEY
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    print(f"[✓ EcoCode] Telemetry sent ({execution_time_ms}ms | {co2_emitted_grams:.4f}g CO2) | HTTP {resp.status}")
            except Exception as err:
                print(f"[⚠ EcoCode] Failed to dispatch telemetry: {err}")
                
            return result
        return wrapper
    return decorator


# ------------------------------------------------------------------
# Example Instrumented Workload
# ------------------------------------------------------------------
@track_telemetry(
    workload_name="quicksort_dataset_processing",
    category="Algorithms",
    department="Data Eng"
)
def process_large_dataset():
    print("Processing computational workload dataset...")
    # Simulate high-intensity CPU execution
    dataset = [x ** 2 for x in range(1_500_000)]
    time.sleep(0.2)
    return len(dataset)


if __name__ == "__main__":
    print("Starting EcoCode Instrumented Telemetry Run...")
    items_count = process_large_dataset()
    print(f"Completed processing {items_count:,} elements.")
`;

  // cURL Example Code
  const curlCode = `curl -X POST "${backendIngestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${effectiveApiKey}" \\
  -d '{
    "workload_name": "quicksort_dataset_processing",
    "workload_category": "Algorithms",
    "department": "Data Eng",
    "execution_time_sec": 0.354,
    "cpu_power_watt": 35.0,
    "energy_consumed_kwh": 0.00000344,
    "co2_emitted_grams": 0.001634,
    "ram_usage_mb": 128.0,
    "host_os": "Linux x86_64",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'`;

  // EcoCode Python SDK Code
  const sdkCode = `# Step 1: Install official PyPI package
# pip install ecocode-telemetry

import time
from ecocode import track_carbon

API_KEY = "${effectiveApiKey}"

@track_carbon(
    api_key=API_KEY,
    workload_name="neural_net_inference_batch",
    category="Model Training",
    department="AI / ML"
)
def run_batch_inference():
    """
    Automated zero-overhead background queue streaming CPU power (W),
    RAM usage (MB), kWh energy, and gCO2 to EcoCode Analytics.
    """
    print("Running deep learning model inference batch...")
    data = [x * 0.5 for x in range(2_000_000)]
    time.sleep(0.4)
    return len(data)

if __name__ == "__main__":
    run_batch_inference()
    print("Telemetry queued and streamed to EcoCode Cloud.")`;

  const getCurrentTabCode = () => {
    switch (activeTab) {
      case "decorator":
        return pythonScriptCode;
      case "curl":
        return curlCode;
      case "sdk":
        return sdkCode;
      default:
        return pythonScriptCode;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCurrentTabCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(effectiveApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Header with clean Green/Emerald Theme */}
      <Header
        title="Developer Quickstart & Telemetry Integration"
        subtitle="Instrument your Python services or REST API pipelines to stream green FinOps carbon & energy telemetry"
      />

      <main className="p-8 space-y-8 flex-1 max-w-6xl">
        {/* Emerald Welcome & Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-xl border border-emerald-900/40">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Overhead Ingestion Pipeline</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Stream Function-Level Carbon Telemetry in Under 2 Minutes
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your microservices, ETL pipelines, or AI workloads to EcoCode Analytics using our standalone Python decorator or raw cURL HTTP POST requests.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/keys">
                <Button variant="primary" className="gap-2 shadow-md shadow-emerald-600/30">
                  <KeyRound className="w-4 h-4" /> Manage API Keys
                </Button>
              </Link>
              <a href="#quickstart-code" className="inline-block">
                <Button variant="outline" className="gap-2 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Jump to Code
                </Button>
              </a>
            </div>
          </div>

          {/* Quick 3-Step Setup Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-white">Select API Key</p>
                <p className="text-[11px] text-slate-400">Choose tenant active key below</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-white">Copy Code Snippet</p>
                <p className="text-[11px] text-slate-400">Decorator or cURL example</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-white">View Real-time Metrics</p>
                <p className="text-[11px] text-slate-400">Instantly displayed on dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Key Selector Card */}
        <Card className="border-emerald-100 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Tenant Active API Key Selector</span>
              </CardTitle>
              <Link href="/keys" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Generate New Key
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {isLoadingKeys ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Active Key Dropdown */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Select Tenant API Key</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({activeKeys.length} active key{activeKeys.length === 1 ? "" : "s"})
                    </span>
                  </label>

                  {activeKeys.length > 0 ? (
                    <select
                      value={selectedKeyId}
                      onChange={handleSelectKeyChange}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      {activeKeys.map((key) => (
                        <option key={key.id} value={key.id}>
                          {key.label} ({key.key_prefix}••••••••)
                        </option>
                      ))}
                      <option value="custom">✏ Use Custom / Manual API Key...</option>
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
                      <span>No active API key found</span>
                      <Link href="/keys" className="text-emerald-700 font-bold underline text-[11px]">
                        Create Key
                      </Link>
                    </div>
                  )}
                </div>

                {/* API Key Value / Prefix Display Input */}
                <div className="md:col-span-7 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Active Ingestion Header Key</span>
                    <Badge variant="emerald" className="text-[10px] py-0">
                      X-API-Key
                    </Badge>
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customKeyInput}
                        onChange={(e) => setCustomKeyInput(e.target.value)}
                        placeholder="eco_live_..."
                        className="w-full font-mono text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all select-all"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyApiKey}
                      className="gap-1.5 flex-shrink-0 text-xs font-medium border-slate-300 hover:bg-slate-50"
                      title="Copy API key string"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                The selected key is automatically injected into all code tabs below. Keep your secret keys secure in production environment variables.
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Tabbed Code Snippet Box Section */}
        <div id="quickstart-code" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <span>Integration Code Snippets</span>
              </h3>
              <p className="text-xs text-slate-500">
                Choose your preferred integration mode below to instrument your workload telemetry.
              </p>
            </div>

            {/* Ingest Endpoint Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">POST</span>
              <span className="truncate max-w-xs text-slate-400">{backendIngestUrl}</span>
            </div>
          </div>

          {/* Code Container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-200">
            {/* Header: Tabs + Copy Button */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("decorator")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "decorator"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Tab 1: Python Decorator</span>
                </button>

                <button
                  onClick={() => setActiveTab("curl")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "curl"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Tab 2: cURL / HTTP POST</span>
                </button>

                <button
                  onClick={() => setActiveTab("sdk")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "sdk"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Tab 3: EcoCode PyPI SDK</span>
                </button>
              </div>

              {/* Copy Code Button */}
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-x-auto bg-slate-900/95 font-mono text-xs leading-relaxed text-slate-300">
              <pre className="text-emerald-300 font-mono select-all">
                <code>{getCurrentTabCode()}</code>
              </pre>
            </div>

            {/* Footer Note */}
            <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy-pasteable standalone execution ready out-of-the-box</span>
              </span>
              <span className="text-slate-500 font-mono">X-API-Key: {effectiveApiKey.slice(0, 14)}...</span>
            </div>
          </div>
        </div>

        {/* Telemetry Payload Specification Table & API Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Schema Specs */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="bg-slate-50/70 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Telemetry Ingestion Schema Reference</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Field</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Required</th>
                      <th className="px-5 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">workload_name</td>
                      <td className="px-5 py-3 font-mono text-slate-500">string</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Unique identifier for the function or script run</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">workload_category</td>
                      <td className="px-5 py-3 font-mono text-slate-500">string</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Category (e.g., Algorithms, ETL Pipelines, Model Training)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">department</td>
                      <td className="px-5 py-3 font-mono text-slate-500">string</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Internal department (e.g., Data Eng, AI/ML, DevOps)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">execution_time_sec</td>
                      <td className="px-5 py-3 font-mono text-slate-500">float</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Wall-clock execution duration in seconds</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">cpu_power_watt</td>
                      <td className="px-5 py-3 font-mono text-slate-500">float</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">CPU TDP / active power draw in Watts</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">energy_consumed_kwh</td>
                      <td className="px-5 py-3 font-mono text-slate-500">float</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Calculated energy in Kilowatt-hours (kWh)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">co2_emitted_grams</td>
                      <td className="px-5 py-3 font-mono text-slate-500">float</td>
                      <td className="px-5 py-3"><Badge variant="emerald">Required</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Calculated greenhouse carbon equivalent in grams (gCO2)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">ram_usage_mb</td>
                      <td className="px-5 py-3 font-mono text-slate-500">float</td>
                      <td className="px-5 py-3"><Badge variant="slate">Optional</Badge></td>
                      <td className="px-5 py-3 text-slate-600">Memory usage footprint in Megabytes</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Response Status Codes & Security */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="bg-slate-50/70 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>HTTP Response Status Codes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
                  <Badge variant="emerald" className="font-mono">200 / 201</Badge>
                  <div>
                    <p className="font-bold text-emerald-950">Ingestion Success</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">Telemetry metrics queued and aggregated successfully.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-rose-50/80 border border-rose-200">
                  <Badge variant="rose" className="font-mono">401</Badge>
                  <div>
                    <p className="font-bold text-rose-950">Unauthorized Key</p>
                    <p className="text-[11px] text-rose-800 mt-0.5">Missing or invalid X-API-Key header.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200">
                  <Badge variant="amber" className="font-mono">422</Badge>
                  <div>
                    <p className="font-bold text-amber-950">Validation Error</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">Missing required JSON payload fields.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white border-emerald-800">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>Need help or custom integrations?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our engineering team provides custom SDKs for Java, Node.js, Go, and Kubernetes daemonsets.
                </p>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="w-full mt-2 border-slate-700 text-slate-200 hover:bg-slate-800 gap-1.5">
                    Return to Executive Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
