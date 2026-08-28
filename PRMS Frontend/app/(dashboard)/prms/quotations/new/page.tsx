"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, FileText, DollarSign, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuotationItem {
  id: number;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rfqNumber: "",
    supplierName: "",
    supplierCode: "",
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: "",
    currency: "ETB",
    status: "DRAFT",
    notes: "",
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { id: 1, itemCode: "ITEM-001", description: "", quantity: 1, unit: "PCS", unitPrice: 0, totalPrice: 0 },
  ]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      totalPrice: field === "quantity" || field === "unitPrice" 
        ? (field === "quantity" ? Number(value) : newItems[index].quantity) * 
          (field === "unitPrice" ? Number(value) : newItems[index].unitPrice)
        : newItems[index].totalPrice
    };
    setItems(newItems);
  };

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems([...items, { id: newId, itemCode: "", description: "", quantity: 1, unit: "PCS", unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove",
        description: "Quotation must have at least one item.",
        variant: "destructive",
      });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rfqNumber || !formData.supplierName || !formData.validUntil) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the quotation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Quotation Created",
        description: `Quotation for RFQ ${formData.rfqNumber} has been created successfully.`,
      });
      
      // Redirect to quotations list
      setTimeout(() => {
        router.push("/prms/quotations");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href="/prms/quotations">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Quotation</h2>
            <p className="text-gray-400 mt-2">
              Submit supplier quotation for RFQ evaluation
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quotation Details */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Quotation Details</CardTitle>
            <CardDescription className="text-gray-400">
              Basic quotation information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfqNumber" className="text-gray-300">RFQ Number *</Label>
                <Input
                  id="rfqNumber"
                  value={formData.rfqNumber}
                  onChange={(e) => handleInputChange("rfqNumber", e.target.value)}
                  className="border-gray-300 text-gray-900"
                  placeholder="RFQ-2024-00123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="text-gray-300">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange("supplierName", e.target.value)}
                  className="border-gray-300 text-gray-900"
                  placeholder="Supplier company name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotationDate" className="text-gray-300">Quotation Date</Label>
                <Input
                  id="quotationDate"
                  type="date"
                  value={formData.quotationDate}
                  onChange={(e) => handleInputChange("quotationDate", e.target.value)}
                  className="border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-gray-300">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange("validUntil", e.target.value)}
                  className="border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger className="border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="ETB">ETB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="border-gray-300 text-gray-900 min-h-[100px]"
                placeholder="Additional notes or special conditions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quotation Items */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Quotation Items</CardTitle>
                <CardDescription className="text-gray-400">Line items for this quotation</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No items added</h3>
                <p className="text-gray-500 mb-4">Add items to your quotation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Item Code</Label>
                        <Input
                          value={item.itemCode}
                          onChange={(e) => handleItemChange(index, "itemCode", e.target.value)}
                          className="bg-white border border-gray-200 text-white text-sm"
                          placeholder="ITEM-001"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="bg-white border border-gray-200 text-white text-sm"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                          className="bg-white border border-gray-200 text-white text-sm"
                          min="1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="bg-white border border-gray-200 text-white text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <span className="text-sm text-gray-500">Total: </span>
                        <span className="text-sm font-medium text-red-400">{formData.currency} {item.totalPrice.toLocaleString()}</span>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                <span className="text-gray-400">Total Amount:</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {formData.currency} {totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            asChild
          >
            <a href="/prms/quotations">Cancel</a>
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}


