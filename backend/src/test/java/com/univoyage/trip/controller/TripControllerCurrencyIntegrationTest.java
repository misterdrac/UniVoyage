package com.univoyage.trip.controller;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.currency.CurrencyRateService;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link TripController#getCurrency(Long)}.
 * <p>
 * Hits the real web layer and persistence; {@link com.univoyage.currency.CurrencyRateService} and
 * {@link CurrentUser} are mocked to avoid external FX calls and to control the authenticated user id.
 * Servlet filters are disabled so JWT/CSRF do not affect assertions.
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class TripControllerCurrencyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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

    @MockBean
    private CurrentUser currentUser;

    /**
     * Happy path: user's home country currency is the FX base; destination country's currency and
     * mocked rate appear under {@code data.currency}.
     */
    @Test
    @DisplayName("Trip currency endpoint returns correct payload for owned trip")
    void shouldReturnCurrencyPayloadWhenTripBelongsToCurrentUser() throws Exception {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        Country japan = saveCountry("JP", "Japan", "JPY", "Japanese Yen");
        UserEntity user = saveUser("owner@mail.com", croatia);

        DestinationEntity destination = saveDestination("Tokyo", "Tokyo", "Asia", japan);
        TripEntity trip = saveTrip(user.getId(), destination);
        when(currentUser.id()).thenReturn(user.getId());
        when(currencyRateService.getRate("EUR", "JPY")).thenReturn(162.45);

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyCode").value("JPY"))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyName").value("Japanese Yen"))
                .andExpect(jsonPath("$.data.currency.baseCurrencyCode").value("EUR"))
                .andExpect(jsonPath("$.data.currency.exchangeRate").value(162.45));
    }

    /**
     * When {@link UserEntity#getCountry()} is null, base currency defaults to EUR and the rate call
     * uses EUR as the from-currency.
     */
    @Test
    @DisplayName("Trip currency endpoint falls back to EUR when user has no country")
    void shouldFallbackToEurWhenUserCountryIsMissing() throws Exception {
        Country uk = saveCountry("GB", "United Kingdom", "GBP", "British Pound");
        UserEntity user = saveUser("no-country@mail.com", null);
        DestinationEntity destination = saveDestination("London", "London", "Europe", uk);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());
        when(currencyRateService.getRate("EUR", "GBP")).thenReturn(0.86);

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyCode").value("GBP"))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyName").value("British Pound"))
                .andExpect(jsonPath("$.data.currency.baseCurrencyCode").value("EUR"))
                .andExpect(jsonPath("$.data.currency.exchangeRate").value(0.86));
    }

    /**
     * Blank destination country currency code yields {@link IllegalStateException}, mapped by
     * {@link com.univoyage.exception.GlobalExceptionHandler} to HTTP 500 with a stable message.
     */
    @Test
    @DisplayName("Trip currency endpoint returns 500 when destination currency is not configured")
    void shouldReturn500WhenDestinationCurrencyIsNotConfigured() throws Exception {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        Country invalidDestinationCountry = saveCountry("ZZ", "Nowhere", "", "Unknown Currency");

        UserEntity user = saveUser("blank-destination-currency@mail.com", croatia);
        DestinationEntity destination = saveDestination("Mystery", "Unknown", "Europe", invalidDestinationCountry);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Destination country currency is not configured"));
    }

    /**
     * Missing trip id returns HTTP 404 ({@code Trip not found}) via global exception handling.
     */
    @Test
    @DisplayName("Trip currency endpoint returns 404 when trip does not exist")
    void shouldReturn404WhenTripDoesNotExist() throws Exception {
        when(currentUser.id()).thenReturn(100L);

        mockMvc.perform(get("/api/trips/{tripId}/currency", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Ownership mismatch is intentionally surfaced as {@code Trip not found} (no leak that the id exists).
     */
    @Test
    @DisplayName("Trip currency endpoint returns 404 when trip is not owned by current user")
    void shouldReturn404WhenTripIsNotOwnedByCurrentUser() throws Exception {
        Country croatia = saveCountry("HR", "Croatia", "EUR", "Euro");
        UserEntity owner = saveUser("owner-2@mail.com", croatia);
        UserEntity attacker = saveUser("attacker-2@mail.com", croatia);

        // Destination details are required to persist the trip, but they won't be used
        // because TripCurrencyService fails fast on ownership mismatch.
        DestinationEntity destination = saveDestination("Zagreb", "Zagreb", "Europe", croatia);
        TripEntity trip = saveTrip(owner.getId(), destination);

        when(currentUser.id()).thenReturn(attacker.getId());

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * User's home country currency (e.g. USD) becomes the FX base when present; rate service is called
     * with that base code.
     */
    @Test
    @DisplayName("Trip currency uses user home currency as base when not EUR")
    void shouldUseUserHomeCurrencyAsBaseWhenNotEur() throws Exception {
        Country us = countryRepository.findByIsoCode("US")
                .orElseThrow(() -> new IllegalStateException("Seed country US required"));
        Country jp = countryRepository.findByIsoCode("JP")
                .orElseThrow(() -> new IllegalStateException("Seed country JP required"));

        UserEntity user = saveUser("usdhome@mail.com", us);
        DestinationEntity destination = saveDestination("OsakaFx", "Osaka", "Asia", jp);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());
        when(currencyRateService.getRate("USD", "JPY")).thenReturn(150.25);

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currency.baseCurrencyCode").value("USD"))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyCode").value("JPY"))
                .andExpect(jsonPath("$.data.currency.exchangeRate").value(150.25));
    }

    /**
     * Unchecked failures from {@link CurrencyRateService} propagate (HTTP 500) unless mapped elsewhere.
     */
    @Test
    @DisplayName("Trip currency returns 500 when FX service throws")
    void shouldReturn500WhenFxServiceThrows() throws Exception {
        Country croatia = saveCountry("H2", "CroatiaTest2", "EUR", "Euro");
        Country japan = saveCountry("J2", "JapanTest2", "JPY", "Japanese Yen");
        UserEntity user = saveUser("fxfail@mail.com", croatia);
        DestinationEntity destination = saveDestination("FxFailTokyo", "Tokyo", "Asia", japan);
        TripEntity trip = saveTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());
        when(currencyRateService.getRate(anyString(), anyString()))
                .thenThrow(new IllegalStateException("FX provider unavailable"));

        mockMvc.perform(get("/api/trips/{tripId}/currency", trip.getId()))
                .andExpect(status().isInternalServerError());
    }

    /** Persists a {@link Country} row for test isolation (use rare ISO codes when needed). */
    private Country saveCountry(String isoCode, String countryName, String currencyCode, String currencyName) {
        Country country = Country.builder()
                .isoCode(isoCode)
                .countryName(countryName)
                .currencyCode(currencyCode)
                .currencyName(currencyName)
                .build();

        return countryRepository.save(country);
    }

    /** Creates a user; {@code country} may be {@code null} to exercise EUR fallback. */
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

    /** Persists a destination linked to the given country. */
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

    /** Persists a trip owned by {@code userId} toward {@code destination}. */
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

