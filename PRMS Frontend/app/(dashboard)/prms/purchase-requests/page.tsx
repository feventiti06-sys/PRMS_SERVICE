"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, MoreVertical, Eye, FileText, CheckCircle,
  Clock, XCircle, DollarSign, ArrowUpRight, Loader2, AlertCircle, RefreshCw, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useRequisitionsByRequester, useSubmitRequisition } from "@/features/prms/hooks/use-requisitions";
import { prStatusBadge, prStatusLabel, type BackendPRStatus } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseRequestsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const employeeId = user?.username ?? null;
  const { data: requisitions, isLoading, isError, refetch } = useRequisitionsByRequester(employeeId);
  const submitRequisition = useSubmitRequisition();

  const filtered = (requisitions ?? []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      r.purpose.toLowerCase().includes(q) ||
      r.requisitionNumber.toLowerCase().includes(q) ||
      r.requesterEmployeeId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: requisitions?.length ?? 0,
    pending: requisitions?.filter((r) => r.status === "PENDING_APPROVAL").length ?? 0,
    approved: requisitions?.filter((r) => r.status === "APPROVED").length ?? 0,
    totalAmt: requisitions?.reduce((s, r) => s + (r.estimatedAmount ?? 0), 0) ?? 0,
  };

  if (!employeeId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <AlertCircle className="h-10 w-10 text-amber-400" />
        <p className="text-gray-600">No authenticated user found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your purchase requisitions</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/purchase-requests/new">
            <Plus className="h-4 w-4 mr-2" />New Purchase Request
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading requisitions for <code className="font-mono text-xs">{employeeId}</code>…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load requisitions. Ensure Keycloak is running and you have a valid session.
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total PRs", value: stats.total, icon: FileText, bg: "bg-blue-500" },
          { label: "Pending Approval", value: stats.pending, icon: Clock, bg: "bg-amber-500" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, bg: "bg-green-500" },
          { label: "Total Value", value: formatCurrency(stats.totalAmt), icon: DollarSign, bg: "bg-purple-500" },
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

      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by number, title, or requester…"
              className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {["all", "DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "PO_CREATED"].map((v) => (
                <SelectItem key={v} value={v}>{v === "all" ? "All Status" : prStatusLabel(v as BackendPRStatus)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Purchase Requests ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["PR Number", "Purpose", "Department", "Required By", "Amount", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-[#1e50c8]">{r.requisitionNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 max-w-[200px] truncate">{r.purpose}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <User className="h-3 w-3" />{r.requesterEmployeeId}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{r.departmentCode}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{r.requiredByDate}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(r.estimatedAmount ?? 0)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${prStatusBadge(r.status)} border-0 text-xs font-semibold`}>
                          {prStatusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                            <DropdownMenuLabel className="text-gray-700 text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer" asChild>
                              <Link href={`/prms/purchase-requests/${r.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-2" />View Details
                              </Link>
                            </DropdownMenuItem>
                            {r.status === "DRAFT" && (
                              <DropdownMenuItem
                                className="text-xs text-blue-600 hover:bg-blue-50 cursor-pointer"
                                disabled={submitRequisition.isPending}
                                onClick={() => submitRequisition.mutate(r.id)}
                              >
                                <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                                {submitRequisition.isPending ? "Submitting…" : "Submit for Approval"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-400">
                        {requisitions?.length === 0
                          ? "No purchase requests yet. Create your first one."
                          : "No requests match your filter."}
                      </td>
                    </tr>
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
