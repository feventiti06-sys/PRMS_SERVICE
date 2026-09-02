package com.erp.prms.client;

import com.erp.prms.dto.response.EmployeeResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "hrm-client",
        url = "${integration.hrm.base-url:http://localhost:8083}",
        configuration = com.erp.prms.config.FeignConfig.class
)
public interface HrmClient {

    @GetMapping("/api/employees/{employeeId}")
    EmployeeResponse getEmployee(@PathVariable("employeeId") String employeeId);
}
