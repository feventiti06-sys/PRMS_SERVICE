"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, FileText, CheckSquare,
  ShoppingCart, FileSearch, Receipt, Plus, Send, UserPlus,
  ClipboardList, Package, FileSignature, BarChart3, Clock,
  CheckCircle, XCircle, FileCheck, Quote,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { ROLES } from "@/features/auth/types/roles";

// ─── Shared micro-components ──────────────────────────────────────────────────

function KpiCard({
  href, icon: Icon, iconBg, value, label, trend, trendLabel,
}: {
  href: string; icon: React.ComponentType<{ className?: string }>; iconBg: string;
  value: string; label: string; trend: "up" | "down"; trendLabel: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer border border-gray-200 bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trendLabel}
              </p>
            </div>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          {/* colored bottom accent like screenshot */}
          <div className={`mt-3 h-0.5 w-full rounded-full ${iconBg}`} />
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Interactive bar chart (spend vs budget) ──────────────────────────────────

const SPEND_DATA = [
  { month: "Jan", spend: 240, budget: 320 },
  { month: "Feb", spend: 280, budget: 320 },
  { month: "Mar", spend: 200, budget: 320 },
  { month: "Apr", spend: 300, budget: 320 },
  { month: "May", spend: 350, budget: 320 },
  { month: "Jun", spend: 260, budget: 320 },
  { month: "Jul", spend: 400, budget: 320 },
  { month: "Aug", spend: 320, budget: 320 },
  { month: "Sep", spend: 280, budget: 320 },
  { month: "Oct", spend: 350, budget: 320 },
];

function SpendChart() {
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; month: string; spend: number; budget: number }>(null);
  const maxVal = 450;
  const H = 160;
  const barW = 14;
  const gap = 30;
  const padL = 36;
  const padB = 24;
  const totalW = padL + SPEND_DATA.length * gap;

  return (
    <div className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${H + padB + 8}`}
        className="overflow-visible"
      >
        {/* Y-axis gridlines */}
        {[0, 100, 200, 300, 400].map((v) => {
          const y = H - (v / maxVal) * H + 4;
          return (
            <g key={v}>
              <line x1={padL - 4} x2={totalW} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize={9} fill="#9ca3af">
                {v}k
              </text>
            </g>
          );
        })}

        {SPEND_DATA.map((d, i) => {
          const x = padL + i * gap;
          const budgetH = (d.budget / maxVal) * H;
          const spendH = (d.spend / maxVal) * H;
          const budgetY = H - budgetH + 4;
          const spendY = H - spendH + 4;

          return (
            <g
              key={d.month}
              onMouseEnter={() =>
                setTooltip({ x, y: Math.min(spendY, budgetY) - 10, month: d.month, spend: d.spend, budget: d.budget })
              }
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            >
              {/* Budget bar */}
              <rect
                x={x - barW / 2 - 1}
                y={budgetY}
                width={barW}
                height={budgetH}
                rx={2}
                fill="#bfdbfe"
                opacity={0.7}
              />
              {/* Spend bar */}
              <rect
                x={x - barW / 2 + barW / 2}
                y={spendY}
                width={barW}
                height={spendH}
                rx={2}
                fill="#c1121f"
                opacity={0.85}
              />
              {/* Month label */}
              <text
                x={x + barW / 4}
                y={H + padB - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#9ca3af"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl text-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold text-gray-800 mb-1">{tooltip.month}</p>
          <p className="text-[#c1121f]">Spend: {tooltip.spend}k ETB</p>
          <p className="text-blue-400">Budget: {tooltip.budget}k ETB</p>
        </div>
      )}

      <div className="mt-2 flex justify-center gap-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2.5 w-2.5 rounded bg-[#c1121f]" /> Spend
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2.5 w-2.5 rounded bg-blue-200" /> Budget
        </div>
      </div>
    </div>
  );
}

// ─── Interactive line chart (stock movement style) ────────────────────────────

const LINE_DATA = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  receipt: [280, 310, 260, 390, 420, 370, 450],
  issue:   [160, 190, 140, 230, 280, 240, 310],
};

function LineChart() {
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; label: string; receipt: number; issue: number }>(null);
  const W = 480; const H = 140; const padL = 40; const padB = 20;
  const maxV = 500;
  const pts = LINE_DATA.labels.length;
  const xStep = (W - padL) / (pts - 1);

  const toY = (v: number) => H - (v / maxV) * H + 4;
  const toX = (i: number) => padL + i * xStep;

  const receiptPath = LINE_DATA.receipt
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");
  const issuePath = LINE_DATA.issue
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");

  // area under receipt
  const receiptArea =
    receiptPath + ` L ${toX(pts - 1)} ${H + 4} L ${toX(0)} ${H + 4} Z`;
  const issueArea =
    issuePath + ` L ${toX(pts - 1)} ${H + 4} L ${toX(0)} ${H + 4} Z`;

  return (
    <div className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H + padB + 8}`}
        className="overflow-visible"
      >
        {/* Gridlines */}
        {[0, 150, 300, 450].map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={padL} x2={W} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Areas */}
        <path d={receiptArea} fill="#1e50c8" opacity={0.06} />
        <path d={issueArea} fill="#c1121f" opacity={0.06} />

        {/* Lines */}
        <path d={receiptPath} fill="none" stroke="#1e50c8" strokeWidth={2.5} strokeLinejoin="round" />
        <path d={issuePath} fill="none" stroke="#c1121f" strokeWidth={2.5} strokeLinejoin="round" />

        {/* Dots + hover targets */}
        {LINE_DATA.labels.map((lbl, i) => (
          <g
            key={lbl}
            onMouseEnter={() =>
              setTooltip({
                x: toX(i),
                y: Math.min(toY(LINE_DATA.receipt[i]), toY(LINE_DATA.issue[i])) - 12,
                label: lbl,
                receipt: LINE_DATA.receipt[i],
                issue: LINE_DATA.issue[i],
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="cursor-pointer"
          >
            <circle cx={toX(i)} cy={toY(LINE_DATA.receipt[i])} r={4} fill="white" stroke="#1e50c8" strokeWidth={2} />
            <circle cx={toX(i)} cy={toY(LINE_DATA.issue[i])} r={4} fill="white" stroke="#c1121f" strokeWidth={2} />
            <rect x={toX(i) - 16} y={0} width={32} height={H + padB} fill="transparent" />
            <text x={toX(i)} y={H + padB - 2} textAnchor="middle" fontSize={9} fill="#9ca3af">{lbl}</text>
          </g>
        ))}
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl text-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold text-gray-800 mb-1">{tooltip.label}</p>
          <p className="text-[#1e50c8]">Goods Receipt: {tooltip.receipt}</p>
          <p className="text-[#c1121f]">Issue: {tooltip.issue}</p>
        </div>
      )}

      <div className="mt-2 flex justify-center gap-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block h-0.5 w-5 rounded bg-[#1e50c8]" /> Goods Receipt
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block h-0.5 w-5 rounded bg-[#c1121f]" /> Goods Issue
        </div>
      </div>
    </div>
  );
}

// ─── PROCUREMENT_ADMIN dashboard ──────────────────────────────────────────────

const PENDING_APPROVALS = [
  { id: "PR-2025-047", module: "PRMS",    title: "Purchase Request",   dept: "Procurement Dept", amount: "ETB 45,000",  priority: "High",   priColor: "text-red-600"   },
  { id: "PO-2025-033", module: "PRMS",    title: "Purchase Order",     dept: "Store Dept",       amount: "ETB 128,000", priority: "High",   priColor: "text-red-600"   },
  { id: "JE-2025-221", module: "FMS",     title: "Journal Entry",      dept: "Finance Dept",     amount: "ETB 78,500",  priority: "Normal", priColor: "text-gray-500"  },
  { id: "SQ-2025-089", module: "CRM",     title: "Sales Quotation",    dept: "Sales Team",       amount: "ETB 320,000", priority: "High",   priColor: "text-red-600"   },
];

const MODULE_BADGE: Record<string, string> = {
  PRMS: "bg-[#c1121f22] text-[#c1121f]",
  FMS:  "bg-[#10b98122] text-[#10b981]",
  CRM:  "bg-[#8b5cf622] text-[#8b5cf6]",
  HRM:  "bg-[#1e50c822] text-[#1e50c8]",
};

const MODULE_BAR: Record<string, string> = {
  PRMS: "bg-[#c1121f]",
  FMS:  "bg-[#10b981]",
  CRM:  "bg-[#8b5cf6]",
  HRM:  "bg-[#1e50c8]",
};

function ProcurementAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP System Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Cross-module overview — PRMS · Finance · Materials · CRM</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Fiscal Period</p>
          <p className="text-sm font-bold text-[#c1121f]">
            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard href="/prms/purchase-requests" icon={FileText}    iconBg="bg-[#c1121f]" value="47"     label="Purchase Requests" trend="up"   trendLabel="+12.5%" />
        <KpiCard href="/prms/approvals"         icon={CheckSquare} iconBg="bg-amber-500"  value="5"      label="Pending Approvals"  trend="down" trendLabel="-2%"    />
        <KpiCard href="/prms/suppliers"         icon={Users}       iconBg="bg-blue-600"   value="42"     label="Active Suppliers"   trend="up"   trendLabel="+3.2%"  />
        <KpiCard href="/prms/rfq"               icon={FileSearch}  iconBg="bg-purple-600" value="8"      label="Open RFQs"          trend="up"   trendLabel="+5%"    />
        <KpiCard href="/prms/purchase-orders"   icon={ShoppingCart}iconBg="bg-teal-600"   value="6"      label="Purchase Orders"    trend="up"   trendLabel="+3%"    />
        <KpiCard href="/prms/invoices"          icon={Receipt}     iconBg="bg-rose-500"   value="ETB 2.8M" label="Accounts Receivable" trend="up" trendLabel="+5.1%" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Revenue vs Expenses</CardTitle>
                <p className="text-xs text-gray-400">FMS — Monthly (ETB)</p>
              </div>
              <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-[#10b98122] text-[#10b981]">FMS</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <SpendChart />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Stock Movement</CardTitle>
                <p className="text-xs text-gray-400">MMS — Goods Receipt vs Issue</p>
              </div>
              <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-[#f59e0b22] text-[#f59e0b]">MMS</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <LineChart />
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals + Module status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending approvals list */}
        <Card className="border border-gray-200 bg-white lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#c1121f]" />
                <CardTitle className="text-sm font-semibold text-gray-900">Pending Approvals</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1e50c8] hover:bg-blue-50" asChild>
                <Link href="/prms/approvals">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {PENDING_APPROVALS.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-1 h-10 flex-shrink-0 rounded-full ${MODULE_BAR[item.module]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-semibold text-gray-500">{item.id}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${MODULE_BADGE[item.module]}`}>{item.module}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.dept}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{item.amount}</p>
                    <p className={`text-xs font-semibold ${item.priColor}`}>{item.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module status */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Module Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "HRM",  color: "#1e50c8", status: "✓", sub: "284 employees active"  },
              { name: "PRMS", color: "#c1121f", status: "⚠", sub: "5 pending approvals"   },
              { name: "MMS",  color: "#f59e0b", status: "⚠", sub: "23 low stock items"     },
              { name: "CRM",  color: "#10b981", status: "✓", sub: "138 open orders"        },
              { name: "FMS",  color: "#10b981", status: "✓", sub: "14 overdue invoices"    },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: m.color }}>
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.sub}</p>
                </div>
                <span className={m.status === "✓" ? "text-green-500 text-base" : "text-amber-400 text-base"}>{m.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick create */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Quick Create</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { href: "/prms/suppliers/new",         icon: UserPlus,      label: "Register Supplier",  color: "bg-blue-500"   },
              { href: "/prms/purchase-requests/new", icon: ClipboardList, label: "New Purchase Req",   color: "bg-[#c1121f]"  },
              { href: "/prms/purchase-orders/new",   icon: Package,       label: "Issue PO",           color: "bg-amber-500"  },
              { href: "/prms/rfq/new",               icon: Send,          label: "Send RFQ",           color: "bg-purple-500" },
              { href: "/prms/quotations/new",        icon: FileSignature, label: "New Quotation",      color: "bg-green-500"  },
              { href: "/prms/contracts",             icon: FileText,      label: "New Contract",       color: "bg-orange-500" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Button key={href} variant="outline" className="h-16 flex-col gap-1 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50" asChild>
                <Link href={href}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs">{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── REQUESTER dashboard ──────────────────────────────────────────────────────

function RequesterDashboard() {
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard href="/prms/purchase-requests" icon={FileText}    iconBg="bg-blue-500"   value="4" label="My Purchase Requests" trend="up"   trendLabel="+1 this month" />
        <KpiCard href="/prms/purchase-requests" icon={Clock}       iconBg="bg-amber-500"  value="2" label="Pending Review"        trend="down" trendLabel="Action needed"  />
        <KpiCard href="/prms/purchase-requests" icon={CheckCircle} iconBg="bg-green-500"  value="1" label="Approved"              trend="up"   trendLabel="Ready"         />
        <KpiCard href="/prms/purchase-requests" icon={XCircle}     iconBg="bg-rose-500"   value="1" label="Rejected"              trend="down" trendLabel="Review reasons" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Recent Purchase Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {[
                { id: "PR-2024-001", title: "Office Supplies Q4",  status: "Pending",  date: "Nov 10", color: "bg-amber-100 text-amber-700"  },
                { id: "PR-2024-002", title: "IT Equipment",         status: "Approved", date: "Nov 08", color: "bg-green-100 text-green-700"  },
                { id: "PR-2024-003", title: "Maintenance Tools",    status: "Pending",  date: "Nov 06", color: "bg-amber-100 text-amber-700"  },
                { id: "PR-2024-004", title: "Lab Chemicals",        status: "Rejected", date: "Nov 03", color: "bg-red-100 text-red-700"      },
              ].map((pr) => (
                <Link key={pr.id} href={`/prms/purchase-requests/${pr.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pr.title}</p>
                    <p className="text-xs text-gray-400">{pr.id} · {pr.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pr.color}`}>{pr.status}</span>
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

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-900">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-[#c1121f] hover:bg-[#a00f1a] text-white" asChild>
              <Link href="/prms/purchase-requests/new"><Plus className="mr-2 h-4 w-4" />Create Purchase Request</Link>
            </Button>
            <Button variant="outline" className="w-full border-gray-200 text-gray-700" asChild>
              <Link href="/prms/purchase-requests"><ClipboardList className="mr-2 h-4 w-4" />View My Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SUPPLIER dashboard ───────────────────────────────────────────────────────

function SupplierDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supplier Portal</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage RFQs, quotations, orders, and contracts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard href="/prms/rfq"            icon={FileSearch}  iconBg="bg-purple-600" value="4" label="Available RFQs"       trend="up"   trendLabel="New this week"   />
        <KpiCard href="/prms/quotations"     icon={Quote}       iconBg="bg-blue-500"   value="3" label="Submitted Quotations"  trend="up"   trendLabel="Under review"    />
        <KpiCard href="/prms/purchase-orders"icon={ShoppingCart}iconBg="bg-teal-500"   value="2" label="Active POs"            trend="up"   trendLabel="In progress"     />
        <KpiCard href="/prms/contracts"      icon={FileCheck}   iconBg="bg-green-500"  value="1" label="Active Contracts"      trend="up"   trendLabel="Valid"           />
        <KpiCard href="/prms/invoices"       icon={Receipt}     iconBg="bg-rose-500"   value="2" label="Pending Invoices"      trend="down" trendLabel="Awaiting payment"/>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-gray-200 bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-900">Open RFQs — Action Required</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {[
                { id: "RFQ-2024-011", title: "Laboratory Equipment",   deadline: "Nov 20", status: "New",       color: "bg-blue-100 text-blue-700"  },
                { id: "RFQ-2024-012", title: "Office Stationery",      deadline: "Nov 22", status: "Quoted",    color: "bg-green-100 text-green-700" },
                { id: "RFQ-2024-013", title: "IT Hardware",            deadline: "Nov 25", status: "New",       color: "bg-blue-100 text-blue-700"  },
                { id: "RFQ-2024-014", title: "Cleaning Supplies",      deadline: "Nov 28", status: "Reviewing", color: "bg-amber-100 text-amber-700" },
              ].map((rfq) => (
                <Link key={rfq.id} href="/prms/rfq" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                    <p className="text-xs text-gray-400">{rfq.id} · Deadline: {rfq.deadline}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rfq.color}`}>{rfq.status}</span>
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

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-900">Procurement Workflow</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { step: "1", label: "Receive RFQ",      href: "/prms/rfq",            active: true  },
                { step: "2", label: "Submit Quotation", href: "/prms/quotations/new", active: true  },
                { step: "3", label: "Receive PO",       href: "/prms/purchase-orders",active: false },
                { step: "4", label: "Sign Contract",    href: "/prms/contracts",       active: false },
                { step: "5", label: "Goods Delivery",   href: "/prms/goods-receipt",   active: false },
                { step: "6", label: "Submit Invoice",   href: "/prms/invoices",        active: false },
              ].map(({ step, label, href, active }) => (
                <Link key={step} href={href} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 group">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${active ? "bg-[#c1121f] text-white" : "bg-gray-100 text-gray-400"}`}>
                    {step}
                  </div>
                  <span className={`text-sm ${active ? "font-medium text-gray-900" : "text-gray-400"}`}>{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function PRMSDashboard() {
  const { role } = useAuth();

  if (role === ROLES.PROCUREMENT_ADMIN) return <ProcurementAdminDashboard />;
  if (role === ROLES.REQUESTER)         return <RequesterDashboard />;
  if (role === ROLES.SUPPLIER)          return <SupplierDashboard />;

  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#c1121f] border-t-transparent" />
        <p className="text-sm text-gray-500">Loading dashboard…</p>
      </div>
    </div>
  );
}
