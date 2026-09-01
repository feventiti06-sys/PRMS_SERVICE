"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, FileText, Clock, CheckCircle, Star,
  Loader2, AlertCircle, RefreshCw, Eye, Award,
} from "lucide-react";
import { useQuotations, useSelectQuotation } from "@/features/prms/hooks/use-quotations";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const { data: quotations, isLoading, isError, refetch } = useQuotations();
  const selectQuotation = useSelectQuotation();

  const filtered = (quotations ?? []).filter((q) => {
    const s = search.toLowerCase();
    return !search || q.quotationNumber.toLowerCase().includes(s) || q.vendorName.toLowerCase().includes(s);
  });

  const stats = {
    total: quotations?.length ?? 0,
    selected: quotations?.filter((q) => q.selected).length ?? 0,
    totalValue: quotations?.reduce((sum, q) => sum + (q.totalAmount ?? 0), 0) ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
          <p className="text-sm text-gray-500 mt-0.5">Supplier quotations from PostgreSQL</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white" asChild>
          <Link href="/prms/quotations/new"><Plus className="h-4 w-4 mr-2" />New Quotation</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading quotations…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load quotations.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Quotations", value: stats.total, bg: "bg-blue-500", icon: FileText },
          { label: "Selected for Award", value: stats.selected, bg: "bg-green-500", icon: CheckCircle },
          { label: "Total Value", value: formatCurrency(stats.totalValue), bg: "bg-purple-500", icon: Star },
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
          placeholder="Search quotations…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Quotations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Quotation #", "RFQ #", "Vendor", "Amount", "Valid Until", "Selected", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{q.quotationNumber}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{q.rfqNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{q.vendorName}</p>
                        <p className="text-xs text-gray-400">{formatDate(q.quotationDate)}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(q.totalAmount)}</td>
                      <td className="py-3 px-4 text-xs text-gray-700">{q.validUntil}</td>
                      <td className="py-3 px-4">
                        <Badge className={`border-0 text-xs font-semibold ${q.selected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {q.selected ? "Selected" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0" asChild>
                            <Link href={`/prms/quotations/${q.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          {!q.selected && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 text-green-600 hover:bg-green-50 p-0"
                              onClick={() => selectQuotation.mutate(q.id)}
                              disabled={selectQuotation.isPending}
                              title="Select for award"
                            >
                              <Award className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-400">
                      {quotations?.length === 0 ? "No quotations yet." : "No quotations match your search."}
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
