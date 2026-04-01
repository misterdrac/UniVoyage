package com.univoyage.trip.controller;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.auth.security.JwtAuthenticationFilter;
import com.univoyage.exception.GlobalExceptionHandler;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.trip.service.TripCurrencyService;
import com.univoyage.trip.service.TripService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer tests for the trip currency tab endpoint with heavy dependencies stubbed.
 * <p>
 * Loads a slice of the full application ({@link SpringBootTest}) but replaces
 * {@link TripCurrencyService}, {@link TripService}, {@link CurrentUser}, and
 * {@link JwtAuthenticationFilter} with Mockito beans so the test does not touch JPA or security
 * filter behavior. {@link GlobalExceptionHandler} is imported explicitly so thrown domain exceptions
 * map to the same HTTP status codes as in production.
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import(GlobalExceptionHandler.class)
class TripControllerCurrencyWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TripCurrencyService tripCurrencyService;

    @MockitoBean
    private TripService tripService;

    @MockitoBean
    private CurrentUser currentUser;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * When the service returns a {@link TripCurrencyResponse}, the controller wraps it as
     * {@code data.currency} with HTTP 200.
     */
    @Test
    @DisplayName("Should return currency payload when request is valid")
    void shouldReturnCurrencyPayloadWhenRequestIsValid() throws Exception {
        Long userId = 10L;
        Long tripId = 25L;

        TripCurrencyResponse response = new TripCurrencyResponse(
                "JPY",
                "Japanese Yen",
                "EUR",
                162.45
        );

        when(currentUser.id()).thenReturn(userId);
        when(tripCurrencyService.getTripCurrency(userId, tripId)).thenReturn(response);

        mockMvc.perform(get("/api/trips/{tripId}/currency", tripId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyCode").value("JPY"))
                .andExpect(jsonPath("$.data.currency.destinationCurrencyName").value("Japanese Yen"))
                .andExpect(jsonPath("$.data.currency.baseCurrencyCode").value("EUR"))
                .andExpect(jsonPath("$.data.currency.exchangeRate").value(162.45));
    }

    /**
     * {@link ResourceNotFoundException} from the service must produce HTTP 404 through
     * {@link GlobalExceptionHandler}.
     */
    @Test
    @DisplayName("Should return 404 when trip is not found")
    void shouldReturn404WhenTripIsNotFound() throws Exception {
        Long userId = 10L;
        Long tripId = 999L;

        when(currentUser.id()).thenReturn(userId);
        when(tripCurrencyService.getTripCurrency(userId, tripId))
                .thenThrow(new ResourceNotFoundException("Trip not found"));

        mockMvc.perform(get("/api/trips/{tripId}/currency", tripId))
                .andExpect(status().isNotFound());
    }

    /**
     * {@link IllegalStateException} from the service (misconfigured destination currency) maps to HTTP 500.
     */
    @Test
    @DisplayName("Should return 500 when destination currency is not configured")
    void shouldReturn500WhenDestinationCurrencyIsNotConfigured() throws Exception {
        Long userId = 10L;
        Long tripId = 25L;

        when(currentUser.id()).thenReturn(userId);
        when(tripCurrencyService.getTripCurrency(userId, tripId))
                .thenThrow(new IllegalStateException("Destination country currency is not configured"));

        mockMvc.perform(get("/api/trips/{tripId}/currency", tripId))
                .andExpect(status().isInternalServerError());
    }

    /**
     * Generic {@link RuntimeException} from the service is not mapped by {@link GlobalExceptionHandler},
     * so the dispatcher wraps it in {@link ServletException}.
     */
    @Test
    @DisplayName("Should propagate ServletException when service throws generic RuntimeException")
    void shouldPropagateWhenServiceThrowsRuntimeException() throws Exception {
        Long userId = 10L;
        Long tripId = 25L;

        when(currentUser.id()).thenReturn(userId);
        when(tripCurrencyService.getTripCurrency(userId, tripId))
                .thenThrow(new RuntimeException("unexpected"));

        assertThrows(ServletException.class, () -> mockMvc.perform(get("/api/trips/{tripId}/currency", tripId)));
    }
}