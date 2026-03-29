package com.univoyage.trip.service;

import com.univoyage.currency.CurrencyRateService;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TripCurrencyServiceBranchCoverageTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrencyRateService currencyRateService;

    @InjectMocks
    private TripCurrencyService tripCurrencyService;

    @Test
    @DisplayName("Throws 404 when destination country is null")
    void shouldThrowDestinationCountryNotFoundWhenTripDestinationCountryIsNull() {
        Long tripId = 10L;
        Long userId = 1L;

        TripEntity trip = org.mockito.Mockito.mock(TripEntity.class);
        DestinationEntity destination = org.mockito.Mockito.mock(DestinationEntity.class);

        UserEntity user = UserEntity.builder()
                .name("Test")
                .surname("User")
                .email("user@mail.com")
                .passwordHash("hashed")
                .role(Role.USER)
                .build();

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(trip.getUserId()).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        when(trip.getDestination()).thenReturn(destination);
        when(destination.getCountry()).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> tripCurrencyService.getTripCurrency(userId, tripId)
        );
        assertEquals("Destination country not found", ex.getMessage());
    }

    @Test
    @DisplayName("Throws 404 when user is missing")
    void shouldThrowUserNotFoundWhenUserDoesNotExist() {
        Long tripId = 11L;
        Long userId = 2L;

        TripEntity trip = org.mockito.Mockito.mock(TripEntity.class);

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(trip.getUserId()).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> tripCurrencyService.getTripCurrency(userId, tripId)
        );
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("Throws 500 when destination currency code is blank")
    void shouldThrowIllegalStateWhenDestinationCurrencyCodeBlank() {
        Long tripId = 12L;
        Long userId = 3L;

        TripEntity trip = org.mockito.Mockito.mock(TripEntity.class);
        DestinationEntity destination = org.mockito.Mockito.mock(DestinationEntity.class);

        UserEntity user = UserEntity.builder()
                .name("Test")
                .surname("User")
                .email("user2@mail.com")
                .passwordHash("hashed")
                .role(Role.USER)
                .build();

        Country destinationCountry = Country.builder()
                .isoCode("ZZ")
                .countryName("Nowhere")
                .currencyCode("")
                .currencyName("Unknown Currency")
                .build();

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(trip.getUserId()).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(trip.getDestination()).thenReturn(destination);
        when(destination.getCountry()).thenReturn(destinationCountry);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> tripCurrencyService.getTripCurrency(userId, tripId)
        );
        assertEquals("Destination country currency is not configured", ex.getMessage());
    }
}

