/**
 * PRMS Backend-Aligned API Service Layer
 *
 * This file is the single integration point between the frontend and the
 * Spring Boot PRMS backend.  It maps:
 *
 *   Frontend concept  →  Backend endpoint  →  Backend DTO
 *
 * ─── ENDPOINT MAP ────────────────────────────────────────────────────────────
 *
 *  Vendors (displayed as "Suppliers" in the UI)
 *    GET    /vendors          → VendorResponse[]
 *    GET    /vendors/{id}     → VendorResponse
 *    POST   /vendors          ← VendorCreateRequest → VendorResponse
 *
 *  Purchase Requisitions (displayed as "Purchase Requests" in the UI)
 *    GET    /requisitions?requesterEmployeeId={id} → RequisitionResponse[]
 *    GET    /requisitions/{id}                     → RequisitionResponse
 *    POST   /requisitions     ← RequisitionCreateRequest → RequisitionResponse
 *    POST   /requisitions/{id}/submit              → RequisitionResponse
 *
 *  Approvals
 *    POST   /approvals/requisitions/{id} ← RequisitionApproveRequest → RequisitionResponse
 *
 *  RFQ
 *    GET    /rfqs/{id}        → RFQ entity
 *    POST   /rfqs             ← RFQCreateRequest → RFQ entity
 *
 *  Purchase Orders
 *    GET    /purchase-orders/{id}  → PurchaseOrderResponse
 *    POST   /purchase-orders       ← PurchaseOrderCreateRequest → PurchaseOrderResponse
 *
 *  Goods Receipts
 *    GET    /goods-receipts/{id}   → GoodsReceiptNote entity
 *    POST   /goods-receipts        ← GoodsReceiptRequest → GoodsReceiptNote entity
 *
 *  Invoices
 *    POST   /invoices         ← InvoiceRequest → Invoice entity
 *
 * ─── AUTHENTICATION ───────────────────────────────────────────────────────────
 *
 *  All endpoints require a valid Keycloak JWT in the Authorization header.
 *  The token is read from localStorage key "access_token", which is set by the
 *  shared ERP authentication layer once Keycloak integration is complete.
 *
 *  During local development, obtain a token from Keycloak and store it manually:
 *    localStorage.setItem("access_token", "<your-jwt-here>")
 *
 * ─── ENUM MAPPING ─────────────────────────────────────────────────────────────
 *
 *  The backend uses different enum values than the frontend UI layer.
 *  This file defines the backend enums as TypeScript const objects so the rest
 *  of the frontend uses the correct values when calling the API.
 *
 *  PRStatus   (backend): DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | PO_CREATED
 *  POStatus   (backend): DRAFT | SENT | CONFIRMED | PARTIALLY_RECEIVED | COMPLETED | CANCELLED
 *  PaymentTerms         : NET_15 | NET_30 | NET_60 | COD
 *  VendorType           : INDIVIDUAL | CORPORATE | GOVERNMENT
 *  ApprovalAction       : APPROVE | REJECT | RETURN
 */

import { apiClient, ApiError, handleApiError, isApiError } from "@/lib/api";

// ─── Backend enum types ───────────────────────────────────────────────────────

/** PRStatus enum values as defined in the backend entity. */
export type BackendPRStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PO_CREATED";

/** POStatus enum values as defined in the backend entity. */
export type BackendPOStatus =
  | "DRAFT"
  | "SENT"
  | "CONFIRMED"
  | "PARTIALLY_RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

/** PaymentTerms enum values as defined in the backend entity. */
export type BackendPaymentTerms = "NET_15" | "NET_30" | "NET_60" | "COD";

/** VendorType enum values as defined in the backend entity. */
export type BackendVendorType = "INDIVIDUAL" | "CORPORATE" | "GOVERNMENT";

/** ApprovalAction enum values as defined in the backend entity. */
export type BackendApprovalAction = "APPROVE" | "REJECT" | "RETURN";

// ─── Backend response DTOs ────────────────────────────────────────────────────

/** Maps to com.erp.prms.dto.response.VendorResponse */
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

/** Maps to com.erp.prms.dto.response.RequisitionResponse */
export interface RequisitionResponse {
  id: number;
  requisitionNumber: string;
  requesterEmployeeId: string;
  departmentCode: string;
  purpose: string;
  itemDetails: string;
  estimatedAmount: number;
  status: BackendPRStatus;
  requiredByDate: string; // LocalDate → "YYYY-MM-DD"
  approvalWorkflowId: number | null;
  createdAt: string; // Instant → ISO-8601
}

/** Maps to com.erp.prms.dto.response.PurchaseOrderResponse */
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
  orderDate: string; // LocalDate
  expectedDeliveryDate: string; // LocalDate
  expiryDate: string | null; // LocalDate
}

