package com.univoyage.trip.service;

import com.univoyage.currency.CurrencyRateService;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class TripCurrencyService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final CurrencyRateService currencyRateService;

    @Transactional(readOnly = true)
    public TripCurrencyResponse getTripCurrency(Long userId, Long tripId) {
        long startedAt = System.currentTimeMillis();

        log.info("Fetching currency for tripId={} userId={}", tripId, userId);

        TripEntity trip = tripRepository.findById(tripId)
                .orElseThrow(() -> {
                    log.warn("Trip not found: tripId={}", tripId);
                    return new ResourceNotFoundException("Trip not found");
                });

        if (!trip.getUserId().equals(userId)) {
            log.warn("Unauthorized access: tripId={} userId={}", tripId, userId);
            throw new ResourceNotFoundException("Trip not found");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found: userId={}", userId);
                    return new ResourceNotFoundException("User not found");
                });

        Country destinationCountry = trip.getDestination().getCountry();

        if (destinationCountry == null) {
            log.error("Destination country missing for tripId={}", tripId);
            throw new ResourceNotFoundException("Destination country not found");
        }

        String destinationCurrencyCode = destinationCountry.getCurrencyCode();
        String destinationCurrencyName = destinationCountry.getCurrencyName();
        log.debug(
                "Destination currency context resolved: tripId={} country={} currencyCode={} currencyName={}",
                tripId,
                destinationCountry.getIsoCode(),
                destinationCurrencyCode,
                destinationCurrencyName
        );

        if (destinationCurrencyCode == null || destinationCurrencyCode.isBlank()) {
            log.error("Currency not configured for country={}", destinationCountry.getIsoCode());
            throw new IllegalStateException("Destination country currency is not configured");
        }

        String baseCurrencyCode = "EUR";

        if (user.getCountry() != null && user.getCountry().getCurrencyCode() != null) {
            baseCurrencyCode = user.getCountry().getCurrencyCode();
            log.debug("Using user's country currency as base: userId={} baseCurrency={}", userId, baseCurrencyCode);
        } else {
            log.debug("User country/currency missing; defaulting base currency to EUR: userId={}", userId);
        }

        log.debug("Base currency={} Destination currency={}", baseCurrencyCode, destinationCurrencyCode);

        double exchangeRate = currencyRateService.getRate(baseCurrencyCode, destinationCurrencyCode);

        log.info("Computed FX rate: {} -> {} = {}", baseCurrencyCode, destinationCurrencyCode, exchangeRate);
        log.info(
                "Trip currency fetch completed: tripId={} userId={} durationMs={}",
                tripId,
                userId,
                (System.currentTimeMillis() - startedAt)
        );

        return
                TripCurrencyResponse.builder()
                .destinationCurrencyCode(destinationCurrencyCode)
                .destinationCurrencyName(destinationCurrencyName)
                .baseCurrencyCode(baseCurrencyCode)
                .exchangeRate(exchangeRate)
                .build();
    }
}