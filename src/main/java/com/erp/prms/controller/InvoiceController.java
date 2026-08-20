package com.erp.prms.controller;

import com.erp.prms.dto.request.InvoiceRequest;
import com.erp.prms.entity.Invoice;
import com.erp.prms.service.integration.FinanceIntegrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final FinanceIntegrationService finance;

    public InvoiceController(FinanceIntegrationService finance) {
        this.finance = finance;
    }

    @PostMapping
    public ResponseEntity<Invoice> submit(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(finance.submitInvoice(request));
    }
}
