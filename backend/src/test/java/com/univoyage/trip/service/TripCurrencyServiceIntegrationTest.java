package com.univoyage.trip.service;

import com.univoyage.currency   .CurrencyRateService;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Integration tests for TripCurrencyService.
 * These tests verify database interaction, ownership checks, fallback behavior, and response mapping.
 */
@SpringBootTest
@Transactional
class TripCurrencyServiceIntegrationTest {

    @Autowired
    private TripCurrencyService tripCurrencyService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CountryRepository countryRepository;

    @MockBean
    private CurrencyRateService currencyRateService;

    @Test
    @DisplayName("Should return mapped currency response for owned trip")
    void shouldReturnMappedCurrencyResponseForOwnedTrip() {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        Country japan = saveCountry("JP", "Japan", "JPY", "Japanese Yen");

        UserEntity user = saveUser("owner@mail.com", croatia);
        DestinationEntity destination = saveDestination("Tokyo", "Tokyo", "Asia", japan);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currencyRateService.getRate("EUR", "JPY")).thenReturn(162.45);

        TripCurrencyResponse response = tripCurrencyService.getTripCurrency(user.getId(), trip.getId());

        assertNotNull(response);
        assertEquals("JPY", response.getDestinationCurrencyCode());
        assertEquals("Japanese Yen", response.getDestinationCurrencyName());
        assertEquals("EUR", response.getBaseCurrencyCode());
        assertEquals(162.45, response.getExchangeRate());
    }

    @Test
    @DisplayName("Should throw when trip does not exist")
    void shouldThrowWhenTripDoesNotExist() {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        UserEntity user = saveUser("missing-trip@mail.com", croatia);

        assertThrows(
                ResourceNotFoundException.class,
                () -> tripCurrencyService.getTripCurrency(user.getId(), 999999L)
        );
    }

    @Test
    @DisplayName("Should throw when user tries to access another user's trip")
    void shouldThrowWhenUserTriesToAccessAnotherUsersTrip() {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        Country japan = saveCountry("JP", "Japan", "JPY", "Japanese Yen");

        UserEntity owner = saveUser("owner-foreign@mail.com", croatia);
        UserEntity anotherUser = saveUser("attacker@mail.com", croatia);

        DestinationEntity destination = saveDestination("Kyoto", "Kyoto", "Asia", japan);
        TripEntity trip = saveTrip(owner.getId(), destination);

        assertThrows(
                ResourceNotFoundException.class,
                () -> tripCurrencyService.getTripCurrency(anotherUser.getId(), trip.getId())
        );
    }

    @Test
    @DisplayName("Should fallback to EUR when user country is missing")
    void shouldFallbackToEurWhenUserCountryIsMissing() {
        Country uk = saveCountry("GB", "United Kingdom", "GBP", "British Pound");

        UserEntity user = saveUser("no-country@mail.com", null);
        DestinationEntity destination = saveDestination("London", "London", "Europe", uk);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currencyRateService.getRate("EUR", "GBP")).thenReturn(0.86);

        TripCurrencyResponse response = tripCurrencyService.getTripCurrency(user.getId(), trip.getId());

        assertNotNull(response);
        assertEquals("EUR", response.getBaseCurrencyCode());
        assertEquals("GBP", response.getDestinationCurrencyCode());
        assertEquals("British Pound", response.getDestinationCurrencyName());
        assertEquals(0.86, response.getExchangeRate());
    }

    @Test
    @DisplayName("Should throw when destination currency code is blank")
    void shouldThrowWhenDestinationCurrencyCodeIsBlank() {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        Country invalidCountry = saveCountry("ZZ", "Nowhere", "", "Unknown Currency");

        UserEntity user = saveUser("blank-currency@mail.com", croatia);
        DestinationEntity destination = saveDestination("Mystery", "Unknown", "Europe", invalidCountry);
        TripEntity trip = saveTrip(user.getId(), destination);

        assertThrows(
                IllegalStateException.class,
                () -> tripCurrencyService.getTripCurrency(user.getId(), trip.getId())
        );
    }

    private Country saveCountry(String isoCode, String countryName, String currencyCode, String currencyName) {
        Country country = Country.builder()
                .isoCode(isoCode)
                .countryName(countryName)
                .currencyCode(currencyCode)
                .currencyName(currencyName)
                .build();

        return countryRepository.save(country);
    }

    private UserEntity saveUser(String email, Country country) {
        UserEntity user = UserEntity.builder()
                .name("Test")
                .surname("User")
                .email(email)
                .passwordHash("hashed-password")
                .country(country)
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    private DestinationEntity saveDestination(String name, String location, String continent, Country country) {
        DestinationEntity destination = DestinationEntity.builder()
                .name(name)
                .location(location)
                .continent(continent)
                .country(country)
                .imageUrl("https://example.com/image.jpg")
                .imageAlt("Test image")
                .overview("Test overview")
                .budgetPerDay(100)
                .whyVisit("Test reason")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return destinationRepository.save(destination);
    }

    private TripEntity saveTrip(Long userId, DestinationEntity destination) {
        TripEntity trip = TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(15))
                .status("PLANNED")
                .createdAt(Instant.now())
                .build();

        return tripRepository.save(trip);
    }
}