package com.erp.prms.service.integration;

import com.erp.prms.client.HrmClient;
import com.erp.prms.dto.response.EmployeeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class HrmIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(HrmIntegrationService.class);

    private final HrmClient hrmClient;

    public HrmIntegrationService(HrmClient hrmClient) {
        this.hrmClient = hrmClient;
    }

    public EmployeeResponse getEmployee(String employeeId) {
        try {
            return hrmClient.getEmployee(employeeId);
        } catch (Exception e) {
            log.warn("HRM lookup failed for employeeId={}: {}", employeeId, e.getMessage());
            return null;
        }
    }

    public boolean validateEmployee(String employeeId) {
        EmployeeResponse employee = getEmployee(employeeId);
        if (employee == null) {
            log.warn("HRM unavailable — skipping employee validation for {}", employeeId);
            return true;
        }
        if (!employee.isActive()) {
            log.warn("Employee {} is not active in HRM", employeeId);
            return false;
        }
        return true;
    }
}
