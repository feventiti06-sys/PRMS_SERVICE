"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone, Mail, MapPin, Star, Eye, Edit, Plus, Search, SlidersHorizontal,
  Loader2, WifiOff, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVendors } from "@/features/prms/hooks/use-vendors";
import { VendorResponse, BackendPaymentTerms } from "@/lib/prms-api";
import { formatCurrency } from "@/lib/utils";

// ─── Map backend VendorResponse → display Supplier ───────────────────────────

function paymentTermsLabel(pt: BackendPaymentTerms): string {
  const map: Record<BackendPaymentTerms, string> = {
    NET_15: "Net 15", NET_30: "Net 30", NET_60: "Net 60", COD: "COD",
  };
  return map[pt] ?? pt;
}

function vendorToSupplier(v: VendorResponse): Supplier {
  const words = v.name.toUpperCase().split(" ");
  const initials = words.length >= 2 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  const avatarBgs = ["#0a1f44", "#1e50c8", "#374151", "#7c3aed", "#065f46"];
  const avatarBg = avatarBgs[v.id % avatarBgs.length];
  const status: SupplierStatus = v.blacklisted
    ? "Blacklisted"
    : v.performanceScore != null && v.performanceScore >= 4.5
    ? "Preferred"
    : "Active";
  return {
    id: String(v.id),
    initials,
    avatarBg,
    companyName: v.name,
    category: v.vendorType === "GOVERNMENT"
      ? "Government"
      : v.vendorType === "INDIVIDUAL"
      ? "Individual Vendor"
      : "Corporate Supplier",
    status,
    rating: v.performanceScore ?? 3.5,
    phone: v.phone,
    email: v.email,
    address: v.address,
    tin: `TIN: ${v.taxIdentificationNumber}`,
    orders: 0,
    totalValue: "—",
    paymentTerms: paymentTermsLabel(v.paymentTerms),
  };
}

type SupplierStatus = "Preferred" | "Active" | "Probation" | "Inactive" | "Blacklisted";

interface Supplier {
  id: string;
  initials: string;
  avatarBg: string;
  companyName: string;
  category: string;
  status: SupplierStatus;
  rating: number;
  phone: string;
  email: string;
  address: string;
  tin: string;
  orders: number;
  totalValue: string;
  paymentTerms: string;
}

const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: "1", initials: "ET", avatarBg: "#0a1f44",
    companyName: "Ethio Tech Solutions", category: "IT & Electronics", status: "Preferred",
    rating: 4.8, phone: "+251 911 111 222", email: "kebede@ethiotech.et",
    address: "Addis Ababa", tin: "TIN: 0014-578-200",
    orders: 24, totalValue: "ETB 2.8M", paymentTerms: "Net 30",
  },
  {
    id: "2", initials: "AD", avatarBg: "#1e50c8",
    companyName: "Addis Trading PLC", category: "General Supplies", status: "Active",
    rating: 4.2, phone: "+251 911 222 333", email: "marta@addistrading.et",
    address: "Addis Ababa", tin: "TIN: 0014-889-401",
    orders: 38, totalValue: "ETB 1.9M", paymentTerms: "Net 15",
  },
  {
    id: "3", initials: "NA", avatarBg: "#374151",
    companyName: "National Supply Corp.", category: "Industrial Equipment", status: "Active",
    rating: 3.9, phone: "+251 911 333 444", email: "tesfaye@natsupply.et",
    address: "Adama", tin: "TIN: 0016-220-155",
    orders: 16, totalValue: "ETB 3.1M", paymentTerms: "Net 45",
  },
  {
    id: "4", initials: "OF", avatarBg: "#0a1f44",
    companyName: "Office Max Ethiopia", category: "Office Supplies", status: "Preferred",
    rating: 4.5, phone: "+251 911 444 555", email: "almaz@officemax.et",
    address: "Addis Ababa", tin: "TIN: 0014-331-720",
    orders: 52, totalValue: "ETB 1.0M", paymentTerms: "Net 30",
  },
  {
    id: "5", initials: "ME", avatarBg: "#1e50c8",
    companyName: "Meseret Fuel Depot", category: "Fuel & Energy", status: "Active",
    rating: 4.1, phone: "+251 911 555 666", email: "girma@meseretfuel.et",
    address: "Addis Ababa", tin: "TIN: 0014-770-990",
    orders: 60, totalValue: "ETB 4.2M", paymentTerms: "Net 15",
  },
  {
    id: "6", initials: "TL", avatarBg: "#374151",
    companyName: "Tigray Logistics Ltd", category: "Transport & Logistics", status: "Probation",
    rating: 3.7, phone: "+251 914 666 777", email: "alem@tigraylogistics.et",
    address: "Mekele", tin: "TIN: 0018-004-321",
    orders: 8, totalValue: "ETB 0.6M", paymentTerms: "Net 30",
  },
  {
    id: "7", initials: "HT", avatarBg: "#7c3aed",
    companyName: "Habesha Tech Import", category: "IT & Electronics", status: "Active",
    rating: 4.3, phone: "+251 911 777 888", email: "selamawit@habeshatech.et",
    address: "Addis Ababa", tin: "TIN: 0014-995-112",
    orders: 19, totalValue: "ETB 1.5M", paymentTerms: "Net 30",
  },
  {
    id: "8", initials: "BM", avatarBg: "#0a1f44",
    companyName: "Blue Nile Medical", category: "General Supplies", status: "Active",
    rating: 4.0, phone: "+251 911 888 999", email: "dawit@bluenilemedical.et",
    address: "Hawassa", tin: "TIN: 0020-112-445",
    orders: 11, totalValue: "ETB 0.9M", paymentTerms: "Net 45",
  },
  {
    id: "9", initials: "AC", avatarBg: "#1e50c8",
    companyName: "Axum Construction", category: "Industrial Equipment", status: "Preferred",
    rating: 4.6, phone: "+251 914 999 000", email: "hiwot@axumconstruct.et",
    address: "Axum", tin: "TIN: 0019-234-789",
    orders: 33, totalValue: "ETB 5.4M", paymentTerms: "Net 60",
  },
];

