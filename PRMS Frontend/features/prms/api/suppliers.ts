import axios from 'axios';
import { 
  Supplier, 
  SupplierRequest, 
  SupplierSummary, 
  PagedResponse, 
  SupplierFilter 
} from '../types/supplier';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const supplierApi = {
  // Create a new supplier
  createSupplier: async (data: SupplierRequest): Promise<Supplier> => {
    const response = await api.post('/suppliers', data);
    return response.data.data;
  },

  // Get supplier by ID
  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data.data;
  },

  // Search suppliers with filters
  searchSuppliers: async (filters: SupplierFilter): Promise<PagedResponse<SupplierSummary>> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.direction) params.append('direction', filters.direction);
    
    const response = await api.get(`/suppliers?${params.toString()}`);
    return response.data.data;
  },

  // Update supplier
  updateSupplier: async (id: string, data: SupplierRequest): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data.data;
  },

  // Update supplier status
  updateSupplierStatus: async (id: string, status: string): Promise<void> => {
    await api.patch(`/suppliers/${id}/status?status=${status}`);
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  // Get supplier statistics
  getSupplierStats: async (): Promise<{
    total: number;
    active: number;
    pending: number;
    blacklisted: number;
    averageRating: number;
  }> => {
    // This endpoint might not exist yet, we'll create a mock or implement when backend adds it
    const suppliers = await supplierApi.searchSuppliers({ size: 1000 });
    
    const active = suppliers.content.filter(s => s.status === 'ACTIVE').length;
    const pending = suppliers.content.filter(s => s.status === 'PENDING_APPROVAL').length;
    const blacklisted = suppliers.content.filter(s => s.status === 'BLACKLISTED').length;
    const totalRating = suppliers.content.reduce((sum, s) => sum + (s.rating || 0), 0);
    const averageRating = suppliers.content.length > 0 ? totalRating / suppliers.content.length : 0;
    
    return {
      total: suppliers.totalElements,
      active,
      pending,
      blacklisted,
      averageRating: parseFloat(averageRating.toFixed(2)),
    };
  },

  // Get top suppliers by activity
  getTopSuppliers: async (limit: number = 5): Promise<SupplierSummary[]> => {
    const suppliers = await supplierApi.searchSuppliers({ 
      size: limit, 
      sortBy: 'createdAt', 
      direction: 'DESC' 
    });
    return suppliers.content;
  },
};

// Mock data for development when backend is not available
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    supplierCode: 'SUP-001',
    companyName: 'ABC Supplies Inc.',
    tradingName: 'ABC Supplies',
    category: 'GOODS',
    status: 'ACTIVE',
    taxId: 'TAX-123456',
    registrationNumber: 'REG-789012',
    email: 'contact@abcsupplies.com',
    phone: '+1234567890',
    website: 'https://abcsupplies.com',
    addressLine1: '123 Main Street',
    city: 'Addis Ababa',
    stateProvince: 'Addis Ababa',
    postalCode: '1000',
    country: 'ET',
    bankName: 'Commercial Bank of Ethiopia',
    bankAccountNumber: '1234567890',
    paymentTermsDays: 30,
    creditLimit: 1000000,
    currency: 'ETB',
    rating: 4.5,
    notes: 'Reliable supplier for office supplies',
    contacts: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@abcsupplies.com',
        phone: '+1234567891',
        position: 'Sales Manager',
        isPrimary: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    ],
    documents: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    supplierCode: 'SUP-002',
    companyName: 'Tech Solutions Ltd.',
    category: 'SERVICES',
    status: 'ACTIVE',
    email: 'info@techsolutions.com',
    phone: '+1234567892',
    website: 'https://techsolutions.com',
    addressLine1: '456 Tech Avenue',
    city: 'Addis Ababa',
    country: 'ET',
    paymentTermsDays: 45,
    creditLimit: 500000,
    currency: 'ETB',
    rating: 4.8,
    contacts: [],
    documents: [],
    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-02-10T14:20:00Z',
    createdBy: 'procurement',
  },
  {
    id: '3',
    supplierCode: 'SUP-003',
    companyName: 'XYZ Corporation',
    category: 'GOODS',
    status: 'PENDING_APPROVAL',
    email: 'contact@xyzcorp.com',
    phone: '+1234567893',
    country: 'ET',
    paymentTermsDays: 30,
    currency: 'ETB',
    contacts: [],
    documents: [],
    createdAt: '2024-03-01T09:15:00Z',
    updatedAt: '2024-03-01T09:15:00Z',
    createdBy: 'procurement',
  },
];