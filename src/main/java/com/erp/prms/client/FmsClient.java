package com.erp.prms.client;

import com.erp.prms.dto.request.InvoiceRequest;
import com.erp.prms.dto.response.BudgetCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "fms-client",
        url = "${integration.fms.base-url:http://localhost:8082}",
        configuration = com.erp.prms.config.FeignConfig.class
)
public interface FmsClient {

    @GetMapping("/api/budgets/check")
    BudgetCheckResponse checkBudget(
            @RequestParam("departmentCode") String departmentCode,
            @RequestParam("amount") java.math.BigDecimal amount
    );

    @PostMapping("/api/invoices/receive")
    void receiveInvoice(@RequestBody InvoiceRequest request);
}
