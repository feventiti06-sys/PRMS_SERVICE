/**
 * React Query hooks for the Vendor (Supplier) API.
 *
 * Backend endpoints:
 *   GET  /api/v1/vendors          → VendorResponse[]
 *   GET  /api/v1/vendors/{id}     → VendorResponse
 *   POST /api/v1/vendors          → VendorResponse
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  vendorApi,
  VendorCreateRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch all active vendors from the backend. */
export function useVendors() {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => vendorApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/** Fetch a single vendor by numeric backend ID. */
export function useVendor(id: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.supplier(String(id)),
    queryFn: () => vendorApi.getById(id!),
    enabled: id != null,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new vendor. Invalidates the vendor list on success. */
export function useCreateVendor() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: VendorCreateRequest) => vendorApi.create(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.suppliers });
      toast({
        title: "Vendor registered",
        description: `${data.name} (${data.vendorCode}) has been created.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to create vendor",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
