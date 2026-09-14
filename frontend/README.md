# EcoCode Analytics SaaS Web Application & Executive Dashboard

> Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Recharts Executive BI Dashboard.

This is the frontend client for **EcoCode Analytics**, replicating our Power BI Green-Ops executive telemetry dashboard, API Key lifecycle management, software workload inventory, and organization subscription settings.

---

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## Features

- **Executive BI Dashboard** (`/dashboard`):
  - 4 Floating KPI Cards (Total Cost $, Total Energy kWh, Total CO2 g, Optimization Savings %).
  - Recharts Donut Chart (`DepartmentDonut`) showing energy consumption by department.
  - Recharts Horizontal Bar Chart (`AlgorithmBarChart`) ranking workloads by total carbon emissions.
  - Interactive category slicer (All, Algorithms, ETL Pipelines, Model Training) and time range selector (7d, 30d, 90d, All time).
- **Software Workload Inventory** (`/workloads`): Searchable & filterable table of all profiled software functions.
- **API Key Management** (`/keys`): Create SHA-256 hashed API keys with one-click full key copy and key revocation.
- **Organization & Billing** (`/settings`): Subscription plan management and monthly telemetry run quota tracking.
- **Authentication**: JWT token storage in cookies/localStorage with Axios request/response interceptors.
