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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Filter, Download, Plus, MoreVertical, Eye, Edit, Trash2,
  FileText, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp,
  TrendingDown, User, DollarSign, ArrowUpRight, Loader2, WifiOff, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseRequestSummary, PurchaseRequestStatus, PurchaseRequestPriority } from "@/features/prms/types/purchase-request";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useRequisitionsByRequester, useSubmitRequisition } from "@/features/prms/hooks/use-requisitions";
import { RequisitionResponse, prStatusBadge, prStatusLabel } from "@/lib/prms-api";

const MOCK_DATA: PurchaseRequestSummary[] = [
  { id:"1", prNumber:"PR-2024-00123", title:"Laptop Computers for IT Department",     requesterId:"john.doe@insa.edu.et",      departmentName:"IT Department",  requiredDate:"2024-04-15", estimatedAmount:1250000, status:"APPROVED",     priority:"HIGH",   submittedAt:"2024-03-10T10:30:00Z", createdAt:"2024-03-05T14:20:00Z" },
  { id:"2", prNumber:"PR-2024-00124", title:"Office Furniture Renewal",                requesterId:"sarah.johnson@insa.edu.et", departmentName:"Administration", requiredDate:"2024-05-20", estimatedAmount:850000,  status:"UNDER_REVIEW", priority:"MEDIUM", submittedAt:"2024-03-12T09:15:00Z", createdAt:"2024-03-10T11:45:00Z" },
  { id:"3", prNumber:"PR-2024-00125", title:"Network Equipment Upgrade",               requesterId:"michael.chen@insa.edu.et",  departmentName:"IT Department",  requiredDate:"2024-03-30", estimatedAmount:2500000, status:"SUBMITTED",    priority:"URGENT", submittedAt:"2024-03-14T16:30:00Z", createdAt:"2024-03-14T16:30:00Z" },
  { id:"4", prNumber:"PR-2024-00126", title:"Annual Software Licenses",                requesterId:"alex.r@insa.edu.et",         departmentName:"Finance",        requiredDate:"2024-06-30", estimatedAmount:1800000, status:"DRAFT",        priority:"MEDIUM", createdAt:"2024-03-15T08:45:00Z" },
  { id:"5", prNumber:"PR-2024-00127", title:"Marketing Campaign Materials",            requesterId:"emma.w@insa.edu.et",          departmentName:"Marketing",      requiredDate:"2024-04-10", estimatedAmount:750000,  status:"REJECTED",     priority:"LOW",    submittedAt:"2024-03-08T13:20:00Z", createdAt:"2024-03-05T09:30:00Z" },
  { id:"6", prNumber:"PR-2024-00128", title:"Laboratory Equipment",                   requesterId:"david.s@insa.edu.et",         departmentName:"R&D",            requiredDate:"2024-07-15", estimatedAmount:3200000, status:"APPROVED",     priority:"HIGH",   submittedAt:"2024-03-01T11:00:00Z", createdAt:"2024-02-25T14:15:00Z" },
  { id:"7", prNumber:"PR-2024-00129", title:"Cleaning Supplies",                       requesterId:"lisa.m@insa.edu.et",          departmentName:"Facilities",     requiredDate:"2024-03-25", estimatedAmount:250000,  status:"FULFILLED",    priority:"LOW",    submittedAt:"2024-02-15T10:45:00Z", createdAt:"2024-02-10T09:20:00Z" },
  { id:"8", prNumber:"PR-2024-00130", title:"Training Materials",                      requesterId:"robert.b@insa.edu.et",        departmentName:"HR",             requiredDate:"2024-05-05", estimatedAmount:450000,  status:"CANCELLED",    priority:"MEDIUM", submittedAt:"2024-03-05T15:30:00Z", createdAt:"2024-03-01T11:15:00Z" },
];

const STATUS_STYLES: Record<PurchaseRequestStatus, string> = {
  DRAFT:        "bg-gray-100 text-gray-600",
  SUBMITTED:    "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED:     "bg-green-100 text-green-700",
  REJECTED:     "bg-red-100 text-red-700",
  CANCELLED:    "bg-gray-100 text-gray-500",
  FULFILLED:    "bg-teal-100 text-teal-700",
};

