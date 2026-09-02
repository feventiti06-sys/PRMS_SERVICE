import { apiClient, ApiError, handleApiError, isApiError } from '@/lib/api';

export type BackendPRStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PO_CREATED';
export type BackendPOStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type BackendPaymentTerms = 'NET_15' | 'NET_30' | 'NET_60' | 'COD';
export type BackendVendorType = 'INDIVIDUAL' | 'CORPORATE' | 'GOVERNMENT';
export type BackendApprovalAction = 'APPROVE' | 'REJECT' | 'RETURN';

export interface VendorResponse {
  id: number;
  vendorCode: string;
  name: string;
  vendorType: BackendVendorType;
  taxIdentificationNumber: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: BackendPaymentTerms;
  blacklisted: boolean;
  performanceScore: number | null;
}

export interface RequisitionResponse {
  id: number;
  requisitionNumber: string;
  requesterEmployeeId: string;
  departmentCode: string;
  purpose: string;
  itemDetails: string;
  estimatedAmount: number;
  status: BackendPRStatus;
  requiredByDate: string;
  approvalWorkflowId: number | null;
  createdAt: string;
}

export interface PurchaseOrderResponse {
  id: number;
  purchaseOrderNumber: string;
  purchaseRequisitionId: number;
  vendorId: number;
  vendorName: string;
  itemDetails: string;
  totalAmount: number;
  paymentTerms: BackendPaymentTerms;
  status: BackendPOStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  expiryDate: string | null;
  createdAt?: string;
}

export interface RFQResponse {
  id: number;
  rfqNumber: string;
  title: string;
  itemDetails: string;
  submissionDeadline: string;
  active: boolean;
  purchaseRequisitionId: number;
  requisitionNumber: string | null;
  createdAt: string;
}

export interface GoodsReceiptResponse {
  id: number;
  receiptNumber: string;
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  vendorName: string;
  receiptDate: string;
  receivedByEmployeeId: string;
  receiptDetails: string;
  inspectionNotes: string | null;
  accepted: boolean;
  createdAt: string;
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  vendorId: number;
  vendorName: string;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate: string;
  processingStatus: string;
  itemDetails: string | null;
  financeReference: string | null;
  createdAt: string;
}

export interface ContractResponse {
  id: number;
  contractNumber: string;
  vendorId: number;
  vendorName: string;
  purchaseOrderId: number | null;
  purchaseOrderNumber: string | null;
  contractValue: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  active: boolean;
  createdAt: string;
}

export interface QuotationResponse {
  id: number;
  quotationNumber: string;
  rfqId: number;
  rfqNumber: string;
  vendorId: number;
  vendorName: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  selected: boolean;
  createdAt: string;
}

export interface DashboardStatsResponse {
  totalRequisitions: number;
  pendingApprovals: number;
  activeVendors: number;
  openRfqs: number;
  totalPurchaseOrders: number;
  pendingGoodsReceipts: number;
  pendingInvoices: number;
  totalPurchaseOrderValue: number;
  pendingInvoiceValue: number;
}

export interface VendorCreateRequest {
  name: string;
  vendorType: BackendVendorType;
  taxIdentificationNumber: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: BackendPaymentTerms;
}

export interface RequisitionCreateRequest {
  requesterEmployeeId: string;
  departmentCode: string;
  purpose: string;
  itemDetails: string;
  estimatedAmount: number;
  requiredByDate: string;
}

export interface RequisitionApproveRequest {
  action: BackendApprovalAction;
  comments?: string;
}

export interface RFQCreateRequest {
  purchaseRequisitionId: number;
  title: string;
  itemDetails: string;
  submissionDeadline: string;
}

export interface PurchaseOrderCreateRequest {
  purchaseRequisitionId: number;
  vendorId: number;
  itemDetails: string;
  totalAmount: number;
  paymentTerms: BackendPaymentTerms;
  expectedDeliveryDate: string;
  expiryDate?: string;
}

