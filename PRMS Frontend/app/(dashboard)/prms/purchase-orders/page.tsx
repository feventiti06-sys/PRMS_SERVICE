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
  Search, Filter, Download, Plus, MoreVertical, Eye, FileText,
  Truck, DollarSign, Calendar, Building, CheckCircle, Clock,
  XCircle, Package, FileCheck, Mail, Printer, Copy, WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseOrderSummary, PurchaseOrderStatus } from "@/features/prms/types/purchase-order";
import { useCreatePurchaseOrder } from "@/features/prms/hooks/use-purchase-orders";
import { poStatusBadge } from "@/lib/prms-api";

// NOTE: Backend only exposes GET /api/v1/purchase-orders/{id} and POST.
// No list endpoint exists — demo data shown. useCreatePurchaseOrder() connects
// to the real POST endpoint (used by /purchase-orders/new form).
// See integration report: PENDING — GET /api/v1/purchase-orders (list).

const MOCK: PurchaseOrderSummary[] = [
  { id:"1", poNumber:"PO-2024-00345", supplierName:"Tech Solutions Ltd.",  status:"IN_PROGRESS",        issueDate:"2024-03-15T09:30:00Z", deliveryDate:"2024-04-15T17:00:00Z", totalAmount:1725000, currency:"ETB", deliveredPercentage:65,  invoicedPercentage:0,   preparedBy:"Alex Rodriguez", createdAt:"2024-03-15T09:30:00Z" },
  { id:"2", poNumber:"PO-2024-00346", supplierName:"Network Systems Co.",  status:"DELIVERED",          issueDate:"2024-03-10T11:15:00Z", deliveryDate:"2024-03-25T17:00:00Z", totalAmount:2380000, currency:"ETB", deliveredPercentage:100, invoicedPercentage:100, preparedBy:"Michael Chen",   createdAt:"2024-03-10T11:15:00Z" },
  { id:"3", poNumber:"PO-2024-00347", supplierName:"Furniture World",      status:"ISSUED",             issueDate:"2024-03-12T14:45:00Z", deliveryDate:"2024-04-05T17:00:00Z", totalAmount:820000,  currency:"ETB", deliveredPercentage:0,   invoicedPercentage:0,   preparedBy:"Sarah Johnson",  createdAt:"2024-03-12T14:45:00Z" },
  { id:"4", poNumber:"PO-2024-00348", supplierName:"Lab Equipment Inc.",   status:"PARTIALLY_DELIVERED",issueDate:"2024-03-05T10:20:00Z", deliveryDate:"2024-03-25T17:00:00Z", totalAmount:3100000, currency:"ETB", deliveredPercentage:40,  invoicedPercentage:0,   preparedBy:"David Smith",    createdAt:"2024-03-05T10:20:00Z" },
  { id:"5", poNumber:"PO-2024-00349", supplierName:"Office Supplies Inc.", status:"INVOICED",           issueDate:"2024-02-28T13:30:00Z", deliveryDate:"2024-03-15T17:00:00Z", totalAmount:1250000, currency:"ETB", deliveredPercentage:100, invoicedPercentage:100, preparedBy:"John Doe",       createdAt:"2024-02-28T13:30:00Z" },
  { id:"6", poNumber:"PO-2024-00350", supplierName:"Electronics Pro",      status:"CLOSED",             issueDate:"2024-02-20T16:15:00Z", deliveryDate:"2024-03-10T17:00:00Z", totalAmount:1890000, currency:"ETB", deliveredPercentage:100, invoicedPercentage:100, preparedBy:"Emma Wilson",    createdAt:"2024-02-20T16:15:00Z" },
  { id:"7", poNumber:"PO-2024-00351", supplierName:"Digital Solutions Co.",status:"DRAFT",              issueDate:"2024-03-18T09:45:00Z", deliveryDate:"2024-04-10T17:00:00Z", totalAmount:1590000, currency:"ETB", deliveredPercentage:0,   invoicedPercentage:0,   preparedBy:"Robert Brown",   createdAt:"2024-03-18T09:45:00Z" },
  { id:"8", poNumber:"PO-2024-00352", supplierName:"IT Services Ltd.",     status:"CANCELLED",          issueDate:"2024-03-02T11:20:00Z", deliveryDate:"2024-03-25T17:00:00Z", totalAmount:1750000, currency:"ETB", deliveredPercentage:0,   invoicedPercentage:0,   preparedBy:"Lisa Miller",    createdAt:"2024-03-02T11:20:00Z" },
];

const STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  DRAFT:               "bg-gray-100 text-gray-600",
  ISSUED:              "bg-blue-100 text-blue-700",
  ACKNOWLEDGED:        "bg-cyan-100 text-cyan-700",
  IN_PROGRESS:         "bg-amber-100 text-amber-700",
  PARTIALLY_DELIVERED: "bg-purple-100 text-purple-700",
  DELIVERED:           "bg-green-100 text-green-700",
  PARTIALLY_INVOICED:  "bg-indigo-100 text-indigo-700",
  INVOICED:            "bg-blue-100 text-blue-700",
  PAID:                "bg-green-100 text-green-700",
  CLOSED:              "bg-gray-100 text-gray-500",
  CANCELLED:           "bg-red-100 text-red-700",
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real POST endpoint available via useCreatePurchaseOrder() — used by /new form.
  // No list endpoint from backend yet; table shows demo data.
  const _createPO = useCreatePurchaseOrder(); // referenced here so hook is registered

  const filtered = MOCK.filter((po) => {
    const q = search.toLowerCase();
    return (!search || po.poNumber.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q)) &&
           (statusFilter === "all" || po.status === statusFilter);
  });

  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  const stats = {
    active:       MOCK.filter((po) => po.status === "IN_PROGRESS").length,
    totalValue:   MOCK.reduce((s, po) => s + po.totalAmount, 0),
    pendingDel:   MOCK.filter((po) => po.status !== "CLOSED" && po.status !== "CANCELLED").reduce((s, po) => s + po.totalAmount * (100 - po.deliveredPercentage) / 100, 0),
    pendingInv:   MOCK.filter((po) => po.status !== "CLOSED" && po.status !== "CANCELLED").reduce((s, po) => s + po.totalAmount * (100 - po.invoicedPercentage) / 100, 0),
  };

  return (
    <div className="space-y-6">
      {/* API integration note */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Integration note:</strong> PO list uses demo data —
          {" "}<code className="font-mono text-xs">GET /api/v1/purchase-orders</code> not yet implemented in the backend.
          New PO creation connects to <code className="font-mono text-xs">POST /api/v1/purchase-orders</code>.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track purchase orders with suppliers</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <a href="/prms/purchase-orders/new"><Plus className="h-4 w-4 mr-2" />New Purchase Order</a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Active POs",        value:stats.active,                 bg:"bg-amber-500",  icon:Clock     },
          { label:"Total Value",       value:formatCurrency(stats.totalValue), bg:"bg-green-500",  icon:DollarSign},
          { label:"Pending Delivery",  value:formatCurrency(stats.pendingDel), bg:"bg-blue-500",   icon:Truck     },
          { label:"Pending Invoices",  value:formatCurrency(stats.pendingInv), bg:"bg-purple-500", icon:DollarSign},
        ].map(({ label, value, bg, icon: Icon }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
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
            <Input placeholder="Search purchase orders…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-52 border-gray-300 text-gray-800"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {["all","DRAFT","ISSUED","IN_PROGRESS","PARTIALLY_DELIVERED","DELIVERED","INVOICED","PAID","CLOSED","CANCELLED"].map((v) => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Status" : v.replace(/_/g," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-300 text-gray-700"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Purchase Orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["PO Number","Supplier","Delivery Date","Amount","Delivery","Invoice","Status","Prepared By","Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((po) => {
                  const days = daysLeft(po.deliveryDate);
                  const overdue = days < 0;
                  return (
                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{po.poNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{po.supplierName}</p>
                        <p className="text-xs text-gray-400">Issued: {formatDate(po.issueDate)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-gray-800"}`}>{formatDate(po.deliveryDate)}</p>
                        <p className={`text-xs ${overdue ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>{overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className={`h-full rounded-full ${po.deliveredPercentage >= 100 ? "bg-green-500" : po.deliveredPercentage > 0 ? "bg-amber-400" : "bg-gray-200"}`} style={{ width: `${po.deliveredPercentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{po.deliveredPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className={`h-full rounded-full ${po.invoicedPercentage >= 100 ? "bg-blue-500" : po.invoicedPercentage > 0 ? "bg-indigo-400" : "bg-gray-200"}`} style={{ width: `${po.invoicedPercentage}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{po.invoicedPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge className={`${STATUS_STYLES[po.status]} border-0 text-xs font-semibold`}>{po.status.replace(/_/g," ")}</Badge></td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{po.preparedBy}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                            <DropdownMenuLabel className="text-xs text-gray-700">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"><Eye className="h-3.5 w-3.5 mr-2" />View</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => toast({ title:"Creating GRN…" })}><Package className="h-3.5 w-3.5 mr-2" />Create GRN</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => toast({ title:"Printing…" })}><Printer className="h-3.5 w-3.5 mr-2" />Print PO</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="text-xs text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => toast({ title:"Cancelled" })}><XCircle className="h-3.5 w-3.5 mr-2" />Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={9} className="py-16 text-center text-gray-400">No purchase orders found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
