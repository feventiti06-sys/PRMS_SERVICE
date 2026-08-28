"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, CheckCircle, TrendingUp, FileText, DollarSign, Package,
  Clock, Award, Star, Download, Save, Send, Eye, ChevronDown, ChevronUp,
  Filter, Search, Trophy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RFQS = [
  { id:"1", number:"RFQ-2024-00089", title:"Annual Software Licenses",   status:"OPEN"             },
  { id:"2", number:"RFQ-2024-00088", title:"Network Equipment Upgrade",  status:"CLOSED"           },
  { id:"3", number:"RFQ-2024-00087", title:"Office Furniture",           status:"UNDER_EVALUATION" },
];

const MOCK_QUOTATIONS = [
  { id:"1", quotationNumber:"Q-2024-00145", supplierName:"Tech Solutions Ltd.",    totalAmount:1725000, currency:"ETB", items:[{id:"1",description:"Microsoft Office 365",quantity:100,unitPrice:15000},{id:"2",description:"Antivirus Software",quantity:100,unitPrice:2250}],   deliveryDays:30, warrantyMonths:24, technicalScore:90, commercialScore:85, status:"EVALUATED" },
  { id:"2", quotationNumber:"Q-2024-00146", supplierName:"Software Pro Inc.",      totalAmount:1890000, currency:"ETB", items:[{id:"1",description:"Microsoft Office 365",quantity:100,unitPrice:16500},{id:"2",description:"Antivirus Software",quantity:100,unitPrice:2400}],  deliveryDays:45, warrantyMonths:12, technicalScore:85, commercialScore:79, status:"EVALUATED" },
  { id:"3", quotationNumber:"Q-2024-00147", supplierName:"Digital Solutions Co.",  totalAmount:1590000, currency:"ETB", items:[{id:"1",description:"Microsoft Office 365",quantity:100,unitPrice:13000},{id:"2",description:"Antivirus Software",quantity:100,unitPrice:2900}],  deliveryDays:21, warrantyMonths:36, technicalScore:95, commercialScore:89, status:"EVALUATED" },
  { id:"4", quotationNumber:"Q-2024-00148", supplierName:"IT Services Ltd.",       totalAmount:1750000, currency:"ETB", items:[{id:"1",description:"Microsoft Office 365",quantity:100,unitPrice:16000},{id:"2",description:"Antivirus Software",quantity:100,unitPrice:1500}],  deliveryDays:60, warrantyMonths:12, technicalScore:80, commercialScore:76, status:"SUBMITTED"  },
];

const CRITERIA = [
  { id:"1", name:"Price Competitiveness",   weight:40, description:"Comparative analysis of quoted prices against market rates" },
  { id:"2", name:"Technical Specifications",weight:25, description:"Compliance with technical requirements and specifications" },
  { id:"3", name:"Delivery Time",           weight:20, description:"Timeliness and reliability of delivery schedule" },
  { id:"4", name:"Warranty & Support",      weight:15, description:"Comprehensiveness of warranty and after-sales support" },
];

