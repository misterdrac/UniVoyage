package com.univoyage.currency.service;

import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.exception.UnprocessableEntityException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TripCurrencyServiceTest {

    @Mock
    private TripRepository tripRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CachedExchangeRateService cachedExchangeRateService;

    @InjectMocks
    private TripCurrencyService tripCurrencyService;

    @Test
    void getTripCurrency_throwsWhenTripNotFound() {
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripCurrencyService.getTripCurrency(1L, 9L));
    }

    @Test
    void getTripCurrency_throwsWhenUserNotFound() {
        TripEntity trip = tripWithDestination(country("FR", "EUR", "Euro"), 1L);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripCurrencyService.getTripCurrency(1L, 9L));
    }

    @Test
    void getTripCurrency_throwsWhenDestinationHasNoCountry() {
        DestinationEntity dest = new DestinationEntity();
        dest.setCountry(null);
        TripEntity trip = baseTrip(1L, dest);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new UserEntity()));

        assertThrows(UnprocessableEntityException.class, () -> tripCurrencyService.getTripCurrency(1L, 9L));
    }

    @Test
    void getTripCurrency_throwsWhenCountryHasNoCurrencyCode() {
        TripEntity trip = tripWithDestination(country("XX", null, null), 1L);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new UserEntity()));

        assertThrows(UnprocessableEntityException.class, () -> tripCurrencyService.getTripCurrency(1L, 9L));
    }

    @Test
    void getTripCurrency_usesRateOneWhenBaseEqualsDestination() {
        Country destC = country("FR", "EUR", "Euro");
        Country home = country("DE", "EUR", "Euro");
        UserEntity user = new UserEntity();
        user.setCountry(home);

        TripEntity trip = tripWithDestination(destC, 1L);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        var res = tripCurrencyService.getTripCurrency(1L, 9L);

        assertThat(res.getExchangeRate()).isEqualTo(1.0);
        assertThat(res.getBaseCurrencyCode()).isEqualTo("EUR");
        assertThat(res.getDestinationCurrencyCode()).isEqualTo("EUR");
        verify(cachedExchangeRateService, never()).getConversionRate(anyString(), anyString());
    }

    @Test
    void getTripCurrency_defaultsBaseToEurWhenUserHasNoHomeCurrency() {
        Country destC = country("JP", "JPY", "Japanese yen");
        UserEntity user = new UserEntity();
        user.setCountry(null);

        TripEntity trip = tripWithDestination(destC, 1L);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cachedExchangeRateService.getConversionRate("EUR", "JPY")).thenReturn(160.5);

        var res = tripCurrencyService.getTripCurrency(1L, 9L);

        assertThat(res.getBaseCurrencyCode()).isEqualTo("EUR");
        assertThat(res.getDestinationCurrencyCode()).isEqualTo("JPY");
        assertThat(res.getExchangeRate()).isEqualTo(160.5);
        verify(cachedExchangeRateService).getConversionRate("EUR", "JPY");
    }

    @Test
    void getTripCurrency_callsFxWhenHomeAndDestinationDiffer() {
        Country destC = country("JP", "JPY", "Japanese yen");
        Country home = country("US", "USD", "US Dollar");
        UserEntity user = new UserEntity();
        user.setCountry(home);

        TripEntity trip = tripWithDestination(destC, 1L);
        when(tripRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cachedExchangeRateService.getConversionRate("USD", "JPY")).thenReturn(150.0);

        var res = tripCurrencyService.getTripCurrency(1L, 9L);

        assertThat(res.getBaseCurrencyCode()).isEqualTo("USD");
        assertThat(res.getExchangeRate()).isEqualTo(150.0);
        verify(cachedExchangeRateService).getConversionRate("USD", "JPY");
    }

    private static Country country(String iso, String ccy, String name) {
        return Country.builder()
                .isoCode(iso)
                .countryName("n")
                .currencyCode(ccy)
                .currencyName(name)
                .build();
    }

    private static TripEntity tripWithDestination(Country destCountry, long userId) {
        DestinationEntity dest = new DestinationEntity();
        dest.setCountry(destCountry);
        return baseTrip(userId, dest);
    }

    private static TripEntity baseTrip(long userId, DestinationEntity dest) {
        return TripEntity.builder()
                .id(9L)
                .userId(userId)
                .destination(dest)
                .departureDate(LocalDate.of(2025, 6, 1))
                .returnDate(LocalDate.of(2025, 6, 10))
                .status("planned")
                .createdAt(Instant.parse("2025-01-01T12:00:00Z"))
                .build();
    }
}
