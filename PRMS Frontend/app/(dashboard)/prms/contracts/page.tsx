"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, FileCheck, CheckCircle, AlertCircle as AlertIcon,
  DollarSign, Loader2, AlertCircle, RefreshCw, Eye, Edit,
} from "lucide-react";
import { useContracts } from "@/features/prms/hooks/use-contracts";
import type { ContractResponse } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

function contractStatus(c: ContractResponse): string {
  if (!c.active) return "INACTIVE";
  const now = new Date();
  const end = new Date(c.endDate);
  const daysToExpiry = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  if (daysToExpiry < 0) return "EXPIRED";
  if (daysToExpiry <= 30) return "EXPIRING";
  return "ACTIVE";
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRING: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-red-100 text-red-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const { data: contracts, isLoading, isError, refetch } = useContracts();

  const filtered = (contracts ?? []).filter((c: ContractResponse) => {
    const q = search.toLowerCase();
    return (
      !search ||
      c.contractNumber.toLowerCase().includes(q) ||
      c.vendorName.toLowerCase().includes(q)
    );
  });

  const active = contracts?.filter((c) => contractStatus(c) === "ACTIVE").length ?? 0;
  const expiring = contracts?.filter((c) => contractStatus(c) === "EXPIRING").length ?? 0;
  const totalVal = contracts?.reduce((s, c) => s + (c.contractValue ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Supplier contracts from PostgreSQL</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />New Contract
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading contracts…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load contracts.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Contracts", value: contracts?.length ?? 0, bg: "bg-blue-500", icon: FileCheck },
          { label: "Active", value: active, bg: "bg-green-500", icon: CheckCircle },
          { label: "Expiring Soon", value: expiring, bg: "bg-amber-500", icon: AlertIcon },
          { label: "Total Value", value: formatCurrency(totalVal), bg: "bg-purple-500", icon: DollarSign },
        ].map(({ label, value, bg, icon: Icon }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p></div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className="h-5 w-5 text-white" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search contracts…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Contracts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Contract Number", "Vendor", "PO Number", "Value", "Start Date", "End Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c: ContractResponse) => {
                    const status = contractStatus(c);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{c.contractNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{c.vendorName}</td>
                        <td className="py-3 px-4 font-mono text-xs text-green-600">{c.purchaseOrderNumber ?? "—"}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(c.contractValue)}</td>
                        <td className="py-3 px-4 text-gray-700 text-xs">{c.startDate}</td>
                        <td className="py-3 px-4 text-gray-700 text-xs">{c.endDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${STATUS_STYLES[status]} border-0 text-xs font-semibold`}>{status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 text-gray-500 hover:bg-gray-100 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-400">
                      {contracts?.length === 0 ? "No contracts yet." : "No contracts match your search."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
