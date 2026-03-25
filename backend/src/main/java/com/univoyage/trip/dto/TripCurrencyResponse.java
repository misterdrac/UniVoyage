package com.univoyage.trip.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TripCurrencyResponse {
    private final String destinationCurrencyCode;
    private final String destinationCurrencyName;
    private final double exchangeRate;
    private final String baseCurrencyCode;
}
