package com.erp.prms.service.receiving;

import com.erp.prms.dto.request.GoodsReceiptRequest;
import com.erp.prms.entity.GoodsReceiptNote;

public interface GoodsReceiptService {

    /** Records goods received against a PO. */
    GoodsReceiptNote record(GoodsReceiptRequest request);

    /** Retrieves a goods receipt. */
    GoodsReceiptNote getById(Long id);
}