export interface GoodsReceiptRequest {
  purchaseOrderId: number;
  receiptDate: string;
  receivedByEmployeeId: string;
  receiptDetails: string;
  inspectionNotes?: string;
  accepted: boolean;
}

export interface InvoiceRequest {
  invoiceNumber: string;
  purchaseOrderId: number;
  vendorId: number;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate: string;
  itemDetails?: string;
}

export interface ContractCreateRequest {
  vendorId: number;
  purchaseOrderId: number;
  contractValue: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
}

export interface QuotationCreateRequest {
  rfqId: number;
  vendorId: number;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
}

export const vendorApi = {
  list: (): Promise<VendorResponse[]> =>
    apiClient.get<VendorResponse[]>('/vendors').then((r) => r.data),
  getById: (id: number | string): Promise<VendorResponse> =>
    apiClient.get<VendorResponse>(`/vendors/${id}`).then((r) => r.data),
  create: (body: VendorCreateRequest): Promise<VendorResponse> =>
    apiClient.post<VendorResponse>('/vendors', body).then((r) => r.data),
};

export const requisitionApi = {
  listByRequester: (requesterEmployeeId: string): Promise<RequisitionResponse[]> =>
    apiClient.get<RequisitionResponse[]>('/requisitions', { requesterEmployeeId }).then((r) => r.data),
  getById: (id: number | string): Promise<RequisitionResponse> =>
    apiClient.get<RequisitionResponse>(`/requisitions/${id}`).then((r) => r.data),
  create: (body: RequisitionCreateRequest): Promise<RequisitionResponse> =>
    apiClient.post<RequisitionResponse>('/requisitions', body).then((r) => r.data),
  submit: (id: number | string): Promise<RequisitionResponse> =>
    apiClient.post<RequisitionResponse>(`/requisitions/${id}/submit`).then((r) => r.data),
};

export const approvalApi = {
  listPending: (): Promise<RequisitionResponse[]> =>
    apiClient.get<RequisitionResponse[]>('/approvals/pending').then((r) => r.data),
  decideOnRequisition: (
    requisitionId: number | string,
    body: RequisitionApproveRequest
  ): Promise<RequisitionResponse> =>
    apiClient.post<RequisitionResponse>(`/approvals/requisitions/${requisitionId}`, body).then((r) => r.data),
};

export const rfqApi = {
  list: (): Promise<RFQResponse[]> =>
    apiClient.get<RFQResponse[]>('/rfqs').then((r) => r.data),
  getById: (id: number | string): Promise<RFQResponse> =>
    apiClient.get<RFQResponse>(`/rfqs/${id}`).then((r) => r.data),
  create: (body: RFQCreateRequest): Promise<RFQResponse> =>
    apiClient.post<RFQResponse>('/rfqs', body).then((r) => r.data),
};

export const purchaseOrderApi = {
  list: (): Promise<PurchaseOrderResponse[]> =>
    apiClient.get<PurchaseOrderResponse[]>('/purchase-orders').then((r) => r.data),
  getById: (id: number | string): Promise<PurchaseOrderResponse> =>
    apiClient.get<PurchaseOrderResponse>(`/purchase-orders/${id}`).then((r) => r.data),
  create: (body: PurchaseOrderCreateRequest): Promise<PurchaseOrderResponse> =>
    apiClient.post<PurchaseOrderResponse>('/purchase-orders', body).then((r) => r.data),
};

export const goodsReceiptApi = {
  list: (): Promise<GoodsReceiptResponse[]> =>
    apiClient.get<GoodsReceiptResponse[]>('/goods-receipts').then((r) => r.data),
  getById: (id: number | string): Promise<GoodsReceiptResponse> =>
    apiClient.get<GoodsReceiptResponse>(`/goods-receipts/${id}`).then((r) => r.data),
  create: (body: GoodsReceiptRequest): Promise<GoodsReceiptResponse> =>
    apiClient.post<GoodsReceiptResponse>('/goods-receipts', body).then((r) => r.data),
};

