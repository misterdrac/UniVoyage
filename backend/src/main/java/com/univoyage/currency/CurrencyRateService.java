package com.univoyage.currency;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class CurrencyRateService {

    private final ExchangeRateApiClient primaryClient;
    private final ExchangeRateHostClient fallbackClient;

    @Cacheable(value = "fxRates", key = "#base + ':' + #target")
    public double getRate(String base, String target) {

        if (base.equalsIgnoreCase(target)) {
            log.debug("Same currency detected: {} -> {}, returning 1.0", base, target);
            return 1.0;
        }

        log.info("Fetching FX rate: {} -> {}", base, target);

        // PRIMARY
        try {
            double rate = primaryClient.getPairRate(base, target);
            log.info("FX rate from PRIMARY API: {} -> {} = {}", base, target, rate);
            return rate;

        } catch (Exception e) {
            log.warn("Primary FX API failed: {} -> {} | reason={}", base, target, e.getMessage());
        }

        // FALLBACK
        try {
            double rate = fallbackClient.getRate(base, target);
            log.info("FX rate from FALLBACK API: {} -> {} = {}", base, target, rate);
            return rate;

        } catch (Exception e) {
            log.error("Fallback FX API failed: {} -> {} | reason={}", base, target, e.getMessage(), e);
            throw new IllegalStateException("All currency providers failed");
        }
    }
}