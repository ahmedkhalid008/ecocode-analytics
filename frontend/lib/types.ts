export type OrgTier = "STARTER" | "GROWTH" | "ENTERPRISE";
export type UserRole = "ADMIN" | "DEVELOPER" | "VIEWER";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  org_id: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: OrgTier;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface APIKey {
  id: string;
  key_prefix: string;
  label: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface APIKeyCreatedResponse {
  id: string;
  key_prefix: string;
  full_key: string;
  label: string;
  created_at: string;
}

export interface TelemetryPayload {
  workload_name: string;
  workload_category: string;
  department: string;
  execution_time_sec: number;
  cpu_power_watt: number;
  energy_consumed_kwh: number;
  co2_emitted_grams: number;
  ram_usage_mb: number;
  host_os: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  total_co2_grams: number;
  total_energy_kwh: number;
  total_cost_usd: number;
  estimated_savings_pct: number;
  total_runs: number;
}

export interface WorkloadCO2Ranking {
  workload_name: string;
  workload_category: string;
  total_co2_grams: number;
  total_energy_kwh: number;
  total_runs: number;
  avg_execution_time_sec: number;
}

export interface DepartmentCO2Breakdown {
  department: string;
  total_co2_grams: number;
  total_energy_kwh: number;
  total_runs: number;
  percentage_of_total: number;
}

export interface RecommendationInsight {
  id: string;
  type: "latency" | "memory" | "healthy" | "optimization" | string;
  severity: "CRITICAL" | "WARNING" | "HEALTHY" | "INFO" | string;
  algorithm_name: string;
  metric_value: string;
  title: string;
  insight: string;
  action: string;
  potential_saving: string;
}
