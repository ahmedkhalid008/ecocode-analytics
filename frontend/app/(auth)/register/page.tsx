"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, Building2, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerTenant, loginUser, getMe } from "@/lib/api";
import { setAuthToken, setUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    setOrgSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registerTenant({
        email,
        password,
        org_name: orgName,
        org_slug: orgSlug || "org-slug",
      });

      // Auto login after registration
      const tokenData = await loginUser({ email, password });
      setAuthToken(tokenData.access_token);

      const user = await getMe();
      setUser(user);

      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || "Registration failed. Please check inputs.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-3">
            <Leaf className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Create EcoCode Organization</h2>
          <p className="text-xs text-slate-500 mt-1">Setup your tenant workspace and green FinOps account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Organization Name"
            placeholder="Acme FinOps Inc."
            value={orgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            required
            icon={<Building2 className="w-4 h-4" />}
          />

          <Input
            label="Organization URL Slug"
            placeholder="acme-finops"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            required
            icon={<Globe className="w-4 h-4" />}
          />

          <Input
            label="Admin Work Email"
            type="email"
            placeholder="admin@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password (min 8 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            icon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full py-2.5 mt-2" isLoading={isLoading}>
            Create Organization & Register
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an organization?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
