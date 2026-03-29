package com.univoyage.trip.service;

import com.univoyage.currency.CurrencyRateService;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Integration tests for {@link TripCurrencyService} against a real test database.
 * <p>
 * {@link CurrencyRateService} is mocked so tests do not call external exchange-rate APIs.
 * Verifies ownership checks, EUR fallback when the user has no home country, and error paths that
 * align with {@link com.univoyage.exception.ResourceNotFoundException} and
 * {@link IllegalStateException} semantics used by controllers and {@code @ControllerAdvice}.
 * </p>
 */
@SpringBootTest
@ActiveProfiles("test")
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

    /**
     * End-to-end service call: loads trip, user, countries from JPA and builds {@link TripCurrencyResponse}
     * using mocked FX rate {@code EUR → JPY}.
     */
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

    /**
     * Missing trip id must throw {@link ResourceNotFoundException} (same type the REST layer maps to 404).
     */
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

    /**
     * Cross-user access attempt must not leak existence; service throws {@link ResourceNotFoundException}.
     */
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

    /**
     * Null user country implies base currency EUR and a rate request from EUR to the destination currency.
     */
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

    /**
     * Empty destination {@link Country#getCurrencyCode()} is a configuration error; expect {@link IllegalStateException}.
     */
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

    /**
     * When the user's country currency is USD (seeded {@code US}), the FX pair uses USD as the base, not EUR.
     */
    @Test
    @DisplayName("Should use USD as base when user home country is United States")
    void shouldUseUsdAsBaseForUsResident() {
        Country us = countryRepository.findByIsoCode("US")
                .orElseThrow(() -> new IllegalStateException("Seed US required"));
        Country jp = countryRepository.findByIsoCode("JP")
                .orElseThrow(() -> new IllegalStateException("Seed JP required"));

        UserEntity user = saveUser("us-resident@mail.com", us);
        DestinationEntity destination = saveDestination("UsdBaseKyoto", "Kyoto", "Asia", jp);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currencyRateService.getRate("USD", "JPY")).thenReturn(155.0);

        TripCurrencyResponse response = tripCurrencyService.getTripCurrency(user.getId(), trip.getId());

        assertEquals("USD", response.getBaseCurrencyCode());
        assertEquals("JPY", response.getDestinationCurrencyCode());
        assertEquals(155.0, response.getExchangeRate());
    }

    /**
     * Failures from {@link CurrencyRateService} are not swallowed; they propagate to the caller.
     */
    @Test
    @DisplayName("Should propagate exception when currency rate service fails")
    void shouldPropagateCurrencyRateServiceFailure() {
        Country croatia = saveCountry("H3", "CroatiaFx3", "EUR", "Euro");
        Country japan = saveCountry("J3", "JapanFx3", "JPY", "Japanese Yen");

        UserEntity user = saveUser("fx-prop@mail.com", croatia);
        DestinationEntity destination = saveDestination("FxPropOsaka", "Osaka", "Asia", japan);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currencyRateService.getRate(anyString(), anyString()))
                .thenThrow(new IllegalStateException("provider timeout"));

        assertThrows(
                IllegalStateException.class,
                () -> tripCurrencyService.getTripCurrency(user.getId(), trip.getId())
        );
    }

    /** Inserts a country row for test data (avoid collisions with Flyway seeds when possible). */
    private Country saveCountry(String isoCode, String countryName, String currencyCode, String currencyName) {
        Country country = Country.builder()
                .isoCode(isoCode)
                .countryName(countryName)
                .currencyCode(currencyCode)
                .currencyName(currencyName)
                .build();

        return countryRepository.save(country);
    }

    /** Persists a user; {@code country} may be {@code null}. */
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

    /** Persists a destination for the given country. */
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

    /** Persists a trip for {@code userId} to {@code destination}. */
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