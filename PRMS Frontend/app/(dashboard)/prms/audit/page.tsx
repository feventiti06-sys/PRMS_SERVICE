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
  Search, Download, Activity, Calendar, Clock, User,
  Plus, Edit, Trash2, CheckCircle, XCircle, Eye, Upload, RefreshCw,
  Building, FileText, Package, CreditCard, Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuditLogSummary, AuditAction, AuditEntity } from "@/features/prms/types/reports";
import { formatDate } from "@/lib/utils";

const LOGS: AuditLogSummary[] = [
  { id:"1",  userName:"Abebe Girma",     action:"CREATE",   entity:"PURCHASE_REQUEST", entityName:"PR-2024-00456", description:"Created new purchase request for office supplies",            timestamp:"2024-03-22T14:30:00Z" },
  { id:"2",  userName:"Tigist Bekele",   action:"APPROVE",  entity:"PURCHASE_REQUEST", entityName:"PR-2024-00455", description:"Approved purchase request after budget verification",          timestamp:"2024-03-22T14:15:00Z" },
  { id:"3",  userName:"Yonas Haile",     action:"UPDATE",   entity:"SUPPLIER",         entityName:"Ethio Tech Solutions", description:"Updated supplier contact information and payment terms",timestamp:"2024-03-22T13:45:00Z" },
  { id:"4",  userName:"Mekdes Tadesse",  action:"CREATE",   entity:"RFQ",              entityName:"RFQ-2024-00090", description:"Created RFQ for laboratory equipment procurement",            timestamp:"2024-03-22T13:20:00Z" },
  { id:"5",  userName:"Dawit Alemu",     action:"SUBMIT",   entity:"QUOTATION",        entityName:"Q-2024-00153",   description:"Submitted quotation evaluation with recommendation",          timestamp:"2024-03-22T12:50:00Z" },
  { id:"6",  userName:"Hiwot Mengistu",  action:"CREATE",   entity:"PURCHASE_ORDER",   entityName:"PO-2024-00353",  description:"Generated purchase order from accepted quotation",            timestamp:"2024-03-22T12:30:00Z" },
  { id:"7",  userName:"Selamawit Tesfaye",action:"UPDATE",  entity:"GOODS_RECEIPT",    entityName:"GRN-2024-00129", description:"Updated goods receipt with quality inspection results",       timestamp:"2024-03-22T11:45:00Z" },
  { id:"8",  userName:"Biruk Assefa",    action:"APPROVE",  entity:"INVOICE",          entityName:"INV-2024-00105", description:"Approved invoice after verification with delivery records",   timestamp:"2024-03-22T11:20:00Z" },
  { id:"9",  userName:"Abebe Girma",     action:"DOWNLOAD", entity:"REPORT",           entityName:"Monthly Spend Analysis", description:"Downloaded procurement spend analysis report",       timestamp:"2024-03-22T10:55:00Z" },
  { id:"10", userName:"Tigist Bekele",   action:"DELETE",   entity:"PURCHASE_REQUEST", entityName:"PR-2024-00454", description:"Deleted draft purchase request — duplicate entry",             timestamp:"2024-03-22T10:30:00Z" },
  { id:"11", userName:"Yonas Haile",     action:"REJECT",   entity:"QUOTATION",        entityName:"Q-2024-00152",   description:"Rejected quotation due to non-compliance with specifications",timestamp:"2024-03-22T10:15:00Z" },
  { id:"12", userName:"Mekdes Tadesse",  action:"VIEW",     entity:"SUPPLIER",         entityName:"Office Max Ethiopia", description:"Viewed supplier performance dashboard and metrics",     timestamp:"2024-03-22T09:45:00Z" },
];

const ACTION_STYLE: Record<AuditAction, string> = {
  CREATE:   "bg-green-100 text-green-700",
  UPDATE:   "bg-blue-100 text-blue-700",
  DELETE:   "bg-red-100 text-red-700",
  APPROVE:  "bg-green-100 text-green-700",
  REJECT:   "bg-red-100 text-red-700",
  SUBMIT:   "bg-purple-100 text-purple-700",
  CANCEL:   "bg-orange-100 text-orange-700",
  VIEW:     "bg-gray-100 text-gray-600",
  DOWNLOAD: "bg-indigo-100 text-indigo-700",
  EXPORT:   "bg-indigo-100 text-indigo-700",
};

const ACTION_ICON: Record<AuditAction, React.ComponentType<{ className?: string }>> = {
  CREATE:   Plus, UPDATE:   Edit, DELETE:   Trash2, APPROVE:  CheckCircle,
  REJECT:   XCircle, SUBMIT: Upload, CANCEL: XCircle, VIEW: Eye, DOWNLOAD: Download, EXPORT: Download,
};

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [search, setSearch]               = useState("");
  const [actionFilter, setActionFilter]   = useState("all");
  const [entityFilter, setEntityFilter]   = useState("all");

  const filtered = LOGS.filter((l) => {
    const q = search.toLowerCase();
    return (!search || l.userName.toLowerCase().includes(q) || l.entityName?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)) &&
           (actionFilter === "all" || l.action === actionFilter) &&
           (entityFilter === "all" || l.entity === entityFilter);
  });

  const stats = {
    today:  LOGS.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    week:   LOGS.filter((l) => new Date(l.timestamp) >= new Date(Date.now() - 7 * 86400000)).length,
    month:  LOGS.filter((l) => new Date(l.timestamp) >= new Date(Date.now() - 30 * 86400000)).length,
    users:  new Set(LOGS.map((l) => l.userName)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all system activities and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => toast({ title:"Refreshed" })}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => toast({ title:"Export started" })}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label:"Today's Activity", value:stats.today, bg:"bg-green-500", icon:Activity  },
          { label:"This Week",        value:stats.week,  bg:"bg-blue-500",  icon:Calendar  },
          { label:"This Month",       value:stats.month, bg:"bg-purple-500",icon:Clock     },
          { label:"Active Users",     value:stats.users, bg:"bg-amber-500", icon:User      },
        ].map(({ label, value, bg, icon: Icon }) => (
          <Card key={label} className="border border-gray-200 bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p></div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}><Icon className="h-5 w-5 text-white" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search by user, entity, or description…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-36 border-gray-300 text-gray-800"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {["all","CREATE","UPDATE","DELETE","APPROVE","REJECT","VIEW","DOWNLOAD"].map((v) => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Actions" : v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-44 border-gray-300 text-gray-800"><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {["all","SUPPLIER","PURCHASE_REQUEST","RFQ","QUOTATION","PURCHASE_ORDER","GOODS_RECEIPT","INVOICE","REPORT"].map((v) => (
                  <SelectItem key={v} value={v}>{v === "all" ? "All Entities" : v.replace(/_/g," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Activity Log ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {filtered.map((log) => {
              const Icon = ACTION_ICON[log.action] ?? Activity;
              const style = ACTION_STYLE[log.action] ?? "bg-gray-100 text-gray-600";
              const initials = log.userName.split(" ").map((n) => n[0]).join("").toUpperCase();
              return (
                <div key={log.id} className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  {/* User avatar */}
                  <div className="h-8 w-8 rounded-full bg-[#0a1f44] flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{log.userName}</p>
                      <Badge className={`${style} border-0 text-[11px] font-semibold flex items-center gap-1`}>
                        <Icon className="h-2.5 w-2.5" />{log.action}
                      </Badge>
                      <span className="text-xs text-gray-500 font-mono">{log.entityName}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{formatDate(log.timestamp)}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-16 text-center text-gray-400">No audit logs found</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
