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
  Search, Eye, Download, CreditCard, Clock, CheckCircle, DollarSign, Check, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useSubmitInvoice } from "@/features/prms/hooks/use-invoices";

// NOTE: Backend only exposes POST /api/v1/invoices.
// No list or GET-by-id endpoint — demo data shown.
// Invoice submission connects to POST /api/v1/invoices via useSubmitInvoice().

const MOCK = [
  { id:"1", invoiceNumber:"INV-2024-00001", supplierName:"Tech Solutions Ltd.",    purchaseOrderNumber:"PO-2024-00123", invoiceDate:"2024-03-20T00:00:00Z", dueDate:"2024-04-20T00:00:00Z", status:"PENDING",  totalAmount:45000,  paidAmount:0,     description:"Software licensing and support services" },
  { id:"2", invoiceNumber:"INV-2024-00002", supplierName:"Office Supplies Inc.",   purchaseOrderNumber:"PO-2024-00124", invoiceDate:"2024-03-19T00:00:00Z", dueDate:"2024-04-19T00:00:00Z", status:"APPROVED", totalAmount:12500,  paidAmount:0,     description:"Office furniture and stationery" },
  { id:"3", invoiceNumber:"INV-2024-00003", supplierName:"Industrial Equipment Co.",purchaseOrderNumber:"PO-2024-00125",invoiceDate:"2024-03-18T00:00:00Z", dueDate:"2024-04-18T00:00:00Z", status:"PAID",     totalAmount:89000,  paidAmount:89000, description:"Manufacturing equipment purchase" },
  { id:"4", invoiceNumber:"INV-2024-00004", supplierName:"Lab Equipment Inc.",     purchaseOrderNumber:"PO-2024-00126", invoiceDate:"2024-03-17T00:00:00Z", dueDate:"2024-03-25T00:00:00Z", status:"OVERDUE",  totalAmount:320000, paidAmount:0,     description:"Laboratory instruments — Q1 order" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID:     "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  OVERDUE:  "bg-red-100 text-red-700",
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real POST endpoint for invoice submission available via useSubmitInvoice().
  // No list/GET endpoint from backend yet.
  const _submitInvoice = useSubmitInvoice();

  const filtered = MOCK.filter((inv) =>
    (!search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.supplierName.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "all" || inv.status === statusFilter)
  );

  const stats = {
    total:     MOCK.length,
    pending:   MOCK.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length,
    paid:      MOCK.filter((i) => i.status === "PAID").length,
    totalAmt:  MOCK.reduce((s, i) => s + i.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* API integration note */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Integration note:</strong> Invoice list uses demo data —
          {" "}<code className="font-mono text-xs">GET /api/v1/invoices</code> not yet in backend.
          Submitting an invoice connects to <code className="font-mono text-xs">POST /api/v1/invoices</code>.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage supplier invoices and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Total Invoices", value:stats.total,              bg:"bg-blue-500",  icon:CreditCard  },
          { label:"Pending",        value:stats.pending,            bg:"bg-amber-500", icon:Clock       },
          { label:"Paid",           value:stats.paid,               bg:"bg-green-500", icon:CheckCircle },
          { label:"Total Amount",   value:formatCurrency(stats.totalAmt), bg:"bg-purple-500",icon:DollarSign},
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
            <Input placeholder="Search invoices…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {["all","PENDING","APPROVED","PAID","REJECTED","OVERDUE"].map((v) => (
                <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Invoices ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Invoice Number","Supplier","PO Number","Status","Amount","Due Date","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{inv.supplierName}</td>
                    <td className="py-3 px-4 font-mono text-xs text-green-600">{inv.purchaseOrderNumber}</td>
                    <td className="py-3 px-4"><Badge className={`${STATUS_STYLES[inv.status]} border-0 text-xs font-semibold`}>{inv.status}</Badge></td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-gray-500 hover:bg-gray-100 p-0"><Download className="h-3.5 w-3.5" /></Button>
                        {inv.status === "PENDING" && (
                          <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-2" onClick={() => toast({ title:"Approved" })}>
                            <Check className="h-3 w-3 mr-1" />Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-gray-400">No invoices found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
