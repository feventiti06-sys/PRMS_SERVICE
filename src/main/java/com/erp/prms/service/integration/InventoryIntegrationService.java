package com.erp.prms.service.integration;

import com.erp.prms.client.MmsClient;
import com.erp.prms.dto.response.InventoryCheckResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class InventoryIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(InventoryIntegrationService.class);

    private final MmsClient mmsClient;

    public InventoryIntegrationService(MmsClient mmsClient) {
        this.mmsClient = mmsClient;
    }

    public InventoryCheckResponse checkAvailability(String itemCode, BigDecimal quantity) {
        try {
            InventoryCheckResponse response = mmsClient.checkAvailability(itemCode, quantity);
            return response != null ? response : unavailable(itemCode, quantity, "MMS returned no result");
        } catch (Exception e) {
            log.warn("MMS availability check failed for item={}: {}", itemCode, e.getMessage());
            return availableByDefault(itemCode, quantity);
        }
    }

    public List<Map<String, Object>> listItems() {
        try {
            return mmsClient.listItems();
        } catch (Exception e) {
            log.warn("MMS item list unavailable: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private InventoryCheckResponse unavailable(String itemCode, BigDecimal quantity, String reason) {
        InventoryCheckResponse r = new InventoryCheckResponse();
        r.setItemCode(itemCode);
        r.setRequestedQuantity(quantity);
        r.setAvailable(false);
        r.setReason(reason);
        return r;
    }

    private InventoryCheckResponse availableByDefault(String itemCode, BigDecimal quantity) {
        InventoryCheckResponse r = new InventoryCheckResponse();
        r.setItemCode(itemCode);
        r.setRequestedQuantity(quantity);
        r.setAvailable(true);
        r.setReason("MMS unavailable — available by default");
        return r;
    }
}
