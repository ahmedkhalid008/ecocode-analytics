import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoCode Analytics - Code-Level Carbon Telemetry & Green FinOps",
  description: "Multi-tenant B2B SaaS platform for real-time code-level carbon telemetry, software energy tracking, and green FinOps optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
