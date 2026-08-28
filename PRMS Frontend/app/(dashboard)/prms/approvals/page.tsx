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
  Search, Filter, Download, MoreVertical, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, FileText, ShoppingCart, FileCheck, DollarSign,
  TrendingUp, MessageSquare, RefreshCw, ExternalLink, Loader2, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ApprovalRequest, ApprovalStatus, ApprovalEntityType } from "@/features/prms/types/approval";
import { useDecideOnRequisition } from "@/features/prms/hooks/use-approvals";
import { BackendApprovalAction } from "@/lib/prms-api";

const APPROVALS: ApprovalRequest[] = [
  { id:"1", entityId:"1", entityType:"PURCHASE_REQUEST", entityNumber:"PR-2024-00124", entityTitle:"Office Furniture Renewal",            requesterId:"sarah.j@insa.edu.et", requesterName:"Sarah Johnson",  amount:850000,  currency:"ETB", currentStep:2, totalSteps:4, currentApproverId:"michael.c@insa.edu.et", currentApproverName:"Michael Chen",    status:"PENDING",   submittedAt:"2024-03-12T09:15:00Z", deadline:"2024-03-19T09:15:00Z", workflowId:"1", workflowName:"Standard Procurement Approval", createdAt:"2024-03-12T09:15:00Z", updatedAt:"2024-03-12T09:15:00Z" },
  { id:"2", entityId:"3", entityType:"PURCHASE_REQUEST", entityNumber:"PR-2024-00125", entityTitle:"Network Equipment Upgrade",            requesterId:"michael.c@insa.edu.et",requesterName:"Michael Chen",   amount:2500000, currency:"ETB", currentStep:3, totalSteps:4, currentApproverId:"alex.r@insa.edu.et",   currentApproverName:"Alex Rodriguez",  status:"PENDING",   submittedAt:"2024-03-14T16:30:00Z", deadline:"2024-03-21T16:30:00Z", workflowId:"1", workflowName:"Standard Procurement Approval", createdAt:"2024-03-14T16:30:00Z", updatedAt:"2024-03-15T10:20:00Z" },
  { id:"3", entityId:"101",entityType:"PURCHASE_ORDER",  entityNumber:"PO-2024-00123", entityTitle:"Laptop Computers Purchase Order",      requesterId:"john.d@insa.edu.et",   requesterName:"John Doe",       amount:1250000, currency:"ETB", currentStep:1, totalSteps:3, currentApproverId:"emma.w@insa.edu.et",    currentApproverName:"Emma Wilson",     status:"PENDING",   submittedAt:"2024-03-15T11:30:00Z", deadline:"2024-03-18T11:30:00Z", workflowId:"2", workflowName:"Purchase Order Approval",        createdAt:"2024-03-15T11:30:00Z", updatedAt:"2024-03-15T11:30:00Z" },
  { id:"4", entityId:"201",entityType:"CONTRACT",        entityNumber:"CON-2024-00034",entityTitle:"Tech Solutions Ltd. Service Contract", requesterId:"alex.r@insa.edu.et",   requesterName:"Alex Rodriguez", amount:1200000, currency:"ETB", currentStep:2, totalSteps:3, currentApproverId:"sarah.j@insa.edu.et",  currentApproverName:"Sarah Johnson",   status:"PENDING",   submittedAt:"2024-03-13T14:20:00Z", deadline:"2024-03-20T14:20:00Z", workflowId:"3", workflowName:"Contract Approval",             createdAt:"2024-03-13T14:20:00Z", updatedAt:"2024-03-14T09:45:00Z" },
  { id:"5", entityId:"2",  entityType:"PURCHASE_REQUEST",entityNumber:"PR-2024-00123", entityTitle:"Laptop Computers for IT Department",   requesterId:"john.d@insa.edu.et",   requesterName:"John Doe",       amount:1250000, currency:"ETB", currentStep:4, totalSteps:4, currentApproverId:"system",                currentApproverName:"System",          status:"APPROVED",  submittedAt:"2024-03-10T10:30:00Z", deadline:"2024-03-17T10:30:00Z", workflowId:"1", workflowName:"Standard Procurement Approval", createdAt:"2024-03-10T10:30:00Z", updatedAt:"2024-03-12T14:45:00Z" },
  { id:"6", entityId:"5",  entityType:"PURCHASE_REQUEST",entityNumber:"PR-2024-00127", entityTitle:"Marketing Campaign Materials",         requesterId:"emma.w@insa.edu.et",   requesterName:"Emma Wilson",    amount:750000,  currency:"ETB", currentStep:2, totalSteps:4, currentApproverId:"system",                currentApproverName:"System",          status:"REJECTED",  submittedAt:"2024-03-08T13:20:00Z", deadline:"2024-03-15T13:20:00Z", workflowId:"1", workflowName:"Standard Procurement Approval", createdAt:"2024-03-08T13:20:00Z", updatedAt:"2024-03-10T09:30:00Z" },
  { id:"7", entityId:"301",entityType:"RFQ",             entityNumber:"RFQ-2024-00089",entityTitle:"Annual Software Licenses RFQ",         requesterId:"david.s@insa.edu.et",  requesterName:"David Smith",    amount:1800000, currency:"ETB", currentStep:1, totalSteps:2, currentApproverId:"lisa.m@insa.edu.et",   currentApproverName:"Lisa Miller",     status:"PENDING",   submittedAt:"2024-03-16T08:45:00Z", deadline:"2024-03-19T08:45:00Z", workflowId:"4", workflowName:"RFQ Approval",                  createdAt:"2024-03-16T08:45:00Z", updatedAt:"2024-03-16T08:45:00Z" },
  { id:"8", entityId:"401",entityType:"INVOICE",         entityNumber:"INV-2024-00789",entityTitle:"ABC Supplies Inc. Invoice",            requesterId:"robert.b@insa.edu.et", requesterName:"Robert Brown",   amount:67890,   currency:"ETB", currentStep:1, totalSteps:2, currentApproverId:"john.d@insa.edu.et",   currentApproverName:"John Doe",        status:"PENDING",   submittedAt:"2024-03-15T15:30:00Z", deadline:"2024-03-18T15:30:00Z", workflowId:"5", workflowName:"Invoice Approval",              createdAt:"2024-03-15T15:30:00Z", updatedAt:"2024-03-15T15:30:00Z" },
];

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const ENTITY_STYLES: Record<ApprovalEntityType, string> = {
  PURCHASE_REQUEST: "bg-blue-100 text-blue-700",
  PURCHASE_ORDER:   "bg-purple-100 text-purple-700",
  CONTRACT:         "bg-teal-100 text-teal-700",
  RFQ:              "bg-indigo-100 text-indigo-700",
  QUOTATION:        "bg-amber-100 text-amber-700",
  INVOICE:          "bg-green-100 text-green-700",
};