/**
 * RFQ entity — the RFQ controller returns the entity directly (not a DTO).
 * Only the fields actually present in the entity are listed here.
 */
export interface RFQEntity {
  id: number;
  rfqNumber: string;
  title: string;
  itemDetails: string;
  submissionDeadline: string; // LocalDate
  status: string;
  purchaseRequisitionId: number;
  createdAt: string;
}

/**
 * GoodsReceiptNote entity — returned directly by the goods-receipt controller.
 */
export interface GoodsReceiptNoteEntity {
  id: number;
  grnNumber?: string;
  purchaseOrderId: number;
  receiptDate: string; // LocalDate
  receivedByEmployeeId: string;
  receiptDetails: string;
  inspectionNotes: string | null;
  accepted: boolean;
  createdAt?: string;
}

/**
 * Invoice entity — returned directly by the invoice controller.
 */
export interface InvoiceEntity {
  id: number;
  invoiceNumber: string;
  purchaseOrderId: number;
  vendorId: number;
  invoiceAmount: number;
  invoiceDate: string; // LocalDate
  dueDate: string; // LocalDate
  itemDetails: string | null;
  status?: string;
  createdAt?: string;
}

// ─── Backend request DTOs ─────────────────────────────────────────────────────

/** Maps to com.erp.prms.dto.request.VendorCreateRequest */
export interface VendorCreateRequest {
  name: string;
  vendorType: BackendVendorType;
  taxIdentificationNumber: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: BackendPaymentTerms;
}

/** Maps to com.erp.prms.dto.request.RequisitionCreateRequest */
export interface RequisitionCreateRequest {
  requesterEmployeeId: string;
  departmentCode: string;
  purpose: string;
  itemDetails: string;
  estimatedAmount: number; // BigDecimal — send as number
  requiredByDate: string;  // LocalDate → "YYYY-MM-DD"
}

/** Maps to com.erp.prms.dto.request.RequisitionApproveRequest */
export interface RequisitionApproveRequest {
  action: BackendApprovalAction;
  comments?: string;
}

/** Maps to com.erp.prms.dto.request.RFQCreateRequest */
export interface RFQCreateRequest {
  purchaseRequisitionId: number;
  title: string;
  itemDetails: string;
  submissionDeadline: string; // LocalDate → "YYYY-MM-DD" (must be future)
}

/** Maps to com.erp.prms.dto.request.PurchaseOrderCreateRequest */
export interface PurchaseOrderCreateRequest {
  purchaseRequisitionId: number;
  vendorId: number;
  itemDetails: string;
  totalAmount: number; // BigDecimal
  paymentTerms: BackendPaymentTerms;
  expectedDeliveryDate: string; // LocalDate
  expiryDate?: string;          // LocalDate
}

/** Maps to com.erp.prms.dto.request.GoodsReceiptRequest */
export interface GoodsReceiptRequest {
  purchaseOrderId: number;
  receiptDate: string;           // LocalDate
  receivedByEmployeeId: string;
  receiptDetails: string;
  inspectionNotes?: string;
  accepted: boolean;
}

/** Maps to com.erp.prms.dto.request.InvoiceRequest */
export interface InvoiceRequest {
  invoiceNumber: string;
  purchaseOrderId: number;
  vendorId: number;
  invoiceAmount: number; // BigDecimal
  invoiceDate: string;   // LocalDate
  dueDate: string;       // LocalDate
  itemDetails?: string;
}

// ─── Vendor / Supplier API ────────────────────────────────────────────────────

export const vendorApi = {
  /** GET /api/v1/vendors — list all active vendors */
  list: (): Promise<VendorResponse[]> =>
    apiClient.get<VendorResponse[]>("/vendors").then((r) => r.data),

  /** GET /api/v1/vendors/{id} */
  getById: (id: number | string): Promise<VendorResponse> =>
    apiClient.get<VendorResponse>(`/vendors/${id}`).then((r) => r.data),

  /** POST /api/v1/vendors */
  create: (body: VendorCreateRequest): Promise<VendorResponse> =>
    apiClient.post<VendorResponse>("/vendors", body).then((r) => r.data),
};

// ─── Requisition / Purchase Request API ──────────────────────────────────────

