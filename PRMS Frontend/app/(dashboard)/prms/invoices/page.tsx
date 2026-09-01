"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, CreditCard, Clock, CheckCircle, DollarSign,
  Loader2, AlertCircle, RefreshCw, Eye, Download,
} from "lucide-react";
import { useInvoices } from "@/features/prms/hooks/use-invoices";
import type { InvoiceResponse } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SUBMITTED_TO_FMS: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const { data: invoices, isLoading, isError, refetch } = useInvoices();

  const filtered = (invoices ?? []).filter((inv: InvoiceResponse) => {
    const q = search.toLowerCase();
    return (
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.vendorName.toLowerCase().includes(q) ||
      inv.purchaseOrderNumber.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: invoices?.length ?? 0,
    pending: invoices?.filter((i) => i.processingStatus === "PENDING").length ?? 0,
    paid: invoices?.filter((i) => i.processingStatus === "PAID").length ?? 0,
    totalAmt: invoices?.reduce((s, i) => s + (i.invoiceAmount ?? 0), 0) ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Supplier invoices from PostgreSQL</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading invoices…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load invoices.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, bg: "bg-blue-500", icon: CreditCard },
          { label: "Pending", value: stats.pending, bg: "bg-amber-500", icon: Clock },
          { label: "Paid", value: stats.paid, bg: "bg-green-500", icon: CheckCircle },
          { label: "Total Amount", value: formatCurrency(stats.totalAmt), bg: "bg-purple-500", icon: DollarSign },
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
          placeholder="Search invoices…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Invoices ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Invoice Number", "Vendor", "PO Number", "Amount", "Invoice Date", "Due Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((inv: InvoiceResponse) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{inv.vendorName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-green-600">{inv.purchaseOrderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(inv.invoiceAmount)}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{inv.invoiceDate}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{inv.dueDate}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${STATUS_STYLES[inv.processingStatus] ?? "bg-gray-100 text-gray-600"} border-0 text-xs font-semibold`}>
                          {inv.processingStatus.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 text-gray-500 hover:bg-gray-100 p-0"><Download className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-400">
                      {invoices?.length === 0 ? "No invoices yet." : "No invoices match your search."}
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