const ENTITY_LEFT: Record<ApprovalEntityType, string> = {
  PURCHASE_REQUEST: "bg-[#c1121f]",
  PURCHASE_ORDER:   "bg-purple-500",
  CONTRACT:         "bg-teal-500",
  RFQ:              "bg-indigo-500",
  QUOTATION:        "bg-amber-500",
  INVOICE:          "bg-green-500",
};

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  // ── Real API mutation ────────────────────────────────────────────────────
  // NOTE: The backend GET endpoint for listing all pending approvals does not
  // exist yet (no /api/v1/approvals GET). Only the POST action endpoint exists.
  // The list below uses demo data; the Approve/Reject/Return buttons call the
  // real backend endpoint: POST /api/v1/approvals/requisitions/{id}
  const decideOnRequisition = useDecideOnRequisition();

  const handleApprove = (req: ApprovalRequest) => {
    if (req.entityType !== "PURCHASE_REQUEST") {
      toast({ title: "Approved (demo)", description: "Only requisition approvals connect to the backend." });
      return;
    }
    decideOnRequisition.mutate({ requisitionId: req.entityId, action: "APPROVE" as BackendApprovalAction });
  };

  const handleReject = (req: ApprovalRequest) => {
    if (req.entityType !== "PURCHASE_REQUEST") {
      toast({ title: "Rejected (demo)", description: "Only requisition approvals connect to the backend." });
      return;
    }
    decideOnRequisition.mutate({ requisitionId: req.entityId, action: "REJECT" as BackendApprovalAction, comments: "Rejected via approval center" });
  };

  const handleReturn = (req: ApprovalRequest) => {
    if (req.entityType !== "PURCHASE_REQUEST") {
      toast({ title: "Returned (demo)" });
      return;
    }
    decideOnRequisition.mutate({ requisitionId: req.entityId, action: "RETURN" as BackendApprovalAction, comments: "Changes requested" });
  };
  // ── End real API ─────────────────────────────────────────────────────────

  const filtered = APPROVALS.filter((r) => {
    const q = search.toLowerCase();
    const ms = !search || r.entityTitle.toLowerCase().includes(q) || r.entityNumber.toLowerCase().includes(q) || r.requesterName.toLowerCase().includes(q);
    return ms && (statusFilter === "all" || r.status === statusFilter) && (entityFilter === "all" || r.entityType === entityFilter);
  });

  const stats = {
    pending:   APPROVALS.filter((r) => r.status === "PENDING").length,
    approved:  APPROVALS.filter((r) => r.status === "APPROVED").length,
    rejected:  APPROVALS.filter((r) => r.status === "REJECTED").length,
    overdue:   APPROVALS.filter((r) => r.status === "PENDING" && new Date(r.deadline) < new Date()).length,
    totalAmt:  APPROVALS.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0),
  };

  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Center</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve procurement documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-green-600 hover:bg-green-700 text-white text-xs h-9">
            <CheckCircle className="h-4 w-4 mr-1.5" />Approve Selected
          </Button>
          <Button className="bg-red-600 hover:bg-[#a00f1a] text-white text-xs h-9">
            <XCircle className="h-4 w-4 mr-1.5" />Reject Selected
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 text-xs h-9" onClick={() => toast({ title:"Refreshed" })}>
            <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Pending Approvals", value:stats.pending,                 icon:Clock,     bg:"bg-amber-500",  sub:`${stats.overdue} overdue`        },
          { label:"Pending Amount",    value:formatCurrency(stats.totalAmt), icon:DollarSign,bg:"bg-blue-500",   sub:"Awaiting approval"               },
          { label:"Approval Rate",     value:"78%",                         icon:TrendingUp, bg:"bg-green-500",  sub:"Last 30 days"                    },
          { label:"Avg Processing",    value:"2.3 days",                    icon:Clock,      bg:"bg-purple-500", sub:"Submission to decision"          },
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
              <Input placeholder="Search by document, title, or requester…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {["all","PENDING","APPROVED","REJECTED","CANCELLED"].map((v) => (
                    <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-44 border-gray-300 text-gray-800"><SelectValue placeholder="Entity" /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {["all","PURCHASE_REQUEST","PURCHASE_ORDER","CONTRACT","RFQ","QUOTATION","INVOICE"].map((v) => (
                    <SelectItem key={v} value={v}>{v === "all" ? "All Types" : v.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval cards */}
      <div className="space-y-3">
        {filtered.map((req) => {
          const days = daysLeft(req.deadline);
          const isOverdue = days < 0;
          return (
            <Card key={req.id} className="border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Left color bar */}
                  <div className={`w-1.5 rounded-l-lg flex-shrink-0 ${ENTITY_LEFT[req.entityType]}`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-gray-500">{req.entityNumber}</span>
                          <Badge className={`${ENTITY_STYLES[req.entityType]} border-0 text-[11px] font-semibold`}>
                            {req.entityType.replace(/_/g," ")}
                          </Badge>
                          <Badge className={`${STATUS_STYLES[req.status]} border-0 text-[11px] font-semibold`}>
                            {req.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{req.entityTitle}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>Requester: <span className="text-gray-600 font-medium">{req.requesterName}</span></span>
                          <span>Approver: <span className="text-gray-600 font-medium">{req.currentApproverName}</span></span>
                          <span>Step {req.currentStep}/{req.totalSteps}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(req.amount)}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${isOverdue ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-gray-400"}`}>
                          {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                        </p>
                      </div>
                    </div>
                    {req.status === "PENDING" && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => handleApprove(req)}
                          disabled={decideOnRequisition.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 bg-red-600 hover:bg-[#a00f1a] text-white text-xs"
                          onClick={() => handleReject(req)}
                          disabled={decideOnRequisition.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-gray-300 text-gray-600 text-xs"
                          onClick={() => handleReturn(req)}
                          disabled={decideOnRequisition.isPending}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />Request Changes
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[#1e50c8] text-xs hover:bg-blue-50" asChild>
                          <Link href={`/prms/approvals/${req.id}`}><ExternalLink className="h-3.5 w-3.5 mr-1" />View Details</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="py-16 text-center text-gray-400">No approval requests found</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
