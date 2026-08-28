import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supplierService } from '@/features/prms/services/supplier-service';
import { queryKeys, handleApiError, isApiError } from '@/lib/api';
import { SupplierFilter, SupplierRequest } from '@/features/prms/types/supplier';

// Query Hooks
export const useSuppliers = (filter?: SupplierFilter) => {
  return useQuery({
    queryKey: [...queryKeys.suppliers, filter],
    queryFn: () => supplierService.getSuppliers(filter),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: queryKeys.supplier(id),
    queryFn: () => supplierService.getSupplier(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

export const useSupplierPerformance = (id: string) => {
  return useQuery({
    queryKey: queryKeys.supplierPerformance(id),
    queryFn: () => supplierService.getSupplierPerformance(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation Hooks
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SupplierRequest) => supplierService.createSupplier(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      toast({
        title: "Supplier created",
        description: `${response.data.companyName} has been created successfully.`,
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to create supplier';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierRequest> }) => 
      supplierService.updateSupplier(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      queryClient.invalidateQueries({ queryKey: queryKeys.supplier(id) });
      toast({
        title: "Supplier updated",
        description: `${response.data.companyName} has been updated successfully.`,
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to update supplier';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      queryClient.removeQueries({ queryKey: queryKeys.supplier(id) });
      toast({
        title: "Supplier deleted",
        description: "Supplier has been deleted successfully.",
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to delete supplier';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useActivateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supplierService.activateSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      queryClient.invalidateQueries({ queryKey: queryKeys.supplier(id) });
      toast({
        title: "Supplier activated",
        description: "Supplier has been activated successfully.",
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to activate supplier';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useDeactivateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => supplierService.deactivateSupplier(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      queryClient.invalidateQueries({ queryKey: queryKeys.supplier(id) });
      toast({
        title: "Supplier deactivated",
        description: "Supplier has been deactivated successfully.",
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to deactivate supplier';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useUploadSupplierDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, file, documentType }: { id: string; file: File; documentType: string }) => 
      supplierService.uploadSupplierDocument(id, file, documentType),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplier(id) });
      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully.",
      });
    },
    onError: (error) => {
      const message = isApiError(error) ? handleApiError(error) : 'Failed to upload document';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};