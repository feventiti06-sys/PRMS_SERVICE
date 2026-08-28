// API Configuration and Base Client
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  retries: 3,
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: string[];
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
    this.retries = API_CONFIG.retries;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /** Parse Spring Boot ProblemDetail or legacy { message, errors } error bodies. */
  private parseErrorBody(body: unknown, statusText: string): { message: string; errors: string[] } {
    if (!body || typeof body !== "object") {
      return { message: statusText || "Request failed", errors: [] };
    }

    const record = body as Record<string, unknown>;
    const message =
      (typeof record.detail === "string" && record.detail) ||
      (typeof record.message === "string" && record.message) ||
      (typeof record.title === "string" && record.title) ||
      statusText ||
      "Request failed";

    const errors: string[] = [];

    if (Array.isArray(record.errors)) {
      errors.push(...record.errors.filter((e): e is string => typeof e === "string"));
    }

    if (record.violations && typeof record.violations === "object") {
      Object.values(record.violations as Record<string, unknown>).forEach((v) => {
        if (typeof v === "string") errors.push(v);
      });
    }

    return { message, errors };
  }

  /**
   * Normalise backend responses.
   * Spring Boot controllers return DTOs/entities directly; some legacy callers
   * may still send { success, data }. Both shapes are supported.
   */
  private normalizeSuccessBody<T>(body: unknown): ApiResponse<T> {
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      return body as ApiResponse<T>;
    }

    return {
      success: true,
      data: body as T,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson =
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json");
    const body = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const { message, errors } = this.parseErrorBody(body, response.statusText);
      throw {
        status: response.status,
        message,
        errors,
        timestamp: new Date().toISOString(),
      } as ApiError;
    }

    // 204 No Content — treat as successful empty payload
    if (response.status === 204 || body === null) {
      return { success: true, data: undefined as T };
    }

    return this.normalizeSuccessBody<T>(body);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // Retry logic for network errors
      if (retryCount < this.retries && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      // Handle different error types
      if (error.name === 'AbortError') {
        throw {
          status: 408,
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
        } as ApiError;
      }

      if (error.status) {
        throw error as ApiError;
      }

      throw {
        status: 500,
        message: 'Network error occurred',
        timestamp: new Date().toISOString(),
      } as ApiError;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors and 5xx server errors
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let path = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) path = `${endpoint}?${qs}`;
    }
    return this.makeRequest<T>(path);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Utility functions for common API operations
export const handleApiError = (error: ApiError): string => {
  switch (error.status) {
    case 400:
      return error.errors?.join(', ') || 'Invalid request data';
    case 401:
      return 'Authentication required';
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Resource conflict';
    case 422:
      return error.errors?.join(', ') || 'Validation failed';
    case 500:
      return 'Server error occurred';
    case 503:
      return 'Service temporarily unavailable';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === "object" &&
    typeof (error as ApiError).status === "number" &&
    typeof (error as ApiError).message === "string"
  );
};

// React Query keys for caching
export const queryKeys = {
  // Suppliers
  suppliers: ['suppliers'] as const,
  supplier: (id: string) => ['suppliers', id] as const,
  supplierPerformance: (id: string) => ['suppliers', id, 'performance'] as const,

  // Purchase Requests
  purchaseRequests: ['purchase-requests'] as const,
  purchaseRequest: (id: string) => ['purchase-requests', id] as const,
  purchaseRequestApprovals: (id: string) => ['purchase-requests', id, 'approvals'] as const,

  // Approvals
  approvals: ['approvals'] as const,
  approval: (id: string) => ['approvals', id] as const,
  myApprovals: ['approvals', 'me'] as const,

  // RFQ
  rfqs: ['rfqs'] as const,
  rfq: (id: string) => ['rfqs', id] as const,
  rfqSuppliers: (id: string) => ['rfqs', id, 'suppliers'] as const,

  // Quotations
  quotations: ['quotations'] as const,
  quotation: (id: string) => ['quotations', id] as const,
  quotationEvaluation: (id: string) => ['quotations', id, 'evaluation'] as const,

  // Purchase Orders
  purchaseOrders: ['purchase-orders'] as const,
  purchaseOrder: (id: string) => ['purchase-orders', id] as const,
  purchaseOrderItems: (id: string) => ['purchase-orders', id, 'items'] as const,

  // Goods Receipt
  goodsReceipts: ['goods-receipts'] as const,
  goodsReceipt: (id: string) => ['goods-receipts', id] as const,

  // Invoices
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoices', id] as const,
  invoicePayments: (id: string) => ['invoices', id, 'payments'] as const,

  // Reports
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  reportTemplates: ['report-templates'] as const,

  // Audit Logs
  auditLogs: ['audit-logs'] as const,

  // Settings
  settings: ['settings'] as const,
  workflows: ['workflows'] as const,
  workflow: (id: string) => ['workflows', id] as const,
  departments: ['departments'] as const,
  categories: ['categories'] as const,
  users: ['users'] as const,

  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardCharts: ['dashboard', 'charts'] as const,
};