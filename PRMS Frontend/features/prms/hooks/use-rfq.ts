/**
 * React Query hooks for the RFQ API.
 *
 * Backend endpoints:
 *   GET  /api/v1/rfqs/{id}  → RFQEntity (entity returned directly — no DTO)
 *   POST /api/v1/rfqs       → RFQEntity
 *
 * IMPORTANT: The backend only exposes GET-by-id and POST.
 * There is no GET-list endpoint for RFQs at this time.
 * Features that require listing RFQs cannot be connected to the backend yet.
 * This is documented in the integration report.
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  rfqApi,
  RFQCreateRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch a single RFQ by backend numeric ID. */
export function useRFQ(id: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.rfq(String(id)),
    queryFn: () => rfqApi.getById(id!),
    enabled: id != null,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new RFQ linked to an existing purchase requisition. */
export function useCreateRFQ() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: RFQCreateRequest) => rfqApi.create(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.rfqs });
      toast({
        title: "RFQ created",
        description: `${data.rfqNumber ?? `RFQ #${data.id}`} has been created.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to create RFQ",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
