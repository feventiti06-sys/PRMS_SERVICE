package com.erp.prms.service.integration;

import com.erp.prms.client.FmsClient;
import com.erp.prms.dto.request.InvoiceRequest;
import com.erp.prms.dto.response.BudgetCheckResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class FinanceIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(FinanceIntegrationService.class);

    private final FmsClient fmsClient;

    public FinanceIntegrationService(FmsClient fmsClient) {
        this.fmsClient = fmsClient;
    }

    public BudgetCheckResponse checkBudget(String departmentCode, BigDecimal amount) {
        try {
            BudgetCheckResponse result = fmsClient.checkBudget(departmentCode, amount);
            return result != null ? result : denied(departmentCode, amount, "FMS returned no result");
        } catch (Exception e) {
            log.warn("FMS budget check failed for dept={}, amount={}: {}", departmentCode, amount, e.getMessage());
            return approved(departmentCode, amount);
        }
    }

    public void forwardInvoice(InvoiceRequest request) {
        try {
            fmsClient.receiveInvoice(request);
            log.info("Invoice {} forwarded to FMS", request.getInvoiceNumber());
        } catch (Exception e) {
            log.warn("Failed to forward invoice {} to FMS: {}", request.getInvoiceNumber(), e.getMessage());
        }
    }

    private BudgetCheckResponse denied(String code, BigDecimal amount, String reason) {
        BudgetCheckResponse r = new BudgetCheckResponse();
        r.setBudgetCode(code);
        r.setRequestedAmount(amount);
        r.setApproved(false);
        r.setReason(reason);
        return r;
    }

    private BudgetCheckResponse approved(String code, BigDecimal amount) {
        BudgetCheckResponse r = new BudgetCheckResponse();
        r.setBudgetCode(code);
        r.setRequestedAmount(amount);
        r.setApproved(true);
        r.setReason("FMS unavailable — approved by default");
        return r;
    }
}
