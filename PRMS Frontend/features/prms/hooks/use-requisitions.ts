/**
 * React Query hooks for the Purchase Requisition API.
 *
 * Backend endpoints:
 *   GET  /api/v1/requisitions?requesterEmployeeId={id}  → RequisitionResponse[]
 *   GET  /api/v1/requisitions/{id}                      → RequisitionResponse
 *   POST /api/v1/requisitions                           → RequisitionResponse
 *   POST /api/v1/requisitions/{id}/submit               → RequisitionResponse
 *
 * IMPORTANT: The GET list endpoint requires a requesterEmployeeId query param.
 * This should come from the authenticated user's employee ID once Keycloak
 * integration is complete.
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  requisitionApi,
  RequisitionCreateRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all requisitions for a specific employee.
 * Pass the authenticated user's employee ID from the Keycloak token.
 */
export function useRequisitionsByRequester(requesterEmployeeId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.purchaseRequests, { requesterEmployeeId }],
    queryFn: () => requisitionApi.listByRequester(requesterEmployeeId!),
    enabled: !!requesterEmployeeId,
    staleTime: 2 * 60 * 1000,
  });
}

/** Fetch a single requisition by backend numeric ID. */
export function useRequisition(id: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.purchaseRequest(String(id)),
    queryFn: () => requisitionApi.getById(id!),
    enabled: id != null,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new purchase requisition. */
export function useCreateRequisition() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: RequisitionCreateRequest) => requisitionApi.create(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequests });
      toast({
        title: "Requisition created",
        description: `${data.requisitionNumber} has been saved.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to create requisition",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Submit a DRAFT requisition for approval.
 * Transitions status: DRAFT → PENDING_APPROVAL
 */
export function useSubmitRequisition() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number | string) => requisitionApi.submit(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequests });
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequest(String(data.id)) });
      toast({
        title: "Requisition submitted",
        description: `${data.requisitionNumber} has been submitted for approval.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to submit requisition",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
