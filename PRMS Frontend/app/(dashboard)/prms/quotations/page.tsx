"use client";

import { useState } from "react";
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
  Search, Filter, Download, Plus, MoreVertical, Eye, Clock, CheckCircle,
  XCircle, TrendingUp, FileText, Calendar, DollarSign, Building, Award, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationSummary, QuotationStatus } from "@/features/prms/types/rfq";

const MOCK: QuotationSummary[] = [
  { id:"1", quotationNumber:"Q-2024-00145", rfqNumber:"RFQ-2024-00089", supplierName:"Tech Solutions Ltd.",     status:"SUBMITTED",    quotationDate:"2024-03-20T14:30:00Z", validUntil:"2024-04-20T23:59:59Z", totalAmount:1725000, currency:"ETB", evaluationScore:undefined, createdAt:"2024-03-20T14:30:00Z" },
  { id:"2", quotationNumber:"Q-2024-00146", rfqNumber:"RFQ-2024-00089", supplierName:"Software Pro Inc.",       status:"SUBMITTED",    quotationDate:"2024-03-21T10:15:00Z", validUntil:"2024-04-21T23:59:59Z", totalAmount:1890000, currency:"ETB", evaluationScore:undefined, createdAt:"2024-03-21T10:15:00Z" },
  { id:"3", quotationNumber:"Q-2024-00147", rfqNumber:"RFQ-2024-00088", supplierName:"Network Systems Co.",     status:"EVALUATED",    quotationDate:"2024-03-18T09:45:00Z", validUntil:"2024-04-18T23:59:59Z", totalAmount:2380000, currency:"ETB", evaluationScore:85,        createdAt:"2024-03-18T09:45:00Z" },
  { id:"4", quotationNumber:"Q-2024-00148", rfqNumber:"RFQ-2024-00088", supplierName:"Electronics Pro",         status:"ACCEPTED",     quotationDate:"2024-03-19T16:20:00Z", validUntil:"2024-04-19T23:59:59Z", totalAmount:2450000, currency:"ETB", evaluationScore:92,        createdAt:"2024-03-19T16:20:00Z" },
  { id:"5", quotationNumber:"Q-2024-00149", rfqNumber:"RFQ-2024-00087", supplierName:"Furniture World",         status:"UNDER_REVIEW", quotationDate:"2024-03-17T11:30:00Z", validUntil:"2024-04-17T23:59:59Z", totalAmount:820000,  currency:"ETB", evaluationScore:undefined, createdAt:"2024-03-17T11:30:00Z" },
  { id:"6", quotationNumber:"Q-2024-00150", rfqNumber:"RFQ-2024-00087", supplierName:"Office Furnishings Ltd.", status:"REJECTED",     quotationDate:"2024-03-16T14:45:00Z", validUntil:"2024-04-16T23:59:59Z", totalAmount:890000,  currency:"ETB", evaluationScore:65,        createdAt:"2024-03-16T14:45:00Z" },
  { id:"7", quotationNumber:"Q-2024-00151", rfqNumber:"RFQ-2024-00083", supplierName:"Lab Equipment Inc.",      status:"DRAFT",        quotationDate:"2024-03-19T13:20:00Z", validUntil:"2024-04-19T23:59:59Z", totalAmount:3100000, currency:"ETB", evaluationScore:undefined, createdAt:"2024-03-19T13:20:00Z" },
  { id:"8", quotationNumber:"Q-2024-00152", rfqNumber:"RFQ-2024-00083", supplierName:"Scientific Supplies Co.", status:"SUBMITTED",    quotationDate:"2024-03-20T15:10:00Z", validUntil:"2024-04-20T23:59:59Z", totalAmount:3350000, currency:"ETB", evaluationScore:undefined, createdAt:"2024-03-20T15:10:00Z" },
];

const STATUS_STYLES: Record<QuotationStatus, string> = {
  DRAFT:        "bg-gray-100 text-gray-600",
  SUBMITTED:    "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  EVALUATED:    "bg-purple-100 text-purple-700",
  ACCEPTED:     "bg-green-100 text-green-700",
  REJECTED:     "bg-red-100 text-red-700",
  EXPIRED:      "bg-gray-100 text-gray-400",
};

