"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle, XCircle, MessageSquare, ExternalLink,
  Loader2, AlertCircle, RefreshCw, Clock, DollarSign,
} from "lucide-react";
import { usePendingApprovals, useDecideOnRequisition } from "@/features/prms/hooks/use-approvals";
import { prStatusBadge, prStatusLabel, type RequisitionResponse } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

export default function ApprovalsPage() {
  const [search, setSearch] = useState("");
  const { data: pending, isLoading, isError, refetch } = usePendingApprovals();
  const decide = useDecideOnRequisition();

  const filtered = (pending ?? []).filter((r) => {
    const q = search.toLowerCase();
    return (
      !search ||
      r.purpose.toLowerCase().includes(q) ||
      r.requisitionNumber.toLowerCase().includes(q) ||
      r.requesterEmployeeId.toLowerCase().includes(q)
    );
  });

  const totalValue = (pending ?? []).reduce((s, r) => s + (r.estimatedAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">Requisitions awaiting your approval</p>
        </div>
        <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading pending approvals…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load approvals. Ensure you are logged in with the PROCUREMENT_ADMIN role.
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Pending Approvals", value: pending?.length ?? 0, icon: Clock, bg: "bg-amber-500" },
          { label: "Total Value", value: formatCurrency(totalValue), icon: DollarSign, bg: "bg-blue-500" },
          { label: "Shown", value: filtered.length, icon: CheckCircle, bg: "bg-green-500" },
        ].map(({ label, value, icon: Icon, bg }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search by number, purpose, or requester…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: RequisitionResponse) => (
            <Card key={req.id} className="border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className="w-1.5 rounded-l-lg flex-shrink-0 bg-amber-500" />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-gray-500">{req.requisitionNumber}</span>
                          <Badge className={`${prStatusBadge(req.status)} border-0 text-[11px] font-semibold`}>
                            {prStatusLabel(req.status)}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{req.purpose}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>Requester: <span className="text-gray-600 font-medium">{req.requesterEmployeeId}</span></span>
                          <span>Dept: <span className="text-gray-600 font-medium">{req.departmentCode}</span></span>
                          <span>Required by: <span className="text-gray-600">{req.requiredByDate}</span></span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(req.estimatedAmount ?? 0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => decide.mutate({ requisitionId: req.id, action: "APPROVE" })}
                        disabled={decide.isPending}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 bg-red-600 hover:bg-[#a00f1a] text-white text-xs"
                        onClick={() => decide.mutate({ requisitionId: req.id, action: "REJECT", comments: "Rejected via approval center" })}
                        disabled={decide.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-gray-300 text-gray-600 text-xs"
                        onClick={() => decide.mutate({ requisitionId: req.id, action: "RETURN", comments: "Changes requested" })}
                        disabled={decide.isPending}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />Return
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[#1e50c8] text-xs hover:bg-blue-50" asChild>
                        <Link href={`/prms/purchase-requests/${req.id}`}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && !isLoading && (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="py-16 text-center text-gray-400">
                {pending?.length === 0
                  ? "No requisitions pending approval."
                  : "No results match your search."}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
