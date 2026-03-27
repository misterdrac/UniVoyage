package com.univoyage.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCurrencyResponse {
    private String destinationCurrencyCode;
    private String destinationCurrencyName;
    private String baseCurrencyCode;
    private Double exchangeRate;
}