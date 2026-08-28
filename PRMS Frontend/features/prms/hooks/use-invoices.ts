/**
 * React Query hooks for the Invoice API.
 *
 * Backend endpoint:
 *   POST /api/v1/invoices  ← InvoiceRequest → InvoiceEntity
 *
 * IMPORTANT: The backend only exposes a POST (submit) endpoint for invoices.
 * There is no GET-list or GET-by-id endpoint at this time.
 * The invoice list page continues to display demo data; only the submit
 * flow is connected to the real backend.
 *
 * NOTE: All calls require a valid Keycloak JWT in localStorage("access_token").
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  invoiceApi,
  InvoiceRequest,
  handleApiError,
  isApiError,
} from "@/lib/prms-api";
import { queryKeys } from "@/lib/api";

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Submit an invoice to the finance integration service. */
export function useSubmitInvoice() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: InvoiceRequest) => invoiceApi.submit(body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({
        queryKey: queryKeys.purchaseOrder(String(data.purchaseOrderId)),
      });
      toast({
        title: "Invoice submitted",
        description: `Invoice ${data.invoiceNumber} has been submitted to finance.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to submit invoice",
        description: isApiError(err) ? handleApiError(err) : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
