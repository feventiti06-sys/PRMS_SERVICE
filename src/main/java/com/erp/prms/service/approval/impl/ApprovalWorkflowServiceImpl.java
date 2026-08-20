package com.erp.prms.service.approval.impl;

import com.erp.prms.dto.request.RequisitionApproveRequest;
import com.erp.prms.dto.response.RequisitionResponse;
import com.erp.prms.entity.enums.PRStatus;
import com.erp.prms.exception.ApprovalWorkflowException;
import com.erp.prms.exception.ResourceNotFoundException;
import com.erp.prms.mapper.PurchaseRequisitionMapper;
import com.erp.prms.repository.PurchaseRequisitionRepository;
import com.erp.prms.service.approval.ApprovalWorkflowService;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApprovalWorkflowServiceImpl implements ApprovalWorkflowService {

    private final PurchaseRequisitionRepository requisitions;
    private final PurchaseRequisitionMapper mapper;

    public ApprovalWorkflowServiceImpl(
            PurchaseRequisitionRepository requisitions,
            PurchaseRequisitionMapper mapper
    ) {
        this.requisitions = requisitions;
        this.mapper = mapper;
    }

    @Override
    public RequisitionResponse decide(
            Long requisitionId,
            String approverEmployeeId,
            RequisitionApproveRequest request
    ) {
        var requisition = requisitions.findById(requisitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found"));
        var workflow = requisition.getApprovalWorkflow();
        if (workflow == null) {
            throw new ApprovalWorkflowException("No workflow assigned");
        }

        var stage = workflow.getStages().stream()
                .filter(s -> s.getStageOrder() == workflow.getCurrentStageOrder())
                .findFirst()
                .orElseThrow(() -> new ApprovalWorkflowException("Current approval stage not found"));

        if (!stage.getApproverEmployeeId().equals(approverEmployeeId)) {
            throw new ApprovalWorkflowException("Employee is not current approver");
        }

        stage.setAction(request.getAction());
        stage.setComments(request.getComments());
        stage.setActionedAt(Instant.now());

        switch (request.getAction()) {
            case REJECT -> requisition.setStatus(PRStatus.REJECTED);
            case RETURN -> requisition.setStatus(PRStatus.DRAFT);
            case APPROVE -> {
                workflow.setCurrentStageOrder(workflow.getCurrentStageOrder() + 1);
                if (workflow.getCurrentStageOrder() > workflow.getStages().size()) {
                    requisition.setStatus(PRStatus.APPROVED);
                }
            }
        }

        return mapper.toResponse(requisition);
    }
}
