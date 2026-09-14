"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchApiKeys, createApiKey, revokeApiKey } from "@/lib/api";
import { APIKey, APIKeyCreatedResponse } from "@/lib/types";
import { KeyRound, Plus, Copy, Check, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<APIKeyCreatedResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApiKeys();
      setKeys(data);
    } catch (err) {
      console.error("Failed to load API keys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      const newKey = await createApiKey(label.trim());
      setCreatedKeyData(newKey);
      await loadKeys();
    } catch (err) {
      console.error("Failed to create API key:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKeyData?.full_key) {
      navigator.clipboard.writeText(createdKeyData.full_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm("Are you sure you want to revoke this API Key? Telemetry pipelines using it will be rejected.")) {
      return;
    }
    try {
      await revokeApiKey(keyId);
      await loadKeys();
    } catch (err) {
      console.error("Failed to revoke API key:", err);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setLabel("");
    setCreatedKeyData(null);
    setCopied(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="API Key Management"
        subtitle="Generate and manage SHA-256 hashed API Keys for Python SDK & CI/CD pipeline telemetry"
      />

      <main className="p-8 space-y-6 flex-1 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Active API Keys ({keys.length})</span>
              </CardTitle>
              <Button size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4" /> Generate New API Key
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                No API keys generated yet. Click "Generate New API Key" to instrument your Python application.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Label</th>
                      <th className="px-6 py-3">Key Prefix</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created At</th>
                      <th className="px-6 py-3">Last Used</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900">{k.label}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-600">{k.key_prefix}••••••••</td>
                        <td className="px-6 py-3.5">
                          {k.is_active ? (
                            <Badge variant="emerald">Active</Badge>
                          ) : (
                            <Badge variant="rose">Revoked</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{new Date(k.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {k.is_active && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Revoke key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Generate API Key Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={resetModal} title="Generate New API Key">
        {!createdKeyData ? (
          <form onSubmit={handleCreateKey} className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide a label describing where this API key will be deployed (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">Production Pipeline</code>).
            </p>

            <Input
              label="API Key Label"
              placeholder="e.g., Production Telemetry SDK"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Generate Key
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> Copy your API key now. For security, it is stored as a SHA-256 hash and will not be displayed again.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Plaintext API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKeyData.full_key}
                  className="w-full font-mono text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 select-all"
                />
                <Button size="sm" onClick={handleCopyKey} className="gap-1.5 flex-shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={resetModal}>
                Done & Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
