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
  Search, Eye, Package, Clock, CheckCircle, FileText, DollarSign, Plus, WifiOff,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCreateGoodsReceipt } from "@/features/prms/hooks/use-goods-receipts";

// NOTE: Backend exposes GET /api/v1/goods-receipts/{id} and POST only.
// No list endpoint — demo data shown. Recording a new GRN connects to
// POST /api/v1/goods-receipts via useCreateGoodsReceipt().

const MOCK = [
  { id:"1", grnNumber:"GRN-2024-00001", purchaseOrderNumber:"PO-2024-00123", supplierName:"Tech Solutions Ltd.",     deliveryDate:"2024-03-22T09:00:00Z", receivedDate:"2024-03-22T09:30:00Z", status:"RECEIVED",  totalValue:45000,  totalItems:15, receivedBy:"John Doe",      notes:"All items received in good condition" },
  { id:"2", grnNumber:"GRN-2024-00002", purchaseOrderNumber:"PO-2024-00124", supplierName:"Office Supplies Inc.",   deliveryDate:"2024-03-21T14:00:00Z", receivedDate:"2024-03-21T14:15:00Z", status:"INSPECTED", totalValue:12500,  totalItems:8,  receivedBy:"Sarah Johnson", notes:"Quality inspection completed" },
  { id:"3", grnNumber:"GRN-2024-00003", purchaseOrderNumber:"PO-2024-00125", supplierName:"Industrial Equipment Co.",deliveryDate:"2024-03-20T11:00:00Z",receivedDate:"2024-03-20T11:30:00Z", status:"ACCEPTED",  totalValue:89000,  totalItems:3,  receivedBy:"Michael Chen",  notes:"Equipment tested and certified" },
  { id:"4", grnNumber:"GRN-2024-00004", purchaseOrderNumber:"PO-2024-00126", supplierName:"Lab Equipment Inc.",     deliveryDate:"2024-03-19T10:00:00Z", receivedDate:"2024-03-19T10:45:00Z", status:"REJECTED",  totalValue:32000,  totalItems:5,  receivedBy:"David Smith",   notes:"Items do not match specifications" },
];

const STATUS_STYLES: Record<string, string> = {
  RECEIVED:  "bg-blue-100 text-blue-700",
  INSPECTED: "bg-amber-100 text-amber-700",
  ACCEPTED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
};

export default function GoodsReceiptPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real POST endpoint available — used when recording new receipts.
  // No backend list endpoint yet; demo data shown.
  const _createGRN = useCreateGoodsReceipt();

  const filtered = MOCK.filter((r) =>
    (!search || r.grnNumber.toLowerCase().includes(search.toLowerCase()) || r.supplierName.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  const stats = {
    total:    MOCK.length,
    received: MOCK.filter((r) => r.status === "RECEIVED").length,
    accepted: MOCK.filter((r) => r.status === "ACCEPTED").length,
    totalVal: MOCK.reduce((s, r) => s + r.totalValue, 0),
  };

  return (
    <div className="space-y-6">
      {/* API integration note */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Integration note:</strong> GRN list uses demo data —
          {" "}<code className="font-mono text-xs">GET /api/v1/goods-receipts</code> not yet in backend.
          New GRN recording connects to <code className="font-mono text-xs">POST /api/v1/goods-receipts</code>.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goods Receipt Notes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage incoming goods and receipt documentation</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />New GRN
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Total Receipts",     value:stats.total,              bg:"bg-blue-500",  icon:Package     },
          { label:"Pending Inspection", value:stats.received,           bg:"bg-amber-500", icon:Clock       },
          { label:"Accepted",           value:stats.accepted,           bg:"bg-green-500", icon:CheckCircle },
          { label:"Total Value",        value:formatCurrency(stats.totalVal), bg:"bg-purple-500",icon:DollarSign},
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
            <Input placeholder="Search GRNs…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {["all","RECEIVED","INSPECTED","ACCEPTED","REJECTED"].map((v) => (
                <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Goods Receipt Notes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["GRN Number","PO Number","Supplier","Status","Items","Value","Received Date","Received By","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{r.grnNumber}</td>
                    <td className="py-3 px-4 font-mono text-xs text-green-600">{r.purchaseOrderNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{r.supplierName}</td>
                    <td className="py-3 px-4"><Badge className={`${STATUS_STYLES[r.status]} border-0 text-xs font-semibold`}>{r.status}</Badge></td>
                    <td className="py-3 px-4 text-gray-700">{r.totalItems}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(r.totalValue)}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs">{formatDate(r.receivedDate)}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{r.receivedBy}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost" className="h-7 w-7 text-[#1e50c8] hover:bg-blue-50 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="py-16 text-center text-gray-400">No goods receipts found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