const CATEGORIES = ["All", "IT & Electronics", "General Supplies", "Industrial Equipment", "Office Supplies", "Fuel & Energy", "Transport & Logistics"];

const STATUS_STYLES: Record<SupplierStatus, string> = {
  Preferred:   "text-[#1e50c8] font-semibold",
  Active:      "text-green-600 font-semibold",
  Probation:   "text-amber-600 font-semibold",
  Inactive:    "text-gray-400 font-semibold",
  Blacklisted: "text-red-600 font-semibold",
};

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full  }).map((_, i) => <Star key={`f${i}`} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
      {half && (
        <span className="relative inline-block h-3.5 w-3.5">
          <Star className="absolute h-3.5 w-3.5 text-gray-200 fill-gray-200" />
          <span className="absolute inset-0 w-1/2 overflow-hidden"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /></span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="h-3.5 w-3.5 text-gray-200 fill-gray-200" />)}
      <span className="ml-1 text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Workflow strip ───────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { num: 1, label: "Purchase Request", sub: "Dept. submits PR",       done: true,    active: false },
  { num: 2, label: "HOD Approval",     sub: "Head reviews",           done: true,    active: false },
  { num: 3, label: "Finance Review",   sub: "Budget check",           done: true,    active: false },
  { num: 4, label: "RFQ & Quotation",  sub: "Competitive sourcing",   done: false,   active: true  },
  { num: 5, label: "Purchase Order",   sub: "PO to supplier",         done: false,   active: false },
  { num: 6, label: "Goods Receipt",    sub: "Receive & inspect",      done: false,   active: false },
  { num: 7, label: "Invoice & Pay",    sub: "FMS process",            done: false,   active: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const { toast } = useToast();
  const [search, setSearch]           = useState("");
  const [activeCategory, setCategory] = useState("All");

  // ── Real API ──────────────────────────────────────────────────────────────
  const { data: apiVendors, isLoading: apiLoading, isError: apiError, refetch } = useVendors();

  // When the API returns data, map it to the display shape.
  // When no token / 401 / network error, fall back to DEMO_SUPPLIERS.
  const displaySuppliers: Supplier[] = apiVendors && apiVendors.length > 0
    ? apiVendors.map(vendorToSupplier)
    : DEMO_SUPPLIERS;

  const usingLiveData = !!(apiVendors && apiVendors.length > 0);

  const filtered = displaySuppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch   = !search || s.companyName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    const matchCategory = activeCategory === "All" || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const stats = {
    total:     displaySuppliers.length,
    preferred: displaySuppliers.filter((s) => s.status === "Preferred").length,
    active:    displaySuppliers.filter((s) => s.status === "Active").length,
    totalSpend: usingLiveData ? `${displaySuppliers.length} vendors` : "ETB 13.7M",
  };

  return (
    <div className="space-y-5">
      {/* API connection status banner */}
      {apiLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          Connecting to backend — fetching vendors from <code className="font-mono text-xs">GET /api/v1/vendors</code>…
        </div>
      )}
      {apiError && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <span>
              Could not reach the backend. Showing demo data.
              {" "}A valid Keycloak JWT in <code className="font-mono text-xs">localStorage["access_token"]</code> is required.
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}
      {usingLiveData && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
          Showing live data from backend — {displaySuppliers.length} vendor{displaySuppliers.length !== 1 ? "s" : ""} loaded from <code className="font-mono text-xs">GET /api/v1/vendors</code>
        </div>
      )}
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label:"Total Suppliers", value:stats.total,     color:"text-[#0a1f44]",   border:"border-l-[#0a1f44]" },
          { label:"Preferred",       value:stats.preferred, color:"text-[#1e50c8]",   border:"border-l-[#1e50c8]" },
          { label:"Active",          value:stats.active,    color:"text-green-600",   border:"border-l-green-500" },
          { label:"Total Spend",     value:stats.totalSpend,color:"text-[#0a1f44]",   border:"border-l-amber-400" },
        ].map(({ label, value, color, border }) => (
          <Card key={label} className={`border border-gray-200 border-l-4 ${border} bg-white`}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* End-to-end workflow */}
      <Card className="border border-gray-200 bg-[#0a1f44]">
        <CardContent className="p-4">
          <p className="text-xs font-bold tracking-widest text-white/60 uppercase mb-4">End-to-End Procurement Workflow</p>
          <div className="flex items-start gap-0 overflow-x-auto no-scrollbar">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center text-center w-28">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold mb-2 border-2 ${
                    step.done   ? "border-green-400 bg-green-500 text-white" :
                    step.active ? "border-amber-400 bg-amber-500 text-white" :
                                  "border-white/20 bg-white/10 text-white/50"
                  }`}>
                    {step.done ? "✓" : step.num}
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${step.done || step.active ? "text-white" : "text-white/40"}`}>{step.label}</p>
                  <p className={`text-[10px] mt-0.5 ${step.done || step.active ? "text-white/60" : "text-white/25"}`}>{step.sub}</p>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 flex-shrink-0 mb-6 ${step.done ? "bg-green-400" : "bg-white/15"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search + category tabs + register button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <Input
            placeholder="Search suppliers…"
            className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-gray-400 mr-1" />
        </div>
      </div>

      {/* Category pill tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-[#0a1f44] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
        <Button className="ml-auto bg-[#1e50c8] hover:bg-[#1a44b0] text-white rounded-full text-xs h-8 px-4">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Register Supplier
        </Button>
      </div>

      {/* Supplier grid — card layout matching screenshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.id} className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              {/* Top row: avatar + name + status */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: s.avatarBg }}
                >
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">{s.companyName}</p>
                    <span className={`text-xs ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{s.category}</p>
                </div>
              </div>

              {/* Star rating */}
              <div className="mb-3">
                <StarRating rating={s.rating} />
              </div>

              {/* Contact details */}
              <div className="space-y-1.5 mb-4">
                <p className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {s.phone}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-600 truncate">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {s.email}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {s.address} · {s.tin}
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-4">
                <div className="text-center">
                  <p className="text-base font-bold text-[#1e50c8]">{s.orders}</p>
                  <p className="text-[10px] text-gray-400">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-[#1e50c8]">{s.totalValue}</p>
                  <p className="text-[10px] text-gray-400">Total Value</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-green-600">{s.paymentTerms}</p>
                  <p className="text-[10px] text-gray-400">Payment</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs"
                  onClick={() => toast({ title: `Viewing ${s.companyName}` })}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs"
                  onClick={() => toast({ title: `Editing ${s.companyName}` })}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
            No suppliers match your search.
          </div>
        )}
      </div>
    </div>
  );
}
