import { apiClient, ApiResponse } from '@/lib/api';
import { 
  Supplier, 
  SupplierRequest, 
  SupplierSummary, 
  SupplierFilter,
  SupplierPerformance 
} from '@/features/prms/types/supplier';

export class SupplierService {
  private basePath = '/suppliers';

  async getSuppliers(filter?: SupplierFilter): Promise<ApiResponse<SupplierSummary[]>> {
    return apiClient.get<SupplierSummary[]>(this.basePath, filter);
  }

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.get<Supplier>(`${this.basePath}/${id}`);
  }

  async createSupplier(data: SupplierRequest): Promise<ApiResponse<Supplier>> {
    return apiClient.post<Supplier>(this.basePath, data);
  }

  async updateSupplier(id: string, data: Partial<SupplierRequest>): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(`${this.basePath}/${id}`, data);
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async getSupplierPerformance(id: string): Promise<ApiResponse<SupplierPerformance>> {
    return apiClient.get<SupplierPerformance>(`${this.basePath}/${id}/performance`);
  }

  async activateSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/activate`);
  }

  async deactivateSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/deactivate`);
  }

  async getSupplierContacts(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/contacts`);
  }

  async addSupplierContact(id: string, contact: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${this.basePath}/${id}/contacts`, contact);
  }

  async updateSupplierContact(supplierId: string, contactId: string, contact: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`${this.basePath}/${supplierId}/contacts/${contactId}`, contact);
  }

  async deleteSupplierContact(supplierId: string, contactId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${supplierId}/contacts/${contactId}`);
  }

  async uploadSupplierDocument(id: string, file: File, documentType: string): Promise<ApiResponse<any>> {
    return apiClient.upload<any>(`${this.basePath}/${id}/documents`, file, { documentType });
  }

  async getSupplierDocuments(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/documents`);
  }
}

export const supplierService = new SupplierService();