const INITIAL_EVAL: Record<string, any> = {
  "1": { criteria: CRITERIA.map((c) => ({ ...c, score: 85 })), comments: "Excellent technical specifications and warranty terms. Price is competitive but not the lowest.", recommendation: "ACCEPT",    overallScore: 87 },
  "2": { criteria: CRITERIA.map((c) => ({ ...c, score: 82 })), comments: "Good overall offer. Technical compliance is adequate but warranty terms are limited.",               recommendation: "NEGOTIATE", overallScore: 82 },
  "3": { criteria: CRITERIA.map((c) => ({ ...c, score: 92 })), comments: "Best overall value. Excellent pricing, comprehensive warranty, and fastest delivery.",               recommendation: "ACCEPT",    overallScore: 92 },
  "4": { criteria: CRITERIA.map((c) => ({ ...c, score: 78 })), comments: "Price is competitive but delivery time is too long. Technical specifications meet minimum requirements.", recommendation: "REJECT", overallScore: 78 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor  = (s: number) => s >= 85 ? "text-green-600 font-bold" : s >= 70 ? "text-amber-600 font-bold" : "text-red-600 font-bold";
const barColor    = (s: number) => s >= 85 ? "bg-green-500" : s >= 70 ? "bg-amber-400" : "bg-red-500";
const recBadge    = (r: string) => r === "ACCEPT" ? "bg-green-100 text-green-700" : r === "NEGOTIATE" ? "bg-amber-100 text-amber-700" : r === "REJECT" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500";

// ─── Component ────────────────────────────────────────────────────────────────

export default function EvaluationPage() {
  const router    = useRouter();
  const { toast } = useToast();

  const [selectedRFQ, setSelectedRFQ]         = useState("RFQ-2024-00089");
  const [search, setSearch]                   = useState("");
  const [expandedId, setExpandedId]           = useState<string | null>("3"); // best quotation open by default
  const [evalData, setEvalData]               = useState<Record<string, any>>(INITIAL_EVAL);
  const [finalRec, setFinalRec]               = useState("AWARD_TO_LEADING");
  const [finalComments, setFinalComments]     = useState("Digital Solutions Co. offers the best overall value with highest technical score (95), competitive pricing, fastest delivery (21 days), and comprehensive 36-month warranty.");

  const filtered = MOCK_QUOTATIONS.filter(
    (q) => q.supplierName.toLowerCase().includes(search.toLowerCase()) || q.quotationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => (evalData[b.id]?.overallScore ?? 0) - (evalData[a.id]?.overallScore ?? 0));

  const handleScoreChange = (qId: string, cId: string, val: number) => {
    setEvalData((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        criteria: prev[qId].criteria.map((c: any) => c.id === cId ? { ...c, score: val } : c),
      },
    }));
  };

  const calcOverall = (qId: string) => {
    const d = evalData[qId];
    if (!d?.criteria) return 0;
    return Math.round(d.criteria.reduce((sum: number, c: any) => sum + (c.score * c.weight) / 100, 0));
  };

  const recalc = () => {
    setEvalData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => { next[id] = { ...next[id], overallScore: calcOverall(id) }; });
      return next;
    });
    toast({ title: "Scores recalculated" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotation Evaluation</h2>
          <p className="text-sm text-gray-500 mt-0.5">Compare and evaluate supplier quotations side by side</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={recalc}>
            <TrendingUp className="h-4 w-4 mr-1.5" />Recalculate
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={() => toast({ title:"Report generated" })}>
            <Download className="h-4 w-4 mr-1.5" />Export Report
          </Button>
          <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white h-9 text-xs" onClick={() => toast({ title:"Evaluation submitted" })}>
            <CheckCircle className="h-4 w-4 mr-1.5" />Submit Evaluation
          </Button>
        </div>
      </div>

      {/* RFQ selector + stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="border border-gray-200 bg-white lg:col-span-3">
          <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-end">
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select RFQ</Label>
              <Select value={selectedRFQ} onValueChange={setSelectedRFQ}>
                <SelectTrigger className="mt-1.5 w-64 border-gray-300 text-gray-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {MOCK_RFQS.map((r) => <SelectItem key={r.id} value={r.number}>{r.number} — {r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <Input placeholder="Search quotations…" className="pl-9 border-gray-300 text-gray-900 placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Quotations</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{filtered.length}</p>
              <p className="text-xs text-gray-400 mt-1">Available for evaluation</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation criteria */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900">Evaluation Criteria</CardTitle>
            <span className="text-xs text-gray-400">Total weight: {CRITERIA.reduce((s, c) => s + c.weight, 0)}%</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CRITERIA.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-800">{c.name}</p>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-[11px]">{c.weight}%</Badge>
              </div>
              <p className="text-xs text-gray-500">{c.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quotation comparison cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Quotation Comparison</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Leading</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> Average</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> Poor</span>
          </div>
        </div>

        {sorted.map((q, idx) => {
          const ev         = evalData[q.id] ?? {};
          const overall    = ev.overallScore ?? 0;
          const isLeading  = idx === 0 && overall >= 80;
          const isOpen     = expandedId === q.id;

          return (
            <Card key={q.id} className={`border bg-white transition-shadow hover:shadow-md ${isLeading ? "border-l-4 border-l-green-500 border-gray-200" : "border-gray-200"}`}>
              <CardContent className="p-0">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLeading ? "bg-green-100" : "bg-gray-100"}`}>
                      {isLeading ? <Trophy className="h-5 w-5 text-green-600" /> : <span className="text-lg font-bold text-gray-400">{idx + 1}</span>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-gray-900 text-sm">{q.quotationNumber}</span>
                        {isLeading && <Badge className="bg-green-100 text-green-700 border-0 text-[11px]"><Award className="h-2.5 w-2.5 mr-1" />Leading</Badge>}
                        {ev.recommendation && <Badge className={`${recBadge(ev.recommendation)} border-0 text-[11px]`}>{ev.recommendation}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">{q.supplierName} · {formatCurrency(q.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Overall Score</p>
                      <p className={`text-2xl ${scoreColor(overall)}`}>{overall}/100</p>
                    </div>
                    {/* Score ring */}
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke={overall >= 85 ? "#22c55e" : overall >= 70 ? "#f59e0b" : "#ef4444"} strokeWidth="3"
                          strokeDasharray={`${(overall / 100) * 94.2} 94.2`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">{overall}</span>
                    </div>
                    <button onClick={() => setExpandedId(isOpen ? null : q.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div className="p-5 space-y-5">
                    {/* Score breakdown bars */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Score Breakdown</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {CRITERIA.map((c) => {
                          const cs = ev.criteria?.find((x: any) => x.id === c.id)?.score ?? 0;
                          return (
                            <div key={c.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-700">{c.name}</p>
                                <Badge className="bg-blue-50 text-blue-600 border-0 text-[11px]">{c.weight}%</Badge>
                              </div>
                              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${barColor(cs)}`} style={{ width: `${cs}%` }} />
                              </div>
                              <div className="flex items-center gap-2">
                                <Input type="number" min={0} max={100}
                                  className="h-7 w-16 border-gray-300 text-center text-xs text-gray-900"
                                  value={cs}
                                  onChange={(e) => handleScoreChange(q.id, c.id, parseInt(e.target.value) || 0)} />
                                <span className="text-xs text-gray-400">/ 100</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Financial summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Financial Summary</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon:DollarSign, label:"Total Amount",   value:formatCurrency(q.totalAmount), color:"text-gray-900" },
                          { icon:Package,    label:"Line Items",      value:`${q.items.length} items`,     color:"text-gray-900" },
                          { icon:Clock,      label:"Delivery",        value:`${q.deliveryDays} days`,      color:"text-gray-900" },
                        ].map(({ icon: Icon, label, value, color }) => (
                          <div key={label} className="rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">{label}</p>
                              <p className={`text-sm font-bold ${color}`}>{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Evaluation Comments</p>
                      <Textarea
                        className="border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] text-sm"
                        placeholder="Enter evaluation comments…"
                        value={ev.comments ?? ""}
                        onChange={(e) => setEvalData((prev) => ({ ...prev, [q.id]: { ...prev[q.id], comments: e.target.value } }))}
                      />
                    </div>

                    {/* Recommendation + actions */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommendation</Label>
                          <Select value={ev.recommendation ?? ""} onValueChange={(v) => setEvalData((prev) => ({ ...prev, [q.id]: { ...prev[q.id], recommendation: v } }))}>
                            <SelectTrigger className="mt-1.5 w-40 border-gray-300 text-gray-800"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              <SelectItem value="ACCEPT">Accept</SelectItem>
                              <SelectItem value="NEGOTIATE">Negotiate</SelectItem>
                              <SelectItem value="REJECT">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 border-gray-300 text-gray-700 self-end" asChild>
                          <a href={`/prms/quotations/${q.id}`}><Eye className="h-3.5 w-3.5 mr-1.5" />View Details</a>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 self-end">
                        <Button variant="outline" size="sm" className="h-9 border-gray-300 text-gray-700" onClick={() => toast({ title:"Saved" })}>
                          <Save className="h-3.5 w-3.5 mr-1.5" />Save
                        </Button>
                        {isLeading && (
                          <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700 text-white" onClick={() => toast({ title:"Quotation awarded", description:"Creating purchase order…" })}>
                            <Award className="h-3.5 w-3.5 mr-1.5" />Award Quotation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {sorted.length === 0 && (
          <Card className="border border-gray-200 bg-white">
            <CardContent className="py-16 text-center">
              <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No quotations found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Final decision */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Final Decision &amp; Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Final Recommendation</Label>
              <Select value={finalRec} onValueChange={setFinalRec}>
                <SelectTrigger className="mt-1.5 border-gray-300 text-gray-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="AWARD_TO_LEADING">Award to Leading Quotation</SelectItem>
                  <SelectItem value="NEGOTIATE_WITH_TOP_TWO">Negotiate with Top Two</SelectItem>
                  <SelectItem value="REJECT_ALL">Reject All &amp; Re-issue RFQ</SelectItem>
                  <SelectItem value="SPLIT_AWARD">Split Award Among Suppliers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Justification</Label>
              <Textarea className="mt-1.5 border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[100px] text-sm" placeholder="Provide justification…" value={finalComments} onChange={(e) => setFinalComments(e.target.value)} />
            </div>
          </div>

          {/* Summary stats */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Evaluation Summary</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(sorted.reduce((s, q) => s + (evalData[q.id]?.overallScore ?? 0), 0) / Math.max(1, sorted.length))}/100</p>
                <p className="text-xs text-gray-400 mt-0.5">Average Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sorted.reduce((s, q) => s + q.totalAmount, 0) / Math.max(1, sorted.length))}</p>
                <p className="text-xs text-gray-400 mt-0.5">Average Price</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sorted.filter((q) => evalData[q.id]?.recommendation === "ACCEPT").length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Recommended for Award</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={() => toast({ title:"Saved" })}><Save className="h-4 w-4 mr-1.5" />Save Draft</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 h-9 text-xs" onClick={() => toast({ title:"Report generated" })}><Download className="h-4 w-4 mr-1.5" />Export Report</Button>
              <Button className="bg-[#c1121f] hover:bg-[#a00f1a] text-white h-9 text-xs" onClick={() => toast({ title:"Submitted for approval" })}><Send className="h-4 w-4 mr-1.5" />Submit for Approval</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
