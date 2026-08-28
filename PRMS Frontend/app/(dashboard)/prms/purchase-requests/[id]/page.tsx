"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Printer, 
  Mail, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShoppingCart,
  MessageSquare,
  Paperclip,
  History,
  Loader2,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { PurchaseRequest, PurchaseRequestStatus, PurchaseRequestPriority } from "@/features/prms/types/purchase-request";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRequisition, useSubmitRequisition } from "@/features/prms/hooks/use-requisitions";

export default function PurchaseRequestDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const requisitionId = params?.id as string | undefined;
  const { data: apiRequisition, isLoading, isError, refetch } = useRequisition(requisitionId);
  const submitRequisition = useSubmitRequisition();

  const DEMO_PURCHASE_REQUEST: PurchaseRequest = {
    id: "1",
    prNumber: "PR-2024-00123",
    title: "Laptop Computers for IT Department",
    description: "Purchase of 15 laptop computers for the IT department to support remote work and new hires.",
    status: "APPROVED",
    priority: "HIGH",
    requesterId: "john.doe@company.com",
    departmentId: "IT",
    costCenterId: "CC-001",
    budgetLineId: "BL-001",
    requiredDate: "2024-04-15",
    estimatedAmount: 1250000,
    approvedAmount: 1250000,
    currency: "ETB",
    justification: "Current laptop inventory is insufficient to support growing remote work requirements and new hires joining in Q2 2024.",
    submittedAt: "2024-03-10T10:30:00Z",
    approvedAt: "2024-03-12T14:45:00Z",
    items: [
      {
        id: "1",
        itemCode: "LAPTOP-001",
        description: "Dell Latitude 5440 Laptop",
        quantity: 10,
        unit: "PCS",
        estimatedUnitPrice: 65000,
        estimatedTotal: 650000,
        requiredDate: "2024-04-15",
        specification: "Intel Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro",
      },
      {
        id: "2",
        itemCode: "LAPTOP-002",
        description: "HP EliteBook 840 G9",
        quantity: 5,
        unit: "PCS",
        estimatedUnitPrice: 75000,
        estimatedTotal: 375000,
        requiredDate: "2024-04-15",
        specification: "Intel Core i7, 32GB RAM, 1TB SSD, Windows 11 Pro",
      },
      {
        id: "3",
        itemCode: "ACC-001",
        description: "Laptop Docking Stations",
        quantity: 15,
        unit: "PCS",
        estimatedUnitPrice: 15000,
        estimatedTotal: 225000,
        requiredDate: "2024-04-15",
        specification: "USB-C Docking Station with dual monitor support",
      },
    ],
    attachments: [
      {
        id: "1",
        name: "IT_Department_Requirement.pdf",
        type: "PDF",
        url: "#",
        uploadedAt: "2024-03-05T14:20:00Z",
        uploadedBy: "John Doe",
      },
      {
        id: "2",
        name: "Vendor_Quotations.pdf",
        type: "PDF",
        url: "#",
        uploadedAt: "2024-03-08T11:30:00Z",
        uploadedBy: "Procurement",
      },
    ],
    createdAt: "2024-03-05T14:20:00Z",
    updatedAt: "2024-03-12T14:45:00Z",
    createdBy: "john.doe",
  };

  const usingLiveData = !!apiRequisition;

  const purchaseRequest: PurchaseRequest = apiRequisition
    ? {
        id: String(apiRequisition.id),
        prNumber: apiRequisition.requisitionNumber,
        title: apiRequisition.purpose,
        description: apiRequisition.itemDetails,
        status: apiRequisition.status as PurchaseRequestStatus,
        priority: "MEDIUM",
        requesterId: apiRequisition.requesterEmployeeId,
        departmentId: apiRequisition.departmentCode,
        costCenterId: "",
        budgetLineId: "",
        requiredDate: apiRequisition.requiredByDate,
        estimatedAmount: apiRequisition.estimatedAmount,
        approvedAmount: apiRequisition.estimatedAmount,
        currency: "ETB",
        justification: apiRequisition.purpose,
        submittedAt: apiRequisition.createdAt,
        items: [],
        attachments: [],
        createdAt: apiRequisition.createdAt,
        updatedAt: apiRequisition.createdAt,
        createdBy: apiRequisition.requesterEmployeeId,
      }
    : DEMO_PURCHASE_REQUEST;

  const getStatusColor = (status: PurchaseRequestStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/20 text-gray-400';
      case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400';
      case 'UNDER_REVIEW': return 'bg-amber-500/20 text-amber-400';
      case 'APPROVED': return 'bg-green-500/20 text-green-400';
      case 'REJECTED': return 'bg-red-500/20 text-red-400';
      case 'CANCELLED': return 'bg-gray-700/20 text-gray-400';
      case 'FULFILLED': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: PurchaseRequestStatus) => {
    switch (status) {
      case 'DRAFT': return <FileText className="h-3 w-3 mr-1" />;
      case 'SUBMITTED': return <ArrowUpRight className="h-3 w-3 mr-1" />;
      case 'UNDER_REVIEW': return <Clock className="h-3 w-3 mr-1" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'REJECTED': return <XCircle className="h-3 w-3 mr-1" />;
      case 'CANCELLED': return <XCircle className="h-3 w-3 mr-1" />;
      case 'FULFILLED': return <CheckCircle className="h-3 w-3 mr-1" />;
      default: return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  const getPriorityColor = (priority: PurchaseRequestPriority) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-500/20 text-gray-400';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400';
      case 'URGENT': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityIcon = (priority: PurchaseRequestPriority) => {
    switch (priority) {
      case 'LOW': return <TrendingDown className="h-3 w-3 mr-1" />;
      case 'MEDIUM': return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'HIGH': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'URGENT': return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return <TrendingUp className="h-3 w-3 mr-1" />;
    }
  };

  const approvalSteps = [
    { step: 1, name: "Submitted", status: "completed", date: "2024-03-10", user: "John Doe" },
    { step: 2, name: "Department Head Review", status: "completed", date: "2024-03-11", user: "Sarah Johnson" },
    { step: 3, name: "Procurement Review", status: "completed", date: "2024-03-12", user: "Michael Chen" },
    { step: 4, name: "Finance Approval", status: "completed", date: "2024-03-12", user: "Alex Rodriguez" },
    { step: 5, name: "Final Approval", status: "completed", date: "2024-03-12", user: "Emma Wilson" },
  ];

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          Fetching requisition from <code className="font-mono text-xs">GET /api/v1/requisitions/{requisitionId}</code>…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            Could not load from backend — showing demo data. A valid JWT in localStorage is required.
          </div>
          <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 h-7 text-xs" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
          </Button>
        </div>
      )}
      {usingLiveData && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
          Live data — {purchaseRequest.prNumber} loaded from backend
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href="/prms/purchase-requests">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{purchaseRequest.title}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <span className="font-mono text-blue-400">{purchaseRequest.prNumber}</span>
                <Badge className={getStatusColor(purchaseRequest.status)}>
                  {getStatusIcon(purchaseRequest.status)}
                  {purchaseRequest.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(purchaseRequest.priority)}>
                  {getPriorityIcon(purchaseRequest.priority)}
                  {purchaseRequest.priority} Priority
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {purchaseRequest.status === 'DRAFT' && (
            <Button className="bg-[#c1121f] hover:bg-[#a00f1a]" asChild>
              <a href={`/prms/purchase-requests/${purchaseRequest.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </a>
            </Button>
          )}
          {purchaseRequest.status === 'APPROVED' && (
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <a href={`/prms/purchase-orders/new?pr=${purchaseRequest.id}`}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Purchase Order
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Estimated Amount</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(purchaseRequest.estimatedAmount || 0)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Number of Items</p>
                <p className="text-2xl font-bold text-white mt-1">{purchaseRequest.items.length}</p>
              </div>
              <FileText className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Processing Time</p>
                <p className="text-2xl font-bold text-white mt-1">2.5 days</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Required By</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatDate(purchaseRequest.requiredDate)}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="details" className="data-[state=active]:bg-[#c1121f]">
            Details
          </TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-[#c1121f]">
            Items
          </TabsTrigger>
          <TabsTrigger value="approval" className="data-[state=active]:bg-[#c1121f]">
            Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="attachments" className="data-[state=active]:bg-[#c1121f]">
            Attachments
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#c1121f]">
            History
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Information */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Request Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Basic details and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Title</p>
                    <p className="text-white mt-1">{purchaseRequest.title}</p>
                  </div>
                  
                  {purchaseRequest.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-400">Description</p>
                      <p className="text-gray-300 mt-1 whitespace-pre-line">{purchaseRequest.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">PR Number</p>
                      <p className="text-sm font-medium text-gray-900">{purchaseRequest.prNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Currency</p>
                      <p className="text-sm font-medium text-gray-900">{purchaseRequest.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(purchaseRequest.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(purchaseRequest.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requester Information */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Requester Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Details about who requested this purchase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{purchaseRequest.requesterId}</p>
                      <p className="text-xs text-gray-500">Requester</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm text-gray-700">IT Department</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost Center</p>
                      <p className="text-sm text-gray-700">CC-001 - IT Infrastructure</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Budget Line</p>
                      <p className="text-sm text-gray-700">BL-001 - Capital Equipment</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm text-gray-700">
                        {purchaseRequest.submittedAt ? formatDate(purchaseRequest.submittedAt) : 'Not submitted'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Financial Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Budget and cost details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Estimated Amount</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {formatCurrency(purchaseRequest.estimatedAmount || 0)}
                      </p>
                    </div>
                    {purchaseRequest.approvedAmount && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-400">Approved Amount</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">
                          {formatCurrency(purchaseRequest.approvedAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-400">Required Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-gray-900">{formatDate(purchaseRequest.requiredDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Justification */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Justification</CardTitle>
                <CardDescription className="text-gray-400">
                  Business case for this purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-300 whitespace-pre-line">{purchaseRequest.justification}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Request Items</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed list of items to be purchased
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Item Code</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Quantity</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Unit</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Unit Price</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Required Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200/50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-blue-400">{item.itemCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.description}</div>
                            {item.specification && (
                              <div className="text-xs text-gray-500 mt-1">{item.specification}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">{item.quantity}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-300">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{formatCurrency(item.estimatedUnitPrice)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900">{formatCurrency(item.estimatedTotal)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-300">{formatDate(item.requiredDate)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={4} className="py-3 px-4 text-right">
                        <span className="text-gray-400 font-medium">Subtotal:</span>
                      </td>
                      <td colSpan={3} className="py-3 px-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(purchaseRequest.items.reduce((sum, item) => sum + item.estimatedTotal, 0))}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right">
                        <span className="text-gray-400 font-medium">Tax (15%):</span>
                      </td>
                      <td colSpan={3} className="py-3 px-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(purchaseRequest.items.reduce((sum, item) => sum + item.estimatedTotal, 0) * 0.15)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right">
                        <span className="text-gray-400 font-medium">Grand Total:</span>
                      </td>
                      <td colSpan={3} className="py-3 px-4">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(purchaseRequest.estimatedAmount || 0)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Workflow Tab */}
        <TabsContent value="approval" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Approval Workflow</CardTitle>
              <CardDescription className="text-gray-400">
                Status and progress of the approval process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Approval Timeline */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                  
                  {/* Approval steps */}
                  <div className="space-y-8 relative z-10">
                    {approvalSteps.map((step, index) => (
                      <div key={step.step} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-500' : 
                            step.status === 'current' ? 'bg-blue-500' : 'bg-gray-700'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-8 w-8 text-gray-900" />
                            ) : step.status === 'current' ? (
                              <Clock className="h-8 w-8 text-gray-900" />
                            ) : (
                              <span className="text-white text-lg font-bold">{step.step}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
                            <span className="text-sm text-gray-400">{step.date}</span>
                          </div>
                          <p className="text-gray-400 mt-1">Approved by: {step.user}</p>
                          {step.status === 'completed' && (
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center p-4">
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-gray-400">Total Steps</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-2xl font-bold text-green-400">5</p>
                    <p className="text-sm text-gray-400">Completed Steps</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-2xl font-bold text-gray-900">2.5 days</p>
                    <p className="text-sm text-gray-400">Processing Time</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Comments & Notes</CardTitle>
              <CardDescription className="text-gray-400">
                Communication and notes from approvers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "Sarah Johnson",
                    role: "Department Head",
                    date: "2024-03-11",
                    comment: "Approved. This aligns with our IT roadmap for Q2.",
                    type: "approval"
                  },
                  {
                    user: "Michael Chen",
                    role: "Procurement Officer",
                    date: "2024-03-12",
                    comment: "Verified vendor quotations and confirmed pricing is within market range.",
                    type: "comment"
                  },
                  {
                    user: "Alex Rodriguez",
                    role: "Finance Manager",
                    date: "2024-03-12",
                    comment: "Budget approved. Funds allocated from Q2 capital budget.",
                    type: "approval"
                  }
                ].map((comment, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-700" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{comment.user}</p>
                          <p className="text-xs text-gray-500">{comment.role}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{comment.date}</span>
                    </div>
                    <div className="mt-3 pl-11">
                      <p className="text-gray-300">{comment.comment}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                          comment.type === 'approval' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {comment.type === 'approval' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <MessageSquare className="h-3 w-3 mr-1" />
                          )}
                          {comment.type === 'approval' ? 'Approval Note' : 'Comment'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Attachments</CardTitle>
              <CardDescription className="text-gray-400">
                Documents and files related to this purchase request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchaseRequest.attachments.map((attachment) => (
                  <div key={attachment.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white truncate">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{attachment.type} • {formatDate(attachment.uploadedAt)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-400">
                      <User className="h-3 w-3 mr-1" />
                      Uploaded by: {attachment.uploadedBy}
                    </div>
                  </div>
                ))}
                
                {/* Upload new attachment */}
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-200 transition-colors text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Paperclip className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">Add Attachment</h3>
                  <p className="text-xs text-gray-500 mb-3">Upload supporting documents</p>
                  <Button variant="outline" size="sm" className="border-gray-200">
                    Browse Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


