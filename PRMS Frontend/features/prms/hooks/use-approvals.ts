import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { approvalApi, RequisitionApproveRequest, BackendApprovalAction, handleApiError, isApiError } from '@/lib/prms-api';
import { queryKeys } from '@/lib/api';

export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.pendingApprovals,
    queryFn: () => approvalApi.listPending(),
    staleTime: 1 * 60 * 1000,
  });
}

interface ApprovalDecisionInput {
  requisitionId: number | string;
  action: BackendApprovalAction;
  comments?: string;
}

export function useDecideOnRequisition() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ requisitionId, action, comments }: ApprovalDecisionInput) => {
      const body: RequisitionApproveRequest = { action, comments };
      return approvalApi.decideOnRequisition(requisitionId, body);
    },
    onSuccess: (data, { action }) => {
      qc.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequests });
      qc.invalidateQueries({ queryKey: queryKeys.purchaseRequest(String(data.id)) });
      const label =
        action === 'APPROVE' ? 'approved' : action === 'REJECT' ? 'rejected' : 'returned for rework';
      toast({ title: 'Decision recorded', description: `${data.requisitionNumber} ${label}.` });
    },
    onError: (err) => {
      toast({
        title: 'Failed to record decision',
        description: isApiError(err) ? handleApiError(err) : 'Unexpected error.',
        variant: 'destructive',
      });
    },
  });
}
