"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone, Mail, MapPin, Star, Eye, Plus, Search,
  Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { useVendors } from "@/features/prms/hooks/use-vendors";
import type { VendorResponse, BackendPaymentTerms } from "@/lib/prms-api";

function paymentTermsLabel(pt: BackendPaymentTerms): string {
  return { NET_15: "Net 15", NET_30: "Net 30", NET_60: "Net 60", COD: "COD" }[pt] ?? pt;
}

function initials(name: string): string {
  const w = name.toUpperCase().split(" ");
  return w.length >= 2 ? w[0][0] + w[1][0] : w[0].slice(0, 2);
}

const AVATAR_BG = ["#0a1f44", "#1e50c8", "#374151", "#7c3aed", "#065f46"];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const empty = 5 - Math.ceil(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
      {rating % 1 >= 0.5 && (
        <span className="relative inline-block h-3.5 w-3.5">
          <Star className="absolute h-3.5 w-3.5 fill-gray-200 text-gray-200" />
          <span className="absolute inset-0 w-1/2 overflow-hidden">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="h-3.5 w-3.5 fill-gray-200 text-gray-200" />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
    </div>
  );
}

function statusLabel(v: VendorResponse): string {
  if (v.blacklisted) return "Blacklisted";
  if (v.performanceScore != null && v.performanceScore >= 4.5) return "Preferred";
  return "Active";
}

const STATUS_STYLES: Record<string, string> = {
  Preferred: "text-[#1e50c8] font-semibold",
  Active: "text-green-600 font-semibold",
  Blacklisted: "text-red-600 font-semibold",
};

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const { data: vendors, isLoading, isError, error, refetch } = useVendors();

  const filtered = (vendors ?? []).filter((v) => {
    const q = search.toLowerCase();
    return (
      !search ||
      v.name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.vendorType.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: vendors?.length ?? 0,
    preferred: vendors?.filter((v) => v.performanceScore != null && v.performanceScore >= 4.5 && !v.blacklisted).length ?? 0,
    active: vendors?.filter((v) => !v.blacklisted).length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#c1121f]" />
        <span className="ml-2 text-gray-500">Loading suppliers…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-gray-600">
          {error instanceof Error ? error.message : "Failed to load suppliers."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          <p className="mt-0.5 text-sm text-gray-500">Registered vendors — live data from PostgreSQL</p>
        </div>
        <Button className="bg-[#1e50c8] hover:bg-[#1a44b0] text-white" asChild>
          <Link href="/prms/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />Register Supplier
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Suppliers", value: stats.total, border: "border-l-[#0a1f44]", color: "text-[#0a1f44]" },
          { label: "Preferred", value: stats.preferred, border: "border-l-[#1e50c8]", color: "text-[#1e50c8]" },
          { label: "Active", value: stats.active, border: "border-l-green-500", color: "text-green-600" },
        ].map(({ label, value, border, color }) => (
          <Card key={label} className={`border border-gray-200 border-l-4 ${border} bg-white`}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <Input
          placeholder="Search suppliers…"
          className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="py-16 text-center text-gray-400">
          {vendors?.length === 0
            ? "No suppliers registered yet. Click 'Register Supplier' to add the first one."
            : "No suppliers match your search."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((v) => {
          const bg = AVATAR_BG[v.id % AVATAR_BG.length];
          const status = statusLabel(v);
          const score = v.performanceScore ?? 3.5;
          return (
            <Card key={v.id} className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                    style={{ background: bg }}
                  >
                    {initials(v.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm truncate">{v.name}</p>
                      <span className={`text-xs ${STATUS_STYLES[status] ?? "text-gray-500"}`}>{status}</span>
                    </div>
                    <p className="text-xs text-gray-400 capitalize">{v.vendorType.toLowerCase().replace("_", " ")}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating rating={score} />
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />{v.phone}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-gray-600 truncate">
                    <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />{v.email}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {v.address} · TIN: {v.taxIdentificationNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-gray-100 mb-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#1e50c8]">{v.vendorCode}</p>
                    <p className="text-[10px] text-gray-400">Vendor Code</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-green-600">{paymentTermsLabel(v.paymentTerms)}</p>
                    <p className="text-[10px] text-gray-400">Payment</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full h-8 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs" asChild>
                  <Link href={`/prms/suppliers/${v.id}`}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
