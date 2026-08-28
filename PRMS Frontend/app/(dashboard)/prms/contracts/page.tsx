"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Plus, Eye, Edit, Download, FileCheck, CheckCircle, Clock, AlertCircle, DollarSign,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const MOCK = [
  { id:"1", contractNumber:"CT-2024-00001", supplier:"Tech Solutions Ltd.",    value:450000,  startDate:"2024-03-01T00:00:00Z", endDate:"2024-12-31T00:00:00Z", status:"ACTIVE",   items:5 },
  { id:"2", contractNumber:"CT-2024-00002", supplier:"Office Supplies Inc.",   value:125000,  startDate:"2024-02-15T00:00:00Z", endDate:"2024-08-15T00:00:00Z", status:"ACTIVE",   items:3 },
  { id:"3", contractNumber:"CT-2024-00003", supplier:"Industrial Equipment Co.",value:890000, startDate:"2024-01-01T00:00:00Z", endDate:"2024-06-30T00:00:00Z", status:"EXPIRING", items:1 },
  { id:"4", contractNumber:"CT-2024-00004", supplier:"Lab Supplies Ltd.",      value:220000,  startDate:"2023-06-01T00:00:00Z", endDate:"2024-01-15T00:00:00Z", status:"EXPIRED",  items:7 },
  { id:"5", contractNumber:"CT-2024-00005", supplier:"Digital Pro Corp.",      value:350000,  startDate:"2024-04-01T00:00:00Z", endDate:"2025-03-31T00:00:00Z", status:"PENDING",  items:2 },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   "bg-green-100 text-green-700",
  EXPIRING: "bg-amber-100 text-amber-700",
  EXPIRED:  "bg-red-100 text-red-700",
  PENDING:  "bg-blue-100 text-blue-700",
};

export default function ContractsPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK.filter((c) =>
    (!search || c.contractNumber.toLowerCase().includes(search.toLowerCase()) || c.supplier.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "all" || c.status === statusFilter)
  );

  const stats = {
    total:    MOCK.length,
    active:   MOCK.filter((c) => c.status === "ACTIVE").length,
    expiring: MOCK.filter((c) => c.status === "EXPIRING").length,
    totalVal: MOCK.reduce((s, c) => s + c.value, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage supplier contracts and agreements</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />New Contract
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Total Contracts", value:stats.total,               bg:"bg-blue-500",  icon:FileCheck   },
          { label:"Active",          value:stats.active,              bg:"bg-green-500", icon:CheckCircle },
          { label:"Expiring Soon",   value:stats.expiring,            bg:"bg-amber-500", icon:AlertCircle },
          { label:"Total Value",     value:formatCurrency(stats.totalVal), bg:"bg-purple-500",icon:DollarSign},
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
            <Input placeholder="Search contracts…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {["all","ACTIVE","EXPIRING","EXPIRED","PENDING"].map((v) => (
                <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Contracts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Contract Number","Supplier","Value","Start Date","End Date","Status","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{c.contractNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{c.supplier}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(c.value)}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs">{formatDate(c.startDate)}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs">{formatDate(c.endDate)}</td>
                    <td className="py-3 px-4"><Badge className={`${STATUS_STYLES[c.status]} border-0 text-xs font-semibold`}>{c.status}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-gray-500 hover:bg-gray-100 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-purple-500 hover:bg-purple-50 p-0"><Download className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-gray-400">No contracts found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