export const requisitionApi = {
  /**
   * GET /api/v1/requisitions?requesterEmployeeId={id}
   * Returns requisitions for a specific employee.
   */
  listByRequester: (requesterEmployeeId: string): Promise<RequisitionResponse[]> =>
    apiClient
      .get<RequisitionResponse[]>("/requisitions", { requesterEmployeeId })
      .then((r) => r.data),

  /** GET /api/v1/requisitions/{id} */
  getById: (id: number | string): Promise<RequisitionResponse> =>
    apiClient.get<RequisitionResponse>(`/requisitions/${id}`).then((r) => r.data),

  /** POST /api/v1/requisitions */
  create: (body: RequisitionCreateRequest): Promise<RequisitionResponse> =>
    apiClient.post<RequisitionResponse>("/requisitions", body).then((r) => r.data),

  /**
   * POST /api/v1/requisitions/{id}/submit
   * Transitions a DRAFT requisition to PENDING_APPROVAL.
   */
  submit: (id: number | string): Promise<RequisitionResponse> =>
    apiClient.post<RequisitionResponse>(`/requisitions/${id}/submit`).then((r) => r.data),
};

// ─── Approval API ─────────────────────────────────────────────────────────────

export const approvalApi = {
  /**
   * POST /api/v1/approvals/requisitions/{requisitionId}
   * The backend reads the approver identity from the JWT (Authentication.getName()).
   * action must be one of: APPROVE | REJECT | RETURN
   */
  decideOnRequisition: (
    requisitionId: number | string,
    body: RequisitionApproveRequest
  ): Promise<RequisitionResponse> =>
    apiClient
      .post<RequisitionResponse>(`/approvals/requisitions/${requisitionId}`, body)
      .then((r) => r.data),
};

// ─── RFQ API ──────────────────────────────────────────────────────────────────

export const rfqApi = {
  /** GET /api/v1/rfqs/{id} */
  getById: (id: number | string): Promise<RFQEntity> =>
    apiClient.get<RFQEntity>(`/rfqs/${id}`).then((r) => r.data),

  /** POST /api/v1/rfqs */
  create: (body: RFQCreateRequest): Promise<RFQEntity> =>
    apiClient.post<RFQEntity>("/rfqs", body).then((r) => r.data),
};

// ─── Purchase Order API ───────────────────────────────────────────────────────

export const purchaseOrderApi = {
  /** GET /api/v1/purchase-orders/{id} */
  getById: (id: number | string): Promise<PurchaseOrderResponse> =>
    apiClient.get<PurchaseOrderResponse>(`/purchase-orders/${id}`).then((r) => r.data),

  /** POST /api/v1/purchase-orders */
  create: (body: PurchaseOrderCreateRequest): Promise<PurchaseOrderResponse> =>
    apiClient.post<PurchaseOrderResponse>("/purchase-orders", body).then((r) => r.data),
};

// ─── Goods Receipt API ────────────────────────────────────────────────────────

export const goodsReceiptApi = {
  /** GET /api/v1/goods-receipts/{id} */
  getById: (id: number | string): Promise<GoodsReceiptNoteEntity> =>
    apiClient.get<GoodsReceiptNoteEntity>(`/goods-receipts/${id}`).then((r) => r.data),

  /** POST /api/v1/goods-receipts */
  create: (body: GoodsReceiptRequest): Promise<GoodsReceiptNoteEntity> =>
    apiClient.post<GoodsReceiptNoteEntity>("/goods-receipts", body).then((r) => r.data),
};

// ─── Invoice API ──────────────────────────────────────────────────────────────

export const invoiceApi = {
  /** POST /api/v1/invoices */
  submit: (body: InvoiceRequest): Promise<InvoiceEntity> =>
    apiClient.post<InvoiceEntity>("/invoices", body).then((r) => r.data),
};

// ─── Helper: map backend PRStatus to frontend display label ──────────────────

export function prStatusLabel(status: BackendPRStatus): string {
  const map: Record<BackendPRStatus, string> = {
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending Approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PO_CREATED: "PO Created",
  };
  return map[status] ?? status;
}

/** Badge colour class for a given backend PRStatus */
export function prStatusBadge(status: BackendPRStatus): string {
  const map: Record<BackendPRStatus, string> = {
    DRAFT:            "bg-gray-100 text-gray-600",
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    APPROVED:         "bg-green-100 text-green-700",
    REJECTED:         "bg-red-100 text-red-700",
    PO_CREATED:       "bg-blue-100 text-blue-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

/** Badge colour class for a given backend POStatus */
export function poStatusBadge(status: BackendPOStatus): string {
  const map: Record<BackendPOStatus, string> = {
    DRAFT:               "bg-gray-100 text-gray-600",
    SENT:                "bg-blue-100 text-blue-700",
    CONFIRMED:           "bg-green-100 text-green-700",
    PARTIALLY_RECEIVED:  "bg-amber-100 text-amber-700",
    COMPLETED:           "bg-teal-100 text-teal-700",
    CANCELLED:           "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

// ─── Re-export shared error utilities ─────────────────────────────────────────
export { handleApiError, isApiError };
export type { ApiError };
