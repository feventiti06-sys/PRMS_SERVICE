package com.erp.prms.service.approval;

import com.erp.prms.dto.request.RequisitionApproveRequest;
import com.erp.prms.dto.response.RequisitionResponse;

public interface ApprovalWorkflowService {

    /** Applies the current approver's decision to a requisition. */
    RequisitionResponse decide(
            Long requisitionId,
            String approverEmployeeId,
            RequisitionApproveRequest request
    );
}
