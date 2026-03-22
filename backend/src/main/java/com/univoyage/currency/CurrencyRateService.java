package com.univoyage.currency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurrencyRateService {

    private final ExchangeRateApiClient primaryClient;
    private final ExchangeRateHostClient fallbackClient;

    @Cacheable(value = "fxRates", key = "#base + ':' + #target")
    public double getRate(String base, String target) {

        if (base.equalsIgnoreCase(target)) {
            return 1.0;
        }

        // try primary API first
        try {
            double rate = primaryClient.getPairRate(base, target);
            log.info("FX rate fetched from PRIMARY API: {} -> {}", base, target);
            return rate;

        } catch (Exception e) {
            log.warn("Primary FX API failed: {} -> {}, switching to fallback", base, target);
        }

        // try fallback API if primary fails
        try {
            double rate = fallbackClient.getRate(base, target);
            log.info("FX rate fetched from FALLBACK API: {} -> {}", base, target);
            return rate;

        } catch (Exception e) {
            log.error("Fallback FX API also failed: {} -> {}", base, target);
            throw new IllegalStateException("All currency providers failed");
        }
    }
}