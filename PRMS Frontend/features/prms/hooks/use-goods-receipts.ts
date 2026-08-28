/**
 * React Query hooks for the Goods Receipt API.
 *
 * Backend endpoints:
 *   GET  /api/v1/goods-receipts/{id}  → GoodsReceiptNoteEntity
 *   POST /api/v1/goods-receipts       → GoodsReceiptNoteEntity
 *
 * IMPORTANT: The backend only exposes GET-by-id and POST.
 * There is no GET-list endpoint for goods receipts at this time.
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  goodsReceiptApi,
  GoodsReceiptRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch a single goods receipt note by backend numeric ID. */
export function useGoodsReceipt(id: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.goodsReceipt(String(id)),
    queryFn: () => goodsReceiptApi.getById(id!),
    enabled: id != null,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Record a goods receipt against a purchase order. */
export function useCreateGoodsReceipt() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: GoodsReceiptRequest) => goodsReceiptApi.create(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.goodsReceipts });
      qc.invalidateQueries({
        queryKey: queryKeys.purchaseOrder(String(data.purchaseOrderId)),
      });
      toast({
        title: "Goods receipt recorded",
        description: `GRN ${data.grnNumber ?? `#${data.id}`} has been recorded.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to record goods receipt",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
