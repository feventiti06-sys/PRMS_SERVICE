package com.erp.prms.service.rfp.impl;

import com.erp.prms.dto.request.RFQCreateRequest;
import com.erp.prms.entity.RFQ;
import com.erp.prms.exception.ResourceNotFoundException;
import com.erp.prms.mapper.RFQMapper;
import com.erp.prms.repository.PurchaseRequisitionRepository;
import com.erp.prms.repository.RFQRepository;
import com.erp.prms.service.rfp.RFQService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RFQServiceImpl implements RFQService {

    private final RFQRepository rfqs;
    private final PurchaseRequisitionRepository requisitions;
    private final RFQMapper mapper;

    public RFQServiceImpl(
            RFQRepository rfqs,
            PurchaseRequisitionRepository requisitions,
            RFQMapper mapper
    ) {
        this.rfqs = rfqs;
        this.requisitions = requisitions;
        this.mapper = mapper;
    }

    @Override
    public RFQ create(RFQCreateRequest request) {
        RFQ rfq = mapper.toEntity(request);
        rfq.setRfqNumber("RFQ-%06d".formatted(rfqs.count() + 1));
        rfq.setPurchaseRequisition(requisitions.findById(request.getPurchaseRequisitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Requisition not found")));
        return rfqs.save(rfq);
    }

    @Override
    @Transactional(readOnly = true)
    public RFQ getById(Long id) {
        return rfqs.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));
    }
}

