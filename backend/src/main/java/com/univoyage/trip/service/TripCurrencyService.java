package com.univoyage.trip.service;

import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import com.univoyage.reference.country.model.Country;
import com.univoyage.common.exception.ResourceNotFoundException;
import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.trip.model.Trip;
import com.univoyage.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TripCurrencyService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExchangeRateApiClient exchangeRateApiClient;

    @Transactional(readOnly = true)
    public TripCurrencyResponse getTripCurrency(Long userId, Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Trip not found");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Country destinationCountry = resolveDestinationCountry(trip);
        if (destinationCountry == null) {
            throw new IllegalStateException("Trip destination country is not set");
        }

        String destinationCurrencyCode = destinationCountry.getCurrencyCode();
        String destinationCurrencyName = destinationCountry.getCurrencyName();

        if (destinationCurrencyCode == null || destinationCurrencyCode.isBlank()) {
            throw new IllegalStateException(
                    "Destination country has no currency configured: " + destinationCountry.getIsoCode()
            );
        }

        String baseCurrencyCode = "EUR";
        if (user.getCountry() != null
                && user.getCountry().getCurrencyCode() != null
                && !user.getCountry().getCurrencyCode().isBlank()) {
            baseCurrencyCode = user.getCountry().getCurrencyCode();
        }

        double rate = baseCurrencyCode.equalsIgnoreCase(destinationCurrencyCode)
                ? 1.0
                : exchangeRateApiClient.getPairRate(baseCurrencyCode, destinationCurrencyCode);

        return TripCurrencyResponse.builder()
                .destinationCurrencyCode(destinationCurrencyCode)
                .destinationCurrencyName(destinationCurrencyName)
                .exchangeRate(rate)
                .baseCurrencyCode(baseCurrencyCode)
                .build();
    }

    private Country resolveDestinationCountry(Trip trip) {
        // Adapt this to your actual trip model.

        // Option A:
        // return trip.getDestination().getCountry();

        // Option B:
        // String countryCode = trip.getDestinationCountryCode();
        // return countryRepository.findByIsoCode(countryCode).orElseThrow(...);

        return trip.getDestination().getCountry();
    }
}