const scoreColor = (s?: number) => !s ? "text-gray-400" : s >= 85 ? "text-green-600 font-bold" : s >= 70 ? "text-amber-600 font-bold" : "text-red-600 font-bold";

export default function QuotationsPage() {
  const { toast } = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rfqFilter, setRfqFilter]       = useState("all");

  const filtered = MOCK.filter((q) => {
    const qStr = search.toLowerCase();
    return (!search || q.quotationNumber.toLowerCase().includes(qStr) || q.supplierName.toLowerCase().includes(qStr)) &&
           (statusFilter === "all" || q.status === statusFilter) &&
           (rfqFilter    === "all" || q.rfqNumber === rfqFilter);
  });

  const rfqOptions = Array.from(new Set(MOCK.map((q) => q.rfqNumber)));
  const stats = {
    total:    MOCK.length,
    awaiting: MOCK.filter((q) => q.status === "SUBMITTED").length,
    accepted: MOCK.filter((q) => q.status === "ACCEPTED").length,
    avgScore: Math.round(MOCK.filter((q) => q.evaluationScore).reduce((s, q) => s + (q.evaluationScore ?? 0), 0) / Math.max(1, MOCK.filter((q) => q.evaluationScore).length)),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and evaluate supplier quotations</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <a href="/prms/quotations/new"><Plus className="h-4 w-4 mr-2" />New Quotation</a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Total Quotations", value:stats.total,       bg:"bg-blue-500",   icon:FileText   },
          { label:"Awaiting Review",  value:stats.awaiting,    bg:"bg-amber-500",  icon:Clock      },
          { label:"Accepted",         value:stats.accepted,    bg:"bg-green-500",  icon:CheckCircle},
          { label:"Avg Score",        value:`${stats.avgScore}/100`, bg:"bg-purple-500", icon:Star },
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
            <Input placeholder="Search quotations…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {["all","DRAFT","SUBMITTED","UNDER_REVIEW","EVALUATED","ACCEPTED","REJECTED","EXPIRED"].map((v) => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rfqFilter} onValueChange={setRfqFilter}>
              <SelectTrigger className="w-44 border-gray-300 text-gray-800"><SelectValue placeholder="Filter by RFQ" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all">All RFQs</SelectItem>
                {rfqOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-300 text-gray-700"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Quotations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Quotation #","RFQ #","Supplier","Amount","Validity","Score","Status","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((q) => {
                  const daysLeft = Math.ceil((new Date(q.validUntil).getTime() - Date.now()) / 86400000);
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{q.quotationNumber}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{q.rfqNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{q.supplierName}</p>
                        <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(q.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <p className="text-gray-800 text-xs">{formatDate(q.validUntil)}</p>
                        <p className={`text-xs ${daysLeft < 0 ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-400"}`}>{daysLeft < 0 ? "Expired" : `${daysLeft}d left`}</p>
                      </td>
                      <td className="py-3 px-4"><span className={`text-sm ${scoreColor(q.evaluationScore)}`}>{q.evaluationScore ?? "—"}</span></td>
                      <td className="py-3 px-4"><Badge className={`${STATUS_STYLES[q.status]} border-0 text-xs font-semibold`}>{q.status.replace("_"," ")}</Badge></td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                            <DropdownMenuLabel className="text-xs text-gray-700">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"><Eye className="h-3.5 w-3.5 mr-2" />View</DropdownMenuItem>
                            {q.status === "SUBMITTED" && <DropdownMenuItem className="text-xs text-blue-600 hover:bg-blue-50 cursor-pointer" onClick={() => toast({ title:"Evaluation started" })}><Star className="h-3.5 w-3.5 mr-2" />Evaluate</DropdownMenuItem>}
                            {q.status === "EVALUATED" && <DropdownMenuItem className="text-xs text-green-600 hover:bg-green-50 cursor-pointer" onClick={() => toast({ title:"Accepted" })}><CheckCircle className="h-3.5 w-3.5 mr-2" />Accept</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="py-16 text-center text-gray-400">No quotations found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
