"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Clock, DollarSign, Loader2, AlertCircle, RefreshCw,
  MoreVertical, Eye, Trash2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRFQs } from "@/features/prms/hooks/use-rfq";
import type { RFQResponse } from "@/lib/prms-api";
import { formatDate } from "@/lib/utils";

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export default function RFQPage() {
  const [search, setSearch] = useState("");
  const { data: rfqs, isLoading, isError, refetch } = useRFQs();

  const filtered = (rfqs ?? []).filter((r: RFQResponse) => {
    const q = search.toLowerCase();
    return !search || r.title.toLowerCase().includes(q) || r.rfqNumber.toLowerCase().includes(q);
  });

  const open = rfqs?.filter((r) => r.active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request for Quotation (RFQ)</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage RFQs</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/rfq/new"><Plus className="h-4 w-4 mr-2" />New RFQ</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading RFQs…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load RFQs.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Total RFQs", value: rfqs?.length ?? 0, bg: "bg-blue-500", icon: Clock },
          { label: "Active", value: open, bg: "bg-green-500", icon: Clock },
          { label: "Shown", value: filtered.length, bg: "bg-purple-500", icon: Clock },
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
          placeholder="Search RFQs…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">RFQs ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["RFQ Number", "Title", "Requisition", "Deadline", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((rfq: RFQResponse) => {
                    const days = daysLeft(rfq.submissionDeadline);
                    const overdue = days < 0;
                    return (
                      <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{rfq.rfqNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{rfq.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(rfq.createdAt)}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">{rfq.requisitionNumber ?? `PR #${rfq.purchaseRequisitionId}`}</td>
                        <td className="py-3 px-4">
                          <p className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-gray-800"}`}>{rfq.submissionDeadline}</p>
                          <p className={`text-xs ${overdue ? "text-red-500" : days <= 3 ? "text-amber-500" : "text-gray-400"}`}>
                            {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`border-0 text-xs font-semibold ${rfq.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {rfq.active ? "Active" : "Closed"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                              <DropdownMenuLabel className="text-xs text-gray-700">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-100" />
                              <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"><Eye className="h-3.5 w-3.5 mr-2" />View</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={6} className="py-16 text-center text-gray-400">
                      {rfqs?.length === 0 ? "No RFQs yet. Create the first one." : "No RFQs match your search."}
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
