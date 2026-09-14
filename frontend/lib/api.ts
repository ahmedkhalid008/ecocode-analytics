import axios from "axios";
import { getAuthToken, logout } from "./auth";
import {
  Token,
  User,
  APIKey,
  APIKeyCreatedResponse,
  AnalyticsSummary,
  WorkloadCO2Ranking,
  DepartmentCO2Breakdown,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Token to Requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Response Interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service Calls
export async function registerTenant(payload: {
  email: string;
  password: string;
  org_name: string;
  org_slug: string;
}): Promise<User> {
  const res = await api.post<User>("/auth/register", payload);
  return res.data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<Token> {
  const res = await api.post<Token>("/auth/login", payload);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

// API Key Service Calls
export async function fetchApiKeys(): Promise<APIKey[]> {
  const res = await api.get<APIKey[]>("/keys");
  return res.data;
}

export async function createApiKey(label: string): Promise<APIKeyCreatedResponse> {
  const res = await api.post<APIKeyCreatedResponse>("/keys", { label });
  return res.data;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await api.delete(`/keys/${keyId}`);
}

// Analytics Service Calls
export async function fetchAnalyticsSummary(params?: {
  time_range?: string;
  workload_category?: string;
  cost_per_kwh?: number;
}): Promise<AnalyticsSummary> {
  const res = await api.get<AnalyticsSummary>("/analytics/summary", { params });
  return res.data;
}

export async function fetchAnalyticsByAlgorithm(params?: {
  time_range?: string;
  workload_category?: string;
  limit?: number;
}): Promise<WorkloadCO2Ranking[]> {
  const res = await api.get<WorkloadCO2Ranking[]>("/analytics/by-algorithm", { params });
  return res.data;
}

export async function fetchAnalyticsByDepartment(params?: {
  time_range?: string;
  workload_category?: string;
}): Promise<DepartmentCO2Breakdown[]> {
  const res = await api.get<DepartmentCO2Breakdown[]>("/analytics/by-department", { params });
  return res.data;
}