export const invoiceApi = {
  list: (): Promise<InvoiceResponse[]> =>
    apiClient.get<InvoiceResponse[]>('/invoices').then((r) => r.data),
  getById: (id: number | string): Promise<InvoiceResponse> =>
    apiClient.get<InvoiceResponse>(`/invoices/${id}`).then((r) => r.data),
  submit: (body: InvoiceRequest): Promise<InvoiceResponse> =>
    apiClient.post<InvoiceResponse>('/invoices', body).then((r) => r.data),
};

export const contractApi = {
  list: (): Promise<ContractResponse[]> =>
    apiClient.get<ContractResponse[]>('/contracts').then((r) => r.data),
  getById: (id: number | string): Promise<ContractResponse> =>
    apiClient.get<ContractResponse>(`/contracts/${id}`).then((r) => r.data),
  create: (body: ContractCreateRequest): Promise<ContractResponse> =>
    apiClient.post<ContractResponse>('/contracts', body).then((r) => r.data),
};

export const quotationApi = {
  list: (rfqId?: number | string): Promise<QuotationResponse[]> =>
    rfqId
      ? apiClient.get<QuotationResponse[]>(`/quotations?rfqId=${rfqId}`).then((r) => r.data)
      : apiClient.get<QuotationResponse[]>('/quotations').then((r) => r.data),
  getById: (id: number | string): Promise<QuotationResponse> =>
    apiClient.get<QuotationResponse>(`/quotations/${id}`).then((r) => r.data),
  create: (body: QuotationCreateRequest): Promise<QuotationResponse> =>
    apiClient.post<QuotationResponse>('/quotations', body).then((r) => r.data),
  select: (id: number | string): Promise<QuotationResponse> =>
    apiClient.post<QuotationResponse>(`/quotations/${id}/select`).then((r) => r.data),
};

export const dashboardApi = {
  getStats: (): Promise<DashboardStatsResponse> =>
    apiClient.get<DashboardStatsResponse>('/dashboard/stats').then((r) => r.data),
};

export function prStatusLabel(status: BackendPRStatus): string {
  const map: Record<BackendPRStatus, string> = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PO_CREATED: 'PO Created',
  };
  return map[status] ?? status;
}

export function prStatusBadge(status: BackendPRStatus): string {
  const map: Record<BackendPRStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PO_CREATED: 'bg-blue-100 text-blue-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function poStatusBadge(status: BackendPOStatus): string {
  const map: Record<BackendPOStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SENT: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export { handleApiError, isApiError };
export type { ApiError };

export interface EmployeeResponse {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentCode: string;
  jobTitle: string;
  active: boolean;
}

export interface InventoryCheckResponse {
  itemCode: string;
  requestedQuantity: number;
  availableQuantity: number | null;
  warehouseCode: string | null;
  available: boolean;
  reason: string | null;
}

export const integrationApi = {
  getEmployee: (employeeId: string): Promise<EmployeeResponse | null> =>
    apiClient.get<EmployeeResponse>(`/integration/hrm/employees/${employeeId}`)
      .then((r) => r.data)
      .catch(() => null),

  validateEmployee: (employeeId: string): Promise<{ employeeId: string; valid: boolean }> =>
    apiClient.get<{ employeeId: string; valid: boolean }>(
      `/integration/hrm/employees/${employeeId}/validate`
    ).then((r) => r.data),

  checkInventory: (itemCode: string, quantity?: number): Promise<InventoryCheckResponse> =>
    apiClient.get<InventoryCheckResponse>('/integration/mms/inventory/check', {
      itemCode,
      quantity: quantity ?? 1,
    }).then((r) => r.data),

  listInventoryItems: (): Promise<Record<string, unknown>[]> =>
    apiClient.get<Record<string, unknown>[]>('/integration/mms/inventory/items')
      .then((r) => r.data),
};
