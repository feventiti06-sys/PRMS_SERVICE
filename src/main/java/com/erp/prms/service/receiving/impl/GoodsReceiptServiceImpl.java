package com.erp.prms.service.receiving.impl;

import com.erp.prms.dto.request.GoodsReceiptRequest;
import com.erp.prms.entity.GoodsReceiptNote;
import com.erp.prms.entity.enums.POStatus;
import com.erp.prms.exception.ResourceNotFoundException;
import com.erp.prms.repository.GoodsReceiptNoteRepository;
import com.erp.prms.repository.PurchaseOrderRepository;
import com.erp.prms.service.receiving.GoodsReceiptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GoodsReceiptServiceImpl implements GoodsReceiptService {

    private final GoodsReceiptNoteRepository receipts;
    private final PurchaseOrderRepository orders;

    public GoodsReceiptServiceImpl(
            GoodsReceiptNoteRepository receipts,
            PurchaseOrderRepository orders
    ) {
        this.receipts = receipts;
        this.orders = orders;
    }

    @Override
    public GoodsReceiptNote record(GoodsReceiptRequest request) {
        var po = orders.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));

        GoodsReceiptNote note = new GoodsReceiptNote();
        note.setReceiptNumber("GRN-%06d".formatted(receipts.count() + 1));
        note.setPurchaseOrder(po);
        note.setReceiptDate(request.getReceiptDate());
        note.setReceivedByEmployeeId(request.getReceivedByEmployeeId());
        note.setReceiptDetails(request.getReceiptDetails());
        note.setInspectionNotes(request.getInspectionNotes());
        note.setAccepted(request.getAccepted());

        if (request.getAccepted()) {
            po.setStatus(POStatus.PARTIALLY_RECEIVED);
        }

        return receipts.save(note);
    }

    @Override
    @Transactional(readOnly = true)
    public GoodsReceiptNote getById(Long id) {
        return receipts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goods receipt not found"));
    }
}
