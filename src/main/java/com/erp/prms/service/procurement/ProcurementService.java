package com.erp.prms.service.procurement;

import com.erp.prms.dto.request.PurchaseOrderCreateRequest;
import com.erp.prms.dto.response.PurchaseOrderResponse;

public interface ProcurementService {

    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderCreateRequest request);

    PurchaseOrderResponse getPurchaseOrder(Long id);
}
