/**
 * React Query hooks for the Approval API.
 *
 * Backend endpoint:
 *   POST /api/v1/approvals/requisitions/{requisitionId}
 *         body: RequisitionApproveRequest  → RequisitionResponse
 *
 * The backend reads the approver identity from the JWT principal
 * (Authentication.getName()) so no approver ID is sent in the request body.
 *
 * action values accepted by the backend: APPROVE | REJECT | RETURN
 * (Note: "RETURN" means "return for rework" — maps to the frontend "REQUEST_CHANGES")
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  approvalApi,
  RequisitionApproveRequest,
  BackendApprovalAction,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Mutations ────────────────────────────────────────────────────────────────

interface ApprovalDecisionInput {
  requisitionId: number | string;
  action: BackendApprovalAction; // "APPROVE" | "REJECT" | "RETURN"
  comments?: string;
}

/**
 * Approve, reject, or return a purchase requisition for rework.
 * Invalidates both the approval list and the specific requisition on success.
 */
export function useDecideOnRequisition() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, action, comments }: ApprovalDecisionInput) => {
      const body: RequisitionApproveRequest = { action, comments };
      return approvalApi.decideOnRequisition(requisitionId, body);
    },
    onSuccess: (data, { action }) => {
      qc.invalidateQueries({ queryKey: queryKeys.approvals });
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequests });
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequest(String(data.id)) });

      const label =
        action === "APPROVE" ? "approved"
        : action === "REJECT" ? "rejected"
        : "returned for rework";

      toast({
        title: "Decision recorded",
        description: `Requisition ${data.requisitionNumber} has been ${label}.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to record decision",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
