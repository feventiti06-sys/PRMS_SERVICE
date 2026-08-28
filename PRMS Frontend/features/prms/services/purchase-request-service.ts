import { apiClient, ApiResponse } from '@/lib/api';
import { 
  PurchaseRequest, 
  PurchaseRequestRequest, 
  PurchaseRequestSummary, 
  PurchaseRequestFilter,
  PurchaseRequestStats
} from '@/features/prms/types/purchase-request';

export class PurchaseRequestService {
  private basePath = '/purchase-requests';

  async getPurchaseRequests(filter?: PurchaseRequestFilter): Promise<ApiResponse<PurchaseRequestSummary[]>> {
    return apiClient.get<PurchaseRequestSummary[]>(this.basePath, filter);
  }

  async getPurchaseRequest(id: string): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.get<PurchaseRequest>(`${this.basePath}/${id}`);
  }

  async createPurchaseRequest(data: PurchaseRequestRequest): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(this.basePath, data);
  }

  async updatePurchaseRequest(id: string, data: Partial<PurchaseRequestRequest>): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.put<PurchaseRequest>(`${this.basePath}/${id}`, data);
  }

  async deletePurchaseRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async submitPurchaseRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/submit`);
  }

  async cancelPurchaseRequest(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/cancel`, { reason });
  }

  async getPurchaseRequestStats(): Promise<ApiResponse<PurchaseRequestStats>> {
    return apiClient.get<PurchaseRequestStats>(`${this.basePath}/stats`);
  }

  async getPurchaseRequestApprovals(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/approvals`);
  }

  async getPurchaseRequestHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/history`);
  }

  async uploadPurchaseRequestAttachment(id: string, file: File, description?: string): Promise<ApiResponse<any>> {
    return apiClient.upload<any>(`${this.basePath}/${id}/attachments`, file, { description });
  }

  async deletePurchaseRequestAttachment(prId: string, attachmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${prId}/attachments/${attachmentId}`);
  }

  async duplicatePurchaseRequest(id: string): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(`${this.basePath}/${id}/duplicate`);
  }
}

export const purchaseRequestService = new PurchaseRequestService();