package com.erp.prms.service.rfp;

import com.erp.prms.dto.request.RFQCreateRequest;
import com.erp.prms.entity.RFQ;

public interface RFQService {

    /** Issues an RFQ for a requisition. */
    RFQ create(RFQCreateRequest request);

    /** Retrieves an RFQ. */
    RFQ getById(Long id);
}
