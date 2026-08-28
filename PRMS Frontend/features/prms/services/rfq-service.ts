import { apiClient, ApiResponse } from '@/lib/api';
import { 
  RFQ, 
  RFQRequest, 
  RFQSummary, 
  RFQFilter,
  RFQStats,
  Quotation,
  QuotationRequest,
  QuotationSummary,
  QuotationFilter,
  EvaluationResult
} from '@/features/prms/types/rfq';

export class RFQService {
  private basePath = '/rfqs';

  // RFQ Management
  async getRFQs(filter?: RFQFilter): Promise<ApiResponse<RFQSummary[]>> {
    return apiClient.get<RFQSummary[]>(this.basePath, filter);
  }

  async getRFQ(id: string): Promise<ApiResponse<RFQ>> {
    return apiClient.get<RFQ>(`${this.basePath}/${id}`);
  }

  async createRFQ(data: RFQRequest): Promise<ApiResponse<RFQ>> {
    return apiClient.post<RFQ>(this.basePath, data);
  }

  async updateRFQ(id: string, data: Partial<RFQRequest>): Promise<ApiResponse<RFQ>> {
    return apiClient.put<RFQ>(`${this.basePath}/${id}`, data);
  }

  async deleteRFQ(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async publishRFQ(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/publish`);
  }

  async closeRFQ(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/close`);
  }

  async cancelRFQ(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/cancel`, { reason });
  }

  async getRFQStats(): Promise<ApiResponse<RFQStats>> {
    return apiClient.get<RFQStats>(`${this.basePath}/stats`);
  }

  async sendRFQReminder(id: string, supplierIds?: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/remind`, { supplierIds });
  }

  async uploadRFQAttachment(id: string, file: File, description?: string): Promise<ApiResponse<any>> {
    return apiClient.upload<any>(`${this.basePath}/${id}/attachments`, file, { description });
  }

  async deleteRFQAttachment(rfqId: string, attachmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${rfqId}/attachments/${attachmentId}`);
  }
}

export class QuotationService {
  private basePath = '/quotations';

  async getQuotations(filter?: QuotationFilter): Promise<ApiResponse<QuotationSummary[]>> {
    return apiClient.get<QuotationSummary[]>(this.basePath, filter);
  }

  async getQuotation(id: string): Promise<ApiResponse<Quotation>> {
    return apiClient.get<Quotation>(`${this.basePath}/${id}`);
  }

  async createQuotation(data: QuotationRequest): Promise<ApiResponse<Quotation>> {
    return apiClient.post<Quotation>(this.basePath, data);
  }

  async updateQuotation(id: string, data: Partial<QuotationRequest>): Promise<ApiResponse<Quotation>> {
    return apiClient.put<Quotation>(`${this.basePath}/${id}`, data);
  }

  async deleteQuotation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async submitQuotation(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/submit`);
  }

  async acceptQuotation(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/accept`);
  }

  async rejectQuotation(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/reject`, { reason });
  }

  async evaluateQuotation(id: string, evaluation: EvaluationResult): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/evaluate`, evaluation);
  }

  async getQuotationsByRFQ(rfqId: string): Promise<ApiResponse<QuotationSummary[]>> {
    return apiClient.get<QuotationSummary[]>(`${this.basePath}?rfqId=${rfqId}`);
  }

  async compareQuotations(quotationIds: string[]): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${this.basePath}/compare`, { quotationIds });
  }

  async uploadQuotationAttachment(id: string, file: File, description?: string): Promise<ApiResponse<any>> {
    return apiClient.upload<any>(`${this.basePath}/${id}/attachments`, file, { description });
  }

  async deleteQuotationAttachment(quotationId: string, attachmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${quotationId}/attachments/${attachmentId}`);
  }
}

export const rfqService = new RFQService();
export const quotationService = new QuotationService();