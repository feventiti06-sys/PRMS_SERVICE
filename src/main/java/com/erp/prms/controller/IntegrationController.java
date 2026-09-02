package com.erp.prms.controller;

import com.erp.prms.dto.response.EmployeeResponse;
import com.erp.prms.dto.response.InventoryCheckResponse;
import com.erp.prms.service.integration.HrmIntegrationService;
import com.erp.prms.service.integration.InventoryIntegrationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integration")
public class IntegrationController {

    private final HrmIntegrationService hrmService;
    private final InventoryIntegrationService inventoryService;

    public IntegrationController(HrmIntegrationService hrmService,
                                 InventoryIntegrationService inventoryService) {
        this.hrmService = hrmService;
        this.inventoryService = inventoryService;
    }

    @GetMapping("/hrm/employees/{employeeId}")
    public EmployeeResponse getEmployee(@PathVariable String employeeId) {
        return hrmService.getEmployee(employeeId);
    }

    @GetMapping("/hrm/employees/{employeeId}/validate")
    public Map<String, Object> validateEmployee(@PathVariable String employeeId) {
        boolean valid = hrmService.validateEmployee(employeeId);
        return Map.of("employeeId", employeeId, "valid", valid);
    }

    @GetMapping("/mms/inventory/check")
    public InventoryCheckResponse checkInventory(
            @RequestParam String itemCode,
            @RequestParam(defaultValue = "1") BigDecimal quantity) {
        return inventoryService.checkAvailability(itemCode, quantity);
    }

    @GetMapping("/mms/inventory/items")
    public List<Map<String, Object>> listInventoryItems() {
        return inventoryService.listItems();
    }
}