const PRIORITY_STYLES: Record<PurchaseRequestPriority, string> = {
  LOW:    "bg-gray-100 text-gray-500",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH:   "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function PurchaseRequestsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // ── Real API ──────────────────────────────────────────────────────────────
  // The backend requires requesterEmployeeId — use the authenticated user's username.
  // Once Keycloak integration is complete, this should be user.id (the employee ID).
  const employeeId = user?.username ?? null;
  const {
    data: apiRequisitions,
    isLoading: apiLoading,
    isError: apiError,
    refetch,
  } = useRequisitionsByRequester(employeeId);

  const submitRequisition = useSubmitRequisition();

  // Map backend RequisitionResponse → display row, keeping PR Number format
  const liveRows = apiRequisitions?.map((r: RequisitionResponse) => ({
    id: String(r.id),
    prNumber: r.requisitionNumber,
    title: r.purpose,
    requesterId: r.requesterEmployeeId,
    departmentName: r.departmentCode,
    requiredDate: r.requiredByDate,
    estimatedAmount: r.estimatedAmount,
    status: r.status as PurchaseRequestStatus,
    priority: "MEDIUM" as PurchaseRequestPriority, // backend has no priority field
    submittedAt: r.createdAt,
    createdAt: r.createdAt,
  })) ?? [];

  const usingLiveData = !!(apiRequisitions && apiRequisitions.length > 0);
  // Use live data if available, otherwise fall back to MOCK_DATA
  const displayRows = usingLiveData ? liveRows : MOCK_DATA;

  const filtered = displayRows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !search || r.title.toLowerCase().includes(q) || r.prNumber.toLowerCase().includes(q) || r.requesterId.toLowerCase().includes(q);
    const matchStatus   = statusFilter   === "all" || r.status   === statusFilter;
    const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total:    displayRows.length,
    pending:  displayRows.filter((r) =>
      r.status === "SUBMITTED" ||
      r.status === "UNDER_REVIEW" ||
      (r.status as string) === "PENDING_APPROVAL"
    ).length,
    approved: displayRows.filter((r) => r.status === "APPROVED").length,
    totalAmt: displayRows.reduce((s, r) => s + (r.estimatedAmount ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create, submit, and track purchase requisitions</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/purchase-requests/new"><Plus className="h-4 w-4 mr-2" />New Purchase Request</Link>
        </Button>
      </div>

      {/* API status banner */}
      {apiLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          Fetching requisitions from <code className="font-mono text-xs">GET /api/v1/requisitions</code>…
        </div>
      )}
      {!employeeId && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          No authenticated user — Keycloak integration required to load live requisitions. Showing demo data.
        </div>
      )}
      {employeeId && apiError && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            Backend unreachable or JWT invalid. Showing demo data.
          </div>
          <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}
      {usingLiveData && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
          Live data — {liveRows.length} requisition{liveRows.length !== 1 ? "s" : ""} loaded for employee <code className="font-mono text-xs">{employeeId}</code>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Total PRs",        value: stats.total,               icon: FileText,    bg:"bg-blue-500",   sub:"All purchase requests"   },
          { label:"Pending Approval", value: stats.pending,             icon: Clock,       bg:"bg-amber-500",  sub:"Awaiting review"         },
          { label:"Approved PRs",     value: stats.approved,            icon: CheckCircle, bg:"bg-green-500",  sub:"Ready for procurement"   },
          { label:"Total Value",      value: formatCurrency(stats.totalAmt), icon: DollarSign, bg:"bg-purple-500", sub:"Estimated spending" },
        ].map(({ label, value, icon: Icon, bg, sub }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search by PR number, title, or requester…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#c1121f]" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {["all","DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED","CANCELLED","FULFILLED"].map((v) => (
                    <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36 border-gray-300 text-gray-800"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {["all","LOW","MEDIUM","HIGH","URGENT"].map((v) => (
                    <SelectItem key={v} value={v}>{v === "all" ? "All Priorities" : v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Purchase Requests ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["PR Number","Title","Department","Required Date","Amount","Priority","Status","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-[#1e50c8]">{r.prNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 max-w-[200px] truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><User className="h-3 w-3" />{r.requesterId}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{r.departmentName}</td>
                    <td className="py-3 px-4 text-gray-700">{r.requiredDate}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(r.estimatedAmount ?? 0)}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${PRIORITY_STYLES[r.priority]} border-0 text-xs font-semibold`}>{r.priority}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${STATUS_STYLES[r.status]} border-0 text-xs font-semibold`}>{r.status.replace("_"," ")}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                          <DropdownMenuLabel className="text-gray-700 text-xs">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer text-xs" asChild>
                            <Link href={`/prms/purchase-requests/${r.id}`}><Eye className="h-3.5 w-3.5 mr-2" />View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer text-xs" asChild>
                            <Link href={`/prms/purchase-requests/${r.id}`}><Edit className="h-3.5 w-3.5 mr-2" />Edit</Link>
                          </DropdownMenuItem>
                          {r.status === "DRAFT" && (
                            <DropdownMenuItem
                              className="text-blue-600 hover:bg-blue-50 cursor-pointer text-xs"
                              disabled={submitRequisition.isPending}
                              onClick={() => submitRequisition.mutate(r.id)}
                            >
                              <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                              {submitRequisition.isPending ? "Submitting…" : "Submit"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem className="text-red-600 hover:bg-red-50 cursor-pointer text-xs" onClick={() => toast({ title:"Deleted", description:"PR deleted." })}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-16 text-center text-gray-400">No purchase requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
