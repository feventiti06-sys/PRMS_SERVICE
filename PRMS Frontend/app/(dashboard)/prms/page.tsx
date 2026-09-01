"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp, Users, FileText, CheckSquare, ShoppingCart,
  FileSearch, Receipt, Plus, UserPlus, ClipboardList, Package,
  FileSignature, Clock, CheckCircle, XCircle, Quote, FileCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { ROLES } from "@/features/auth/types/roles";
import { useDashboardStats } from "@/features/prms/hooks/use-dashboard";
import { useRequisitionsByRequester } from "@/features/prms/hooks/use-requisitions";
import { useRFQs } from "@/features/prms/hooks/use-rfq";
import { prStatusLabel, prStatusBadge } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

function KpiCard({
  href, icon: Icon, iconBg, value, label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  value: string | number;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer border border-gray-200 bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className={`mt-3 h-0.5 w-full rounded-full ${iconBg}`} />
        </CardContent>
      </Card>
    </Link>
  );
}

function ProcurementAdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PRMS Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Live data from PostgreSQL</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Fiscal Period</p>
          <p className="text-sm font-bold text-[#c1121f]">
            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />Loading live statistics…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <KpiCard href="/prms/purchase-requests" icon={FileText} iconBg="bg-[#c1121f]"
            value={stats?.totalRequisitions ?? 0} label="Total Requisitions" />
          <KpiCard href="/prms/approvals" icon={CheckSquare} iconBg="bg-amber-500"
            value={stats?.pendingApprovals ?? 0} label="Pending Approvals" />
          <KpiCard href="/prms/suppliers" icon={Users} iconBg="bg-blue-600"
            value={stats?.activeVendors ?? 0} label="Active Suppliers" />
          <KpiCard href="/prms/rfq" icon={FileSearch} iconBg="bg-purple-600"
            value={stats?.openRfqs ?? 0} label="Open RFQs" />
          <KpiCard href="/prms/purchase-orders" icon={ShoppingCart} iconBg="bg-teal-600"
            value={stats?.totalPurchaseOrders ?? 0} label="Purchase Orders" />
          <KpiCard href="/prms/invoices" icon={Receipt} iconBg="bg-rose-500"
            value={stats?.pendingInvoices ?? 0} label="Pending Invoices" />
          <KpiCard href="/prms/goods-receipt" icon={Package} iconBg="bg-indigo-500"
            value={stats?.pendingGoodsReceipts ?? 0} label="Pending GRNs" />
          <KpiCard href="/prms/contracts" icon={FileCheck} iconBg="bg-orange-500"
            value={formatCurrency(stats?.totalPurchaseOrderValue ?? 0)} label="PO Total Value" />
        </div>
      )}

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Quick Create</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { href: "/prms/suppliers/new", icon: UserPlus, label: "Register Supplier", color: "bg-blue-500" },
              { href: "/prms/purchase-requests/new", icon: ClipboardList, label: "New Purchase Request", color: "bg-[#c1121f]" },
              { href: "/prms/purchase-orders/new", icon: Package, label: "Issue PO", color: "bg-amber-500" },
              { href: "/prms/rfq/new", icon: FileSearch, label: "Send RFQ", color: "bg-purple-500" },
              { href: "/prms/quotations/new", icon: FileSignature, label: "New Quotation", color: "bg-green-500" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Button key={href} variant="outline" className="h-16 flex-col gap-1 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50" asChild>
                <Link href={href}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center leading-tight">{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RequesterDashboard() {
  const { user } = useAuth();
  const { data: requisitions, isLoading } = useRequisitionsByRequester(user?.username ?? null);

  const pending = requisitions?.filter((r) => r.status === "PENDING_APPROVAL").length ?? 0;
  const approved = requisitions?.filter((r) => r.status === "APPROVED").length ?? 0;
  const rejected = requisitions?.filter((r) => r.status === "REJECTED").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your purchase requests</p>
        </div>
        <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white shadow-sm" asChild>
          <Link href="/prms/purchase-requests/new"><Plus className="mr-2 h-4 w-4" />New Request</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />Loading your requests…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard href="/prms/purchase-requests" icon={FileText} iconBg="bg-blue-500"
            value={requisitions?.length ?? 0} label="My Purchase Requests" />
          <KpiCard href="/prms/purchase-requests" icon={Clock} iconBg="bg-amber-500"
            value={pending} label="Pending Review" />
          <KpiCard href="/prms/purchase-requests" icon={CheckCircle} iconBg="bg-green-500"
            value={approved} label="Approved" />
          <KpiCard href="/prms/purchase-requests" icon={XCircle} iconBg="bg-rose-500"
            value={rejected} label="Rejected" />
        </div>
      )}

      {!isLoading && (requisitions?.length ?? 0) > 0 && (
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Recent Purchase Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {requisitions?.slice(0, 5).map((r) => (
                <Link key={r.id} href={`/prms/purchase-requests/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.purpose}</p>
                    <p className="text-xs text-gray-400">{r.requisitionNumber}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${prStatusBadge(r.status)}`}>
                    {prStatusLabel(r.status)}
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-50 p-3">
              <Button variant="outline" size="sm" className="w-full text-xs border-gray-200" asChild>
                <Link href="/prms/purchase-requests">View All Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SupplierDashboard() {
  const { data: rfqs, isLoading } = useRFQs();
  const openRfqs = rfqs?.filter((r) => r.active) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supplier Portal</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage RFQs, quotations, orders, and contracts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard href="/prms/rfq" icon={FileSearch} iconBg="bg-purple-600"
          value={isLoading ? "…" : openRfqs.length} label="Available RFQs" />
        <KpiCard href="/prms/purchase-orders" icon={ShoppingCart} iconBg="bg-teal-500"
          value="—" label="Active POs" />
        <KpiCard href="/prms/contracts" icon={FileCheck} iconBg="bg-green-500"
          value="—" label="Active Contracts" />
        <KpiCard href="/prms/invoices" icon={Receipt} iconBg="bg-rose-500"
          value="—" label="Pending Invoices" />
      </div>

      {!isLoading && openRfqs.length > 0 && (
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Open RFQs — Action Required</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {openRfqs.slice(0, 5).map((rfq) => (
                <Link key={rfq.id} href="/prms/rfq"
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                    <p className="text-xs text-gray-400">{rfq.rfqNumber} · Deadline: {rfq.submissionDeadline}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">Open</span>
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-50 p-3">
              <Button variant="outline" size="sm" className="w-full text-xs border-gray-200" asChild>
                <Link href="/prms/rfq">View All RFQs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PRMSDashboard() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#c1121f]" />
        <span className="ml-2 text-gray-500">Loading dashboard…</span>
      </div>
    );
  }

  if (role === ROLES.PROCUREMENT_ADMIN) return <ProcurementAdminDashboard />;
  if (role === ROLES.REQUESTER) return <RequesterDashboard />;
  if (role === ROLES.SUPPLIER) return <SupplierDashboard />;

  return (
    <div className="flex min-h-64 items-center justify-center">
      <p className="text-gray-500">No dashboard available for your role.</p>
    </div>
  );
}
