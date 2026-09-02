package com.erp.prms.service.requisition.impl;

import com.erp.prms.dto.request.RequisitionCreateRequest;
import com.erp.prms.dto.response.RequisitionResponse;
import com.erp.prms.entity.PurchaseRequisition;
import com.erp.prms.entity.enums.PRStatus;
import com.erp.prms.exception.ResourceNotFoundException;
import com.erp.prms.mapper.PurchaseRequisitionMapper;
import com.erp.prms.repository.PurchaseRequisitionRepository;
import com.erp.prms.service.events.ProcurementEventPublisher;
import com.erp.prms.service.integration.HrmIntegrationService;
import com.erp.prms.service.requisition.RequisitionService;
import com.erp.prms.util.PRGenerator;
import com.erp.prms.validator.BudgetValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RequisitionServiceImpl implements RequisitionService {

    private static final Logger log = LoggerFactory.getLogger(RequisitionServiceImpl.class);

    private final PurchaseRequisitionRepository repository;
    private final PurchaseRequisitionMapper mapper;
    private final PRGenerator generator;
    private final BudgetValidator budgetValidator;
    private final ProcurementEventPublisher publisher;
    private final HrmIntegrationService hrmService;

    public RequisitionServiceImpl(
            PurchaseRequisitionRepository repository,
            PurchaseRequisitionMapper mapper,
            PRGenerator generator,
            BudgetValidator budgetValidator,
            ProcurementEventPublisher publisher,
            HrmIntegrationService hrmService
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.generator = generator;
        this.budgetValidator = budgetValidator;
        this.publisher = publisher;
        this.hrmService = hrmService;
    }

    @Override
    public RequisitionResponse create(RequisitionCreateRequest request) {
        boolean employeeValid = hrmService.validateEmployee(request.getRequesterEmployeeId());
        if (!employeeValid) {
            throw new IllegalArgumentException(
                    "Employee " + request.getRequesterEmployeeId() + " is not active in HRM");
        }
        PurchaseRequisition entity = mapper.toEntity(request);
        entity.setRequisitionNumber(generator.next());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public RequisitionResponse getById(Long id) {
        return mapper.toResponse(entity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequisitionResponse> findByRequester(String employeeId) {
        return repository.findByRequesterEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public RequisitionResponse submit(Long id) {
        PurchaseRequisition entity = entity(id);
        budgetValidator.validate(entity.getDepartmentCode(), entity.getEstimatedAmount());
        entity.setStatus(PRStatus.PENDING_APPROVAL);
        publisher.publish("REQUISITION_SUBMITTED", id.toString());
        return mapper.toResponse(entity);
    }

    private PurchaseRequisition entity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found: " + id));
    }
}
