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
  FileText, Clock, CheckCircle, XCircle, TrendingUp, DollarSign,
  Award, Users, Calendar, Send, Loader2, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RFQSummary, RFQStatus } from "@/features/prms/types/rfq";
import { useCreateRFQ } from "@/features/prms/hooks/use-rfq";

// NOTE: The backend only exposes GET /api/v1/rfqs/{id} and POST /api/v1/rfqs.
// There is no list endpoint — the table below uses demo data.
// The "New RFQ" form uses the real POST endpoint via useCreateRFQ().
// See integration report: PENDING — GET /api/v1/rfqs (list) not yet implemented.

const MOCK: RFQSummary[] = [
  { id:"1", rfqNumber:"RFQ-2024-00089", title:"Annual Software Licenses",   status:"OPEN",             submissionDeadline:"2024-03-25T17:00:00Z", invitedSuppliers:8,  respondedSuppliers:5, estimatedValue:1800000, currency:"ETB", preparedBy:"Alex Rodriguez", createdAt:"2024-03-16T08:45:00Z" },
  { id:"2", rfqNumber:"RFQ-2024-00088", title:"Network Equipment Upgrade",  status:"CLOSED",           submissionDeadline:"2024-03-20T17:00:00Z", invitedSuppliers:6,  respondedSuppliers:4, estimatedValue:2500000, currency:"ETB", preparedBy:"Michael Chen",   createdAt:"2024-03-10T14:20:00Z" },
  { id:"3", rfqNumber:"RFQ-2024-00087", title:"Office Furniture",           status:"UNDER_EVALUATION", submissionDeadline:"2024-03-18T17:00:00Z", invitedSuppliers:10, respondedSuppliers:7, estimatedValue:850000,  currency:"ETB", preparedBy:"Sarah Johnson",  createdAt:"2024-03-05T11:30:00Z" },
  { id:"4", rfqNumber:"RFQ-2024-00086", title:"Laptop Computers",           status:"AWARDED",          submissionDeadline:"2024-03-15T17:00:00Z", invitedSuppliers:5,  respondedSuppliers:3, estimatedValue:1250000, currency:"ETB", preparedBy:"John Doe",       createdAt:"2024-03-01T09:15:00Z" },
  { id:"5", rfqNumber:"RFQ-2024-00085", title:"Cleaning Services",          status:"DRAFT",            submissionDeadline:"2024-04-05T17:00:00Z", invitedSuppliers:0,  respondedSuppliers:0, estimatedValue:500000,  currency:"ETB", preparedBy:"Lisa Miller",    createdAt:"2024-03-15T16:30:00Z" },
  { id:"6", rfqNumber:"RFQ-2024-00084", title:"Marketing Materials",        status:"CANCELLED",        submissionDeadline:"2024-03-12T17:00:00Z", invitedSuppliers:4,  respondedSuppliers:2, estimatedValue:750000,  currency:"ETB", preparedBy:"Emma Wilson",    createdAt:"2024-02-28T13:45:00Z" },
  { id:"7", rfqNumber:"RFQ-2024-00083", title:"Laboratory Equipment",       status:"OPEN",             submissionDeadline:"2024-04-10T17:00:00Z", invitedSuppliers:7,  respondedSuppliers:3, estimatedValue:3200000, currency:"ETB", preparedBy:"David Smith",    createdAt:"2024-03-12T10:20:00Z" },
  { id:"8", rfqNumber:"RFQ-2024-00082", title:"Training Services",          status:"OPEN",             submissionDeadline:"2024-03-30T17:00:00Z", invitedSuppliers:5,  respondedSuppliers:2, estimatedValue:450000,  currency:"ETB", preparedBy:"Robert Brown",   createdAt:"2024-03-08T15:45:00Z" },
];

const STATUS_STYLES: Record<RFQStatus, string> = {
  DRAFT:            "bg-gray-100 text-gray-600",
  OPEN:             "bg-green-100 text-green-700",
  CLOSED:           "bg-blue-100 text-blue-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700",
  AWARDED:          "bg-purple-100 text-purple-700",
  CANCELLED:        "bg-red-100 text-red-700",
};

