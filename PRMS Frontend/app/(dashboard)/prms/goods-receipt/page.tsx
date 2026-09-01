"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Package, CheckCircle, Clock, DollarSign,
  Loader2, AlertCircle, RefreshCw, Eye,
} from "lucide-react";
import { useGoodsReceipts } from "@/features/prms/hooks/use-goods-receipts";
import type { GoodsReceiptResponse } from "@/lib/prms-api";
import { formatDate } from "@/lib/utils";

export default function GoodsReceiptPage() {
  const [search, setSearch] = useState("");
  const { data: receipts, isLoading, isError, refetch } = useGoodsReceipts();

  const filtered = (receipts ?? []).filter((r: GoodsReceiptResponse) => {
    const q = search.toLowerCase();
    return (
      !search ||
      r.receiptNumber.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q) ||
      r.purchaseOrderNumber.toLowerCase().includes(q)
    );
  });

  const accepted = receipts?.filter((r) => r.accepted).length ?? 0;
  const pending = receipts?.filter((r) => !r.accepted).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h2>
          <p className="text-sm text-gray-500 mt-0.5">All goods receipts from PostgreSQL</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/goods-receipt/new"><Plus className="h-4 w-4 mr-2" />Record Receipt</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading goods receipts…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load goods receipts.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Total GRNs", value: receipts?.length ?? 0, bg: "bg-blue-500", icon: Package },
          { label: "Accepted", value: accepted, bg: "bg-green-500", icon: CheckCircle },
          { label: "Pending Inspection", value: pending, bg: "bg-amber-500", icon: Clock },
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
          placeholder="Search GRNs…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Goods Receipt Notes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["GRN Number", "PO Number", "Vendor", "Receipt Date", "Received By", "Accepted", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r: GoodsReceiptResponse) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{r.receiptNumber}</td>
                      <td className="py-3 px-4 font-mono text-xs text-green-600">{r.purchaseOrderNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{r.vendorName}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{r.receiptDate}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{r.receivedByEmployeeId}</td>
                      <td className="py-3 px-4">
                        <Badge className={`border-0 text-xs font-semibold ${r.accepted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.accepted ? "Accepted" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-400">
                      {receipts?.length === 0 ? "No goods receipts recorded yet." : "No receipts match your search."}
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
