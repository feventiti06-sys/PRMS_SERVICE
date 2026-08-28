"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FileText,
  CheckSquare,
  FileSearch,
  Quote,
  Scale,
  ShoppingCart,
  FileCheck,
  Package,
  Receipt,
  BarChart3,
  Shield,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { ROLES, getRoleDisplayName, type PRMSRole } from "@/features/auth/types/roles";

// ─── Navigation configuration ─────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         icon: Home,        href: "/prms" },
  { label: "Suppliers",         icon: Users,       href: "/prms/suppliers" },
  { label: "Purchase Requests", icon: FileText,    href: "/prms/purchase-requests" },
  { label: "Approvals",         icon: CheckSquare, href: "/prms/approvals" },
  { label: "RFQ",               icon: FileSearch,  href: "/prms/rfq" },
  { label: "Quotations",        icon: Quote,       href: "/prms/quotations" },
  { label: "Evaluation",        icon: Scale,       href: "/prms/evaluation" },
  { label: "Purchase Orders",   icon: ShoppingCart,href: "/prms/purchase-orders" },
  { label: "Contracts",         icon: FileCheck,   href: "/prms/contracts" },
  { label: "Goods Receipt",     icon: Package,     href: "/prms/goods-receipt" },
  { label: "Invoices",          icon: Receipt,     href: "/prms/invoices" },
  { label: "Reports",           icon: BarChart3,   href: "/prms/reports" },
  { label: "Audit Logs",        icon: Shield,      href: "/prms/audit" },
  { label: "Settings",          icon: Settings,    href: "/prms/settings" },
];

const ROLE_NAV_HREFS: Record<PRMSRole, string[]> = {
  [ROLES.PROCUREMENT_ADMIN]: [
    "/prms", "/prms/suppliers", "/prms/purchase-requests", "/prms/approvals",
    "/prms/rfq", "/prms/quotations", "/prms/evaluation", "/prms/purchase-orders",
    "/prms/contracts", "/prms/goods-receipt", "/prms/invoices",
    "/prms/reports", "/prms/audit", "/prms/settings",
  ],
  [ROLES.REQUESTER]: ["/prms", "/prms/purchase-requests"],
  [ROLES.SUPPLIER]: [
    "/prms", "/prms/rfq", "/prms/quotations", "/prms/purchase-orders",
    "/prms/contracts", "/prms/goods-receipt", "/prms/invoices",
  ],
};

function getNavItemsForRole(role: PRMSRole | null): NavItem[] {
  if (!role) return [];
  const allowed = ROLE_NAV_HREFS[role] ?? [];
  return ALL_NAV_ITEMS.filter((item) => allowed.includes(item.href));
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function PRMSSidebar() {
  const [prmsExpanded, setPrmsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const navItems = getNavItemsForRole(role);
  const showHelp = role === ROLES.REQUESTER || role === ROLES.SUPPLIER;

  const displayName =
    user?.displayName ??
    (user ? `${user.firstName} ${user.lastName}`.trim() : null);
  const roleLabel = role ? getRoleDisplayName(role) : "";

  const getInitials = (): string => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return "U";
  };

  // Sidebar bg: dark navy matching the ERP screenshot
  const sidebarBg = "#0a1f44";

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-white/20 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
        style={{ background: sidebarBg }}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 flex h-full w-64 flex-col transition-all duration-300 ease-in-out md:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: sidebarBg }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          {/* INSA logo box */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/insa.jpg"
              alt="INSA"
              className="h-7 w-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold leading-tight text-white">
              Information Network Security Administration
            </p>
            <p className="text-[10px] text-white/50">Enterprise Resource Planning</p>
          </div>
        </div>

        {/* ── Nav label ── */}
        <div className="px-4 pt-5 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Main Menu
          </span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {/* Procurement section toggle */}
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            onClick={() => setPrmsExpanded(!prmsExpanded)}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart size={16} className="text-white/60" />
              <span>Procurement</span>
            </div>
            {prmsExpanded ? (
              <ChevronDown size={14} className="text-white/40" />
            ) : (
              <ChevronRight size={14} className="text-white/40" />
            )}
          </button>

          {prmsExpanded && (
            <div className="mt-1 space-y-0.5 pl-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/prms" && pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-[#c1121f] font-semibold text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Help */}
          {showHelp && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <a
                href="/help"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <HelpCircle size={15} />
                <span>Help &amp; Support</span>
              </a>
            </div>
          )}
        </nav>

        {/* ── Pending approvals badge (like screenshot) ── */}
        {role === ROLES.PROCUREMENT_ADMIN && (
          <div
            className="mx-3 mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(193,18,31,0.18)", border: "1px solid rgba(193,18,31,0.35)" }}
          >
            <Bell size={16} className="flex-shrink-0 text-[#c1121f]" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">5 Pending Approvals</p>
              <p className="text-[11px] text-white/50">Action required</p>
            </div>
          </div>
        )}

        {/* ── User footer ── */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#c1121f] text-xs font-bold text-white">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName ?? "—"}
                </p>
                <p className="truncate text-[11px] text-[#c1121f]">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="ml-2 flex-shrink-0 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