export default function RFQPage() {
  const { toast } = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // The real POST endpoint is available via useCreateRFQ() — used by /rfq/new form.
  // No GET list endpoint exists in the backend yet; demo data is shown below.
  const createRFQ = useCreateRFQ();

  const filtered = MOCK.filter((r) => {
    const q = search.toLowerCase();
    return (!search || r.title.toLowerCase().includes(q) || r.rfqNumber.toLowerCase().includes(q)) &&
           (statusFilter === "all" || r.status === statusFilter);
  });

  const open        = MOCK.filter((r) => r.status === "OPEN").length;
  const openValue   = MOCK.filter((r) => r.status === "OPEN").reduce((s, r) => s + r.estimatedValue, 0);
  const underEval   = MOCK.filter((r) => r.status === "UNDER_EVALUATION").length;
  const avgResponse = Math.round(MOCK.reduce((s, r) => s + (r.invitedSuppliers ? (r.respondedSuppliers / r.invitedSuppliers) * 100 : 0), 0) / MOCK.length);

  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6">
      {/* API info banner */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Integration note:</strong> RFQ list uses demo data —{" "}
          <code className="font-mono text-xs">GET /api/v1/rfqs</code> not yet implemented in the backend.
          New RFQ creation connects to <code className="font-mono text-xs">POST /api/v1/rfqs</code>.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request for Quotation (RFQ)</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage requests for quotations from suppliers</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/rfq/new"><Plus className="h-4 w-4 mr-2" />New RFQ</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Active RFQs",       value:open,                    bg:"bg-green-500",  icon:Clock     },
          { label:"Total Value",       value:formatCurrency(openValue),bg:"bg-blue-500",   icon:DollarSign},
          { label:"Response Rate",     value:`${avgResponse}%`,       bg:"bg-purple-500", icon:TrendingUp},
          { label:"Under Evaluation",  value:underEval,               bg:"bg-amber-500",  icon:TrendingUp},
        ].map(({ label, value, bg, icon: Icon }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className="h-5 w-5 text-white" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search RFQs…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {["all","DRAFT","OPEN","CLOSED","UNDER_EVALUATION","AWARDED","CANCELLED"].map((v) => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-300 text-gray-700"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">RFQs ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["RFQ Number","Title","Suppliers","Deadline","Est. Value","Status","Prepared By","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((rfq) => {
                  const days = daysLeft(rfq.submissionDeadline);
                  const overdue = days < 0;
                  const rate = rfq.invitedSuppliers ? Math.round((rfq.respondedSuppliers / rfq.invitedSuppliers) * 100) : 0;
                  return (
                    <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{rfq.rfqNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(rfq.createdAt)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-800">{rfq.respondedSuppliers}/{rfq.invitedSuppliers}</p>
                        <p className="text-xs text-gray-400">{rate}% response</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className={overdue ? "text-red-600 font-medium" : "text-gray-800"}>{formatDate(rfq.submissionDeadline)}</p>
                        <p className={`text-xs ${overdue ? "text-red-500" : days <= 3 ? "text-amber-500" : "text-gray-400"}`}>
                          {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(rfq.estimatedValue)}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${STATUS_STYLES[rfq.status]} border-0 text-xs font-semibold`}>{rfq.status.replace("_"," ")}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{rfq.preparedBy}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                            <DropdownMenuLabel className="text-xs text-gray-700">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"><Eye className="h-3.5 w-3.5 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"><Edit className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                            {rfq.status === "DRAFT" && <DropdownMenuItem className="text-xs text-blue-600 hover:bg-blue-50 cursor-pointer" onClick={() => toast({ title:"Published" })}><Send className="h-3.5 w-3.5 mr-2" />Publish</DropdownMenuItem>}
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => toast({ title:"Deleted" })}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="py-16 text-center text-gray-400">No RFQs found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
