package com.univoyage.currency.service;

import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.exception.UnprocessableEntityException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TripCurrencyService {

    private static final String EUR = "EUR";

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final CachedExchangeRateService cachedExchangeRateService;

    @Transactional(readOnly = true)
    public TripCurrencyResponse getTripCurrency(Long userId, Long tripId) {
        TripEntity trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Country destCountry = trip.getDestination().getCountry();
        if (destCountry == null) {
            throw new UnprocessableEntityException(
                    "Destination is not linked to a country; set country on the destination to use currency."
            );
        }
        String destCcy = destCountry.getCurrencyCode();
        String destName = destCountry.getCurrencyName();
        if (destCcy == null || destCcy.isBlank()) {
            throw new UnprocessableEntityException(
                    "No currency configured for country: " + destCountry.getIsoCode()
            );
        }
        destCcy = destCcy.trim().toUpperCase();

        String baseCcy = EUR;
        if (user.getCountry() != null
                && user.getCountry().getCurrencyCode() != null
                && !user.getCountry().getCurrencyCode().isBlank()) {
            baseCcy = user.getCountry().getCurrencyCode().trim().toUpperCase();
        }

        double rate = baseCcy.equals(destCcy)
                ? 1.0
                : cachedExchangeRateService.getConversionRate(baseCcy, destCcy);

        return TripCurrencyResponse.builder()
                .destinationCurrencyCode(destCcy)
                .destinationCurrencyName(destName != null ? destName : destCcy)
                .exchangeRate(rate)
                .baseCurrencyCode(baseCcy)
                .build();
    }
}
