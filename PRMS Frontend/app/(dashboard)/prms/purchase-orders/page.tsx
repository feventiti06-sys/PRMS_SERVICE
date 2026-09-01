"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Truck, DollarSign, Loader2, AlertCircle, RefreshCw, MoreVertical, Eye,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePurchaseOrders } from "@/features/prms/hooks/use-purchase-orders";
import { poStatusBadge, type PurchaseOrderResponse, type BackendPOStatus } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

function daysLeft(d: string | null | undefined) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const { data: orders, isLoading, isError, refetch } = usePurchaseOrders();

  const filtered = (orders ?? []).filter((po: PurchaseOrderResponse) => {
    const q = search.toLowerCase();
    return !search || po.purchaseOrderNumber.toLowerCase().includes(q) || po.vendorName.toLowerCase().includes(q);
  });

  const totalValue = (orders ?? []).reduce((s, po) => s + (po.totalAmount ?? 0), 0);
  const active = (orders ?? []).filter((po) => !["COMPLETED", "CANCELLED"].includes(po.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">All purchase orders from PostgreSQL</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/purchase-orders/new"><Plus className="h-4 w-4 mr-2" />New Purchase Order</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />Loading purchase orders…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Failed to load purchase orders.</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: "Total POs", value: orders?.length ?? 0, bg: "bg-blue-500", icon: Truck },
          { label: "Active", value: active, bg: "bg-amber-500", icon: Truck },
          { label: "Total Value", value: formatCurrency(totalValue), bg: "bg-green-500", icon: DollarSign },
        ].map(({ label, value, bg, icon: Icon }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p></div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className="h-5 w-5 text-white" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search purchase orders…"
          className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Purchase Orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["PO Number", "Vendor", "Amount", "Payment Terms", "Expected Delivery", "Status", "Actions"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((po: PurchaseOrderResponse) => {
                    const days = daysLeft(po.expectedDeliveryDate);
                    const overdue = days !== null && days < 0;
                    return (
                      <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#1e50c8]">{po.purchaseOrderNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{po.vendorName}</p>
                          <p className="text-xs text-gray-400">Issued: {po.orderDate}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</td>
                        <td className="py-3 px-4 text-gray-700 text-xs">{po.paymentTerms?.replace("_", " ")}</td>
                        <td className="py-3 px-4">
                          {po.expectedDeliveryDate ? (
                            <>
                              <p className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-gray-800"}`}>{po.expectedDeliveryDate}</p>
                              {days !== null && (
                                <p className={`text-xs ${overdue ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                                  {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                                </p>
                              )}
                            </>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${poStatusBadge(po.status)} border-0 text-xs font-semibold`}>
                            {po.status.replace(/_/g, " ")}
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
                              <DropdownMenuItem className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer" asChild>
                                <Link href={`/prms/purchase-orders/${po.id}`}><Eye className="h-3.5 w-3.5 mr-2" />View</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !isLoading && (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-400">
                      {orders?.length === 0 ? "No purchase orders yet." : "No orders match your search."}
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
