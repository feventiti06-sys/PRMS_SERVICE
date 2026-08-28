"use client";

import { useState, useRef, useEffect } from "react";
import { Search, HelpCircle, Menu, BookOpen, MessageCircle, Settings, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/features/auth/components/user-menu";
import { NotificationPanel } from "@/features/prms/components/notifications/notification-panel";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { ROLES } from "@/features/auth/types/roles";
import { usePathname, useRouter } from "next/navigation";

// Build a human-readable breadcrumb from the current path
function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\/prms\/?/, "")
    .split("/")
    .filter(Boolean);

  const label = segments.length
    ? segments[0]
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    : "Dashboard";

  return { top: "Procurement & Resource Management", sub: label };
}

// ─── Help panel ───────────────────────────────────────────────────────────────

function HelpPanel() {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const router          = useRouter();

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const items = [
    { icon: BookOpen,       label: "User Guide",            sub: "How to use PRMS",               action: () => { window.open("https://insa.gov.et", "_blank"); setOpen(false); } },
    { icon: MessageCircle,  label: "Contact Support",       sub: "support@insa.gov.et",            action: () => { window.location.href = "mailto:support@insa.gov.et"; setOpen(false); } },
    { icon: Settings,       label: "System Settings",       sub: "Configure PRMS preferences",    action: () => { router.push("/prms/settings"); setOpen(false); } },
    { icon: ExternalLink,   label: "INSA Portal",           sub: "insa.gov.et",                   action: () => { window.open("https://insa.gov.et", "_blank"); setOpen(false); } },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 ${open ? "bg-gray-100 text-gray-800" : ""}`}
        aria-label="Help"
      >
        <HelpCircle size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-bold text-gray-900">Help &amp; Support</span>
            <button onClick={() => setOpen(false)} className="rounded p-0.5 text-gray-400 hover:text-gray-700"><X size={14} /></button>
          </div>

          {/* items */}
          <div className="p-2">
            {items.map(({ icon: Icon, label, sub, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <p className="text-xs text-gray-400">PRMS v1.0 · INSA ERP System</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PRMSHeader() {
  const { role } = useAuth();
  const { top, sub } = useBreadcrumb();

  const showSearch =
    role === ROLES.PROCUREMENT_ADMIN || role === ROLES.SUPPLIER;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left — title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </Button>

          <div>
            <p className="text-[13px] font-medium text-gray-900">{top}</p>
            <p className="text-xs text-gray-400">INSA Enterprise Resource Planning System</p>
          </div>
        </div>

        {/* Right — search + actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <Input
                type="search"
                placeholder="Search…"
                className="h-9 w-56 rounded-full border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:bg-white lg:w-72"
              />
            </div>
          )}

          <NotificationPanel />

          <HelpPanel />

          <div className="ml-1 border-l border-gray-200 pl-3">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Role-aware quick-stats strip */}
      {role === ROLES.PROCUREMENT_ADMIN && (
        <div className="flex items-center gap-6 overflow-x-auto border-t border-gray-100 px-6 py-1.5 no-scrollbar">
          <StatChip dot="bg-green-500" label="System: Online" />
          <StatChip label="Open PRs:" value="12" />
          <StatChip label="Pending Approvals:" value="5" valueClass="text-amber-600 font-semibold" />
          <StatChip label="Active Suppliers:" value="42" />
          <StatChip label="Unpaid Invoices:" value="8" valueClass="text-red-600 font-semibold" />
        </div>
      )}

      {role === ROLES.REQUESTER && (
        <div className="flex items-center gap-6 overflow-x-auto border-t border-gray-100 px-6 py-1.5 no-scrollbar">
          <StatChip dot="bg-green-500" label="System: Online" />
          <StatChip label="My Open PRs:" value="3" />
          <StatChip label="Pending:" value="1" valueClass="text-amber-600 font-semibold" />
        </div>
      )}

      {role === ROLES.SUPPLIER && (
        <div className="flex items-center gap-6 overflow-x-auto border-t border-gray-100 px-6 py-1.5 no-scrollbar">
          <StatChip dot="bg-green-500" label="System: Online" />
          <StatChip label="Available RFQs:" value="4" />
          <StatChip label="Active POs:" value="2" />
        </div>
      )}
    </header>
  );
}

function StatChip({
  dot,
  label,
  value,
  valueClass = "text-gray-800 font-semibold",
}: {
  dot?: string;
  label: string;
  value?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      <span className="text-xs text-gray-400">{label}</span>
      {value && <span className={`text-xs ${valueClass}`}>{value}</span>}
    </div>
  );
}
