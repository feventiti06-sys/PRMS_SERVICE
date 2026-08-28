/**
 * React Query hooks for the Purchase Order API.
 *
 * Backend endpoints:
 *   GET  /api/v1/purchase-orders/{id}  → PurchaseOrderResponse
 *   POST /api/v1/purchase-orders       → PurchaseOrderResponse
 *
 * IMPORTANT: The backend only exposes GET-by-id and POST.
 * There is no GET-list endpoint for purchase orders at this time.
 * The PO list page continues to display demo data; only the detail/create
 * flows are connected to the real backend.
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  purchaseOrderApi,
  PurchaseOrderCreateRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch a single purchase order by backend numeric ID. */
export function usePurchaseOrder(id: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.purchaseOrder(String(id)),
    queryFn: () => purchaseOrderApi.getById(id!),
    enabled: id != null,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new purchase order. */
export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: PurchaseOrderCreateRequest) => purchaseOrderApi.create(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      toast({
        title: "Purchase Order created",
        description: `${data.purchaseOrderNumber} has been issued.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to create purchase order",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
