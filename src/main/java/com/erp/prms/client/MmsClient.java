package com.erp.prms.client;

import com.erp.prms.dto.response.InventoryCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "mms-client",
        url = "${integration.mms.base-url:http://localhost:8081}",
        configuration = com.erp.prms.config.FeignConfig.class
)
public interface MmsClient {

    @GetMapping("/api/inventory/check")
    InventoryCheckResponse checkAvailability(
            @RequestParam("itemCode") String itemCode,
            @RequestParam("quantity") java.math.BigDecimal quantity
    );

    @GetMapping("/api/inventory/items")
    java.util.List<java.util.Map<String, Object>> listItems();
}
