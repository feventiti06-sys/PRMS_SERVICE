"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  Save,
  Send,
  FileText,
  Package,
  Building,
  Calendar,
  DollarSign,
  Check,
  Plus,
  Trash2,
  Search
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCreatePurchaseOrder } from "@/features/prms/hooks/use-purchase-orders";
import { BackendPaymentTerms, handleApiError, isApiError } from "@/lib/prms-api";

// Mock data for available quotations (includes backend IDs for PO creation)
const mockQuotations = [
  {
    id: "1",
    quotationNumber: "Q-2024-00145",
    supplierName: "Tech Solutions Ltd.",
    vendorId: 1,
    purchaseRequisitionId: 1,
    rfqNumber: "RFQ-2024-00089",
    totalAmount: 1725000,
    currency: "ETB",
    status: "ACCEPTED",
    items: [
      { id: "1", description: "Microsoft Office 365", quantity: 100, unitPrice: 15000, totalPrice: 1500000 },
      { id: "2", description: "Antivirus Software", quantity: 100, unitPrice: 2250, totalPrice: 225000 }
    ]
  },
  {
    id: "2",
    quotationNumber: "Q-2024-00147",
    supplierName: "Digital Solutions Co.",
    vendorId: 2,
    purchaseRequisitionId: 1,
    rfqNumber: "RFQ-2024-00089",
    totalAmount: 1590000,
    currency: "ETB",
    status: "ACCEPTED",
    items: [
      { id: "1", description: "Microsoft Office 365", quantity: 100, unitPrice: 13000, totalPrice: 1300000 },
      { id: "2", description: "Antivirus Software", quantity: 100, unitPrice: 2900, totalPrice: 290000 }
    ]
  }
];

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const [activeTab, setActiveTab] = useState<"quotation" | "details" | "terms">("quotation");
  const isSubmitting = createPurchaseOrder.isPending;

  const [selectedQuotation, setSelectedQuotation] = useState<string>("");
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    deliveryDate: "",
    deliveryAddress: "INSA Main Campus, Addis Ababa",
    contactPerson: "John Doe",
    contactEmail: "john.doe@insa.edu.et",
    contactPhone: "+251-911-123456",
    paymentTerms: "NET_30",
    paymentTermsDescription: "Payment within 30 days of delivery",
    deliveryTerms: "FOB Destination",
    warrantyTerms: "Minimum 1 year warranty required",
    notes: ""
  });

  const tabs = [
    { id: "quotation", label: "Select Quotation", icon: FileText },
    { id: "details", label: "PO Details", icon: Package },
    { id: "terms", label: "Terms & Conditions", icon: Check },
  ];

  const selectedQuote = mockQuotations.find(q => q.id === selectedQuotation);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const mapPaymentTerms = (terms: string): BackendPaymentTerms => {
    if (terms === "NET_15" || terms === "NET_30" || terms === "NET_60" || terms === "COD") {
      return terms;
    }
    return "NET_30";
  };

  const buildItemDetails = () => {
    if (!selectedQuote) return "";
    return selectedQuote.items
      .map((item) => `${item.description} (${item.quantity} @ ${item.unitPrice})`)
      .join("; ");
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft not saved to backend",
      description: "Select a quotation and use Issue PO to create a purchase order via the backend API.",
    });
  };

  const handleIssuePO = async () => {
    if (!selectedQuote) {
      toast({
        title: "Quotation required",
        description: "Select an accepted quotation before issuing a PO.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.deliveryDate) {
      toast({
        title: "Delivery date required",
        description: "Select an expected delivery date.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPurchaseOrder.mutateAsync({
        purchaseRequisitionId: selectedQuote.purchaseRequisitionId,
        vendorId: selectedQuote.vendorId,
        itemDetails: buildItemDetails(),
        totalAmount: selectedQuote.totalAmount,
        paymentTerms: mapPaymentTerms(formData.paymentTerms),
        expectedDeliveryDate: formData.deliveryDate,
      });
      router.push("/prms/purchase-orders");
    } catch (error) {
      toast({
        title: "Failed to create purchase order",
        description: isApiError(error) ? handleApiError(error) : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Purchase Order</h2>
            <p className="text-gray-400 mt-2">
              Create a purchase order from an accepted quotation
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            className="bg-[#c1121f] hover:bg-[#a00f1a]"
            onClick={handleIssuePO}
            disabled={isSubmitting || !selectedQuotation}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating..." : "Issue PO"}
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#c1121f]/10 text-[#c1121f] border border-[#c1121f]/20' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {selectedQuote && (
          <div className="text-sm text-gray-500">
            Total value: <span className="font-bold text-white ml-1">{formatCurrency(selectedQuote.totalAmount)} {selectedQuote.currency}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Quotation */}
          {activeTab === "quotation" && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Select Quotation</CardTitle>
                <p className="text-sm text-gray-500">
                  Choose an accepted quotation to create a purchase order
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockQuotations.map((quote) => {
                  const isSelected = selectedQuotation === quote.id;
                  return (
                    <div
                      key={quote.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-prms-primary bg-[#c1121f]/10'
                          : 'border-gray-200 hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedQuotation(quote.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-[#c1121f]' : 'bg-gray-800'
                            }`}>
                              <Building className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3">
                                <h4 className={`font-medium ${isSelected ? 'text-[#c1121f]' : 'text-white'}`}>
                                  {quote.quotationNumber}
                                </h4>
                                <Badge className="bg-green-500/20 text-green-400">
                                  {quote.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                {quote.supplierName} • RFQ: {quote.rfqNumber}
                              </p>
                              <div className="flex items-center mt-2 space-x-4">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                                  <span className="text-sm text-white font-medium">
                                    {formatCurrency(quote.totalAmount)} {quote.currency}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 text-gray-500 mr-1" />
                                  <span className="text-sm text-gray-500">
                                    {quote.items.length} items
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#c1121f] flex items-center justify-center">
                            <Check className="h-3 w-3 text-gray-900" />
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-white mb-2">Items:</h5>
                          <div className="space-y-2">
                            {quote.items.map((item, index) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-300">{item.description}</span>
                                <span className="text-gray-900">
                                  {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {mockQuotations.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No accepted quotations</h3>
                    <p className="text-gray-500 mb-4">There are no accepted quotations available for creating purchase orders</p>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                      <a href="/prms/quotations">
                        View Quotations
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* PO Details */}
          {activeTab === "details" && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Purchase Order Details</CardTitle>
                <p className="text-sm text-gray-500">
                  Enter delivery and contact information
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="issueDate" className="text-gray-900">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange("issueDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate" className="text-gray-900">Expected Delivery Date *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deliveryAddress" className="text-gray-900">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    className="mt-2 border-gray-300 text-gray-900 min-h-[100px]"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactPerson" className="text-gray-900">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail" className="text-gray-900">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone" className="text-gray-900">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-900">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special delivery instructions or notes..."
                    className="mt-2 border-gray-300 text-gray-900 min-h-[100px]"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          {activeTab === "terms" && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Terms & Conditions</CardTitle>
                <p className="text-sm text-gray-500">
                  Define payment and delivery terms
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="paymentTerms" className="text-gray-900">Payment Terms *</Label>
                    <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
                      <SelectTrigger className="mt-2 border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="NET_30">Net 30 Days</SelectItem>
                        <SelectItem value="NET_60">Net 60 Days</SelectItem>
                        <SelectItem value="NET_90">Net 90 Days</SelectItem>
                        <SelectItem value="UPON_DELIVERY">Upon Delivery</SelectItem>
                        <SelectItem value="ADVANCE_PARTIAL">50% Advance, 50% on Delivery</SelectItem>
                        <SelectItem value="ADVANCE_FULL">100% Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deliveryTerms" className="text-gray-900">Delivery Terms</Label>
                    <Input
                      id="deliveryTerms"
                      placeholder="e.g., FOB Destination, CIF, etc."
                      className="mt-2 border-gray-300 text-gray-900"
                      value={formData.deliveryTerms}
                      onChange={(e) => handleInputChange("deliveryTerms", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentTermsDescription" className="text-gray-900">Payment Terms Description</Label>
                  <Textarea
                    id="paymentTermsDescription"
                    className="mt-2 border-gray-300 text-gray-900 min-h-[100px]"
                    value={formData.paymentTermsDescription}
                    onChange={(e) => handleInputChange("paymentTermsDescription", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="warrantyTerms" className="text-gray-900">Warranty Terms</Label>
                  <Textarea
                    id="warrantyTerms"
                    className="mt-2 border-gray-300 text-gray-900 min-h-[100px]"
                    value={formData.warrantyTerms}
                    onChange={(e) => handleInputChange("warrantyTerms", e.target.value)}
                  />
                </div>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-white mb-2">Standard Terms</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Late delivery penalties: 0.1% per day of delayed amount</li>
                    <li>• Quality inspection within 7 days of delivery</li>
                    <li>• Return policy for defective items within 30 days</li>
                    <li>• Force majeure clause applicable</li>
                    <li>• Disputes resolved through arbitration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* PO Summary */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">PO Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedQuote ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quotation:</span>
                    <span className="text-white font-medium">{selectedQuote.quotationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supplier:</span>
                    <span className="text-white font-medium">{selectedQuote.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white font-medium">{selectedQuote.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency:</span>
                    <span className="text-white font-medium">{selectedQuote.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issue Date:</span>
                    <span className="text-white font-medium">
                      {formData.issueDate ? new Date(formData.issueDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Date:</span>
                    <span className="text-white font-medium">
                      {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Amount:</span>
                      <span className="text-xl font-bold text-[#c1121f]">
                        {formatCurrency(selectedQuote.totalAmount)} {selectedQuote.currency}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">Select a quotation to see summary</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Status */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Progress Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab.id;
                  const isCompleted = tabs.findIndex(t => t.id === activeTab) > index;
                  return (
                    <div key={tab.id} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-[#c1121f]' 
                          : isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gray-700'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-3 w-3 text-gray-900" />
                        ) : (
                          <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span className={`${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {tab.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h4 className="font-medium text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  className="w-full justify-start bg-[#c1121f] hover:bg-[#a00f1a]"
                  onClick={handleIssuePO}
                  disabled={isSubmitting || !selectedQuotation}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Issue Purchase Order"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel & Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


