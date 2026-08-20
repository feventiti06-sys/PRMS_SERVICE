package com.erp.prms.validator;

import com.erp.prms.dto.response.BudgetCheckResponse;
import com.erp.prms.exception.BudgetExceededException;
import com.erp.prms.service.integration.FinanceIntegrationService;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class BudgetValidator {

    private final FinanceIntegrationService financeIntegrationService;

    public BudgetValidator(FinanceIntegrationService financeIntegrationService) {
        this.financeIntegrationService = financeIntegrationService;
    }

    public void validate(String departmentCode, BigDecimal amount) {
        BudgetCheckResponse result = financeIntegrationService.checkBudget(departmentCode, amount);
        if (!result.isApproved()) {
            throw new BudgetExceededException(result.getReason());
        }
    }
}
