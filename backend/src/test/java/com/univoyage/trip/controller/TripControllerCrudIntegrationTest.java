package com.univoyage.trip.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.security.CurrentUser;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.anEmptyMap;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link TripController} trip CRUD, budget, itinerary, and accommodation endpoints.
 * <p>
 * Servlet filters are disabled to focus on controller and service integration; the authenticated
 * user is supplied via a {@link org.springframework.boot.test.mock.mockito.MockBean @MockBean}
 * {@link CurrentUser}. Countries are loaded from Flyway-seeded data ({@link #country(String)}).
 * Each test runs in a transaction that rolls back, keeping the shared test database clean.
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class TripControllerCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TripRepository tripRepository;

    @MockBean
    private CurrentUser currentUser;

    /**
     * {@code POST /api/trips} persists a trip for the mocked current user and echoes destination id
     * in the JSON payload; repository state is asserted after the request.
     */
    @Test
    @DisplayName("POST /api/trips creates trip for current user")
    void createTrip() throws Exception {
        UserEntity user = saveUser("trip-create@example.com");
        DestinationEntity dest = saveDestination("TripCreateCity", country("FR"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", LocalDate.now().plusDays(5).toString(),
                                "returnDate", LocalDate.now().plusDays(12).toString()
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trip.destinationId").value(dest.getId().intValue()));

        List<TripEntity> trips = tripRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, trips.size());
        org.junit.jupiter.api.Assertions.assertEquals(dest.getId(), trips.getFirst().getDestination().getId());
    }

    /**
     * {@code GET /api/trips} must scope results to {@link CurrentUser#id()}; another user's trip
     * must not appear in the list.
     */
    @Test
    @DisplayName("GET /api/trips returns only trips for current user")
    void listTrips() throws Exception {
        Country fr = country("FR");
        UserEntity owner = saveUser("owner-list@example.com");
        UserEntity other = saveUser("other-list@example.com");
        DestinationEntity d1 = saveDestination("ListNice", fr);
        DestinationEntity d2 = saveDestination("ListLyon", fr);
        saveTrip(owner.getId(), d1);
        saveTrip(other.getId(), d2);

        when(currentUser.id()).thenReturn(owner.getId());

        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trips").isArray())
                .andExpect(jsonPath("$.data.trips.length()").value(1))
                .andExpect(jsonPath("$.data.trips[0].destinationName").value("ListNice"));
    }

    /**
     * Unknown {@code destinationId} should surface {@link com.univoyage.exception.ResourceNotFoundException}
     * as HTTP 404 with message {@code Destination not found}.
     */
    @Test
    @DisplayName("POST /api/trips returns 404 when destination does not exist")
    void createTripUnknownDestination() throws Exception {
        UserEntity user = saveUser("nodest@example.com");
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", 999_999L,
                                "departureDate", LocalDate.now().plusDays(1).toString(),
                                "returnDate", LocalDate.now().plusDays(3).toString()
                        ))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Destination not found"));
    }

    /**
     * Owner can delete their trip; row must disappear from {@link TripRepository}.
     */
    @Test
    @DisplayName("DELETE /api/trips/{id} removes owned trip")
    void deleteTrip() throws Exception {
        UserEntity user = saveUser("delete-trip@example.com");
        DestinationEntity dest = saveDestination("DelBerlin", country("DE"));
        TripEntity trip = saveTrip(user.getId(), dest);
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(delete("/api/trips/{tripId}", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        org.junit.jupiter.api.Assertions.assertTrue(tripRepository.findById(trip.getId()).isEmpty());
    }

    /**
     * Budget JSON is stored via {@code PUT} and read back with {@code GET}; asserts nested fields
     * in {@code data.budget}.
     */
    @Test
    @DisplayName("PUT and GET /api/trips/{id}/budget round-trip")
    void budgetRoundTrip() throws Exception {
        UserEntity user = saveUser("budget@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("BudgetRome", country("IT")));
        when(currentUser.id()).thenReturn(user.getId());

        Map<String, Object> payload = Map.of("total", 1200, "currency", "EUR");

        mockMvc.perform(put("/api/trips/{tripId}/budget", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/trips/{tripId}/budget", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.budget.total").value(1200))
                .andExpect(jsonPath("$.data.budget.currency").value("EUR"));
    }

    /**
     * Itinerary payload round-trip through PUT/GET; verifies array content survives persistence.
     */
    @Test
    @DisplayName("PUT and GET /api/trips/{id}/itinerary round-trip")
    void itineraryRoundTrip() throws Exception {
        UserEntity user = saveUser("itin@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("ItinVienna", country("AT")));
        when(currentUser.id()).thenReturn(user.getId());

        Map<String, Object> payload = Map.of("days", List.of(Map.of("day", 1, "note", "Arrival")));

        mockMvc.perform(put("/api/trips/{tripId}/itinerary", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/trips/{tripId}/itinerary", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.itinerary.days").isArray())
                .andExpect(jsonPath("$.data.itinerary.days[0].day").value(1));
    }

    /**
     * Non-owner must receive 404 ({@code Trip not found}) and the trip row must remain (no orphan delete).
     */
    @Test
    @DisplayName("DELETE /api/trips/{id} returns 404 when trip belongs to another user")
    void deleteTripNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-del@example.com");
        UserEntity attacker = saveUser("attacker-del@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("DelPrague", country("CZ")));
        when(currentUser.id()).thenReturn(attacker.getId());

        mockMvc.perform(delete("/api/trips/{tripId}", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));

        org.junit.jupiter.api.Assertions.assertTrue(tripRepository.findById(trip.getId()).isPresent());
    }

    /**
     * New user with no trips receives an empty {@code trips} array (not null).
     */
    @Test
    @DisplayName("GET /api/trips returns empty list when user has no trips")
    void listTripsEmpty() throws Exception {
        UserEntity user = saveUser("empty-trips@example.com");
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trips").isArray())
                .andExpect(jsonPath("$.data.trips.length()").value(0));
    }

    /**
     * {@link com.univoyage.trip.dto.CreateTripRequest} validation: {@code destinationId} must be non-null.
     */
    @Test
    @DisplayName("POST /api/trips returns 400 when destinationId is null")
    void createTripNullDestinationId() throws Exception {
        UserEntity user = saveUser("null-dest@example.com");
        when(currentUser.id()).thenReturn(user.getId());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("destinationId", null);
        body.put("departureDate", LocalDate.now().plusDays(1).toString());
        body.put("returnDate", LocalDate.now().plusDays(3).toString());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Missing required date field triggers bean validation (HTTP 400).
     */
    @Test
    @DisplayName("POST /api/trips returns 400 when returnDate is missing")
    void createTripMissingReturnDate() throws Exception {
        UserEntity user = saveUser("missing-ret@example.com");
        DestinationEntity dest = saveDestination("ValMissingRet", country("NL"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", LocalDate.now().plusDays(1).toString()
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Missing {@code departureDate} fails {@link jakarta.validation.constraints.NotBlank} / {@link jakarta.validation.constraints.NotNull}.
     */
    @Test
    @DisplayName("POST /api/trips returns 400 when departureDate is missing")
    void createTripMissingDepartureDate() throws Exception {
        UserEntity user = saveUser("missing-dep@example.com");
        DestinationEntity dest = saveDestination("ValMissingDep", country("CH"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "returnDate", LocalDate.now().plusDays(3).toString()
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.departureDate").exists());
    }

    /**
     * Blank {@code departureDate} fails bean validation ({@link jakarta.validation.constraints.NotBlank}).
     */
    @Test
    @DisplayName("POST /api/trips returns 400 when departureDate is blank")
    void createTripBlankDepartureDate() throws Exception {
        UserEntity user = saveUser("blank-dep@example.com");
        DestinationEntity dest = saveDestination("ValBlankDep", country("CH"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", "   ",
                                "returnDate", LocalDate.now().plusDays(3).toString()
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Blank {@code returnDate} fails bean validation ({@link jakarta.validation.constraints.NotBlank}).
     */
    @Test
    @DisplayName("POST /api/trips returns 400 when returnDate is blank")
    void createTripBlankReturnDate() throws Exception {
        UserEntity user = saveUser("blank-ret@example.com");
        DestinationEntity dest = saveDestination("ValBlankRet", country("LI"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", LocalDate.now().plusDays(1).toString(),
                                "returnDate", ""
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Non-ISO date strings cause {@link java.time.format.DateTimeParseException} in the service;
     * {@link com.univoyage.exception.GlobalExceptionHandler} returns generic 500 JSON (no message leak).
     */
    @Test
    @DisplayName("POST /api/trips returns 500 JSON when date format is invalid")
    void createTripInvalidDateFormat() throws Exception {
        UserEntity user = saveUser("bad-date@example.com");
        DestinationEntity dest = saveDestination("ValBadDate", country("BE"));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", "not-a-date",
                                "returnDate", LocalDate.now().plusDays(3).toString()
                        ))))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("An unexpected error occurred."));
    }

    /**
     * Database {@code trips_dates_chk} rejects {@code return_date < departure_date}; persistence failure is
     * mapped to generic 500 JSON by {@link com.univoyage.exception.GlobalExceptionHandler}.
     */
    @Test
    @DisplayName("POST /api/trips returns 500 JSON when return date is before departure date")
    void createTripReturnBeforeDeparture() throws Exception {
        UserEntity user = saveUser("date-order@example.com");
        DestinationEntity dest = saveDestination("ValDateOrder", country("SE"));
        when(currentUser.id()).thenReturn(user.getId());

        LocalDate d0 = LocalDate.now().plusDays(30);
        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "destinationId", dest.getId(),
                                "departureDate", d0.plusDays(5).toString(),
                                "returnDate", d0.toString()
                        ))))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("An unexpected error occurred."));
    }

    /**
     * {@code DELETE} for a non-existent id must yield 404.
     */
    @Test
    @DisplayName("DELETE /api/trips/{id} returns 404 when trip does not exist")
    void deleteTripNotFound() throws Exception {
        UserEntity user = saveUser("del-missing@example.com");
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(delete("/api/trips/{tripId}", 999_998L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Budget GET without prior PUT returns empty JSON object under {@code data.budget}.
     */
    @Test
    @DisplayName("GET /api/trips/{id}/budget returns empty object when no budget saved")
    void getBudgetWhenNoneStored() throws Exception {
        UserEntity user = saveUser("nobudget@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("NoBudgetCity", country("NO")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/budget", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.budget", anEmptyMap()));
    }

    /**
     * Non-owner cannot read another user's budget (same {@code Trip not found} semantics as other trip APIs).
     */
    @Test
    @DisplayName("GET /api/trips/{id}/budget returns 404 when trip is not owned")
    void getBudgetNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-budget@example.com");
        UserEntity other = saveUser("other-budget@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("BudgetOwn", country("PL")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(get("/api/trips/{tripId}/budget", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Non-owner cannot write budget JSON for another user's trip.
     */
    @Test
    @DisplayName("PUT /api/trips/{id}/budget returns 404 when trip is not owned")
    void putBudgetNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-putbud@example.com");
        UserEntity other = saveUser("other-putbud@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("PutBud", country("DK")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(put("/api/trips/{tripId}/budget", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("x", 1))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Itinerary GET for non-owner is forbidden via 404 trip semantics.
     */
    @Test
    @DisplayName("GET /api/trips/{id}/itinerary returns 404 when trip is not owned")
    void getItineraryNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-itin@example.com");
        UserEntity other = saveUser("other-itin@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("ItinOwn", country("FI")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(get("/api/trips/{tripId}/itinerary", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Non-owner cannot persist itinerary JSON for another user's trip.
     */
    @Test
    @DisplayName("PUT /api/trips/{id}/itinerary returns 404 when trip is not owned")
    void putItineraryNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-putitin@example.com");
        UserEntity other = saveUser("other-putitin@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("PutItin", country("SE")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(put("/api/trips/{tripId}/itinerary", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("days", List.of()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Itinerary GET without prior PUT returns empty JSON object under {@code data.itinerary}, matching budget semantics.
     */
    @Test
    @DisplayName("GET /api/trips/{id}/itinerary returns empty object when no itinerary saved")
    void getItineraryWhenNoneStored() throws Exception {
        UserEntity user = saveUser("noitinerary@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("NoItinCity", country("AT")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/itinerary", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.itinerary", anEmptyMap()));
    }

    /**
     * Accommodation PUT/GET round-trip for the trip owner.
     */
    @Test
    @DisplayName("PUT and GET /api/trips/{id}/accommodation round-trip")
    void accommodationRoundTrip() throws Exception {
        UserEntity user = saveUser("acc@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("AccCity", country("IE")));
        when(currentUser.id()).thenReturn(user.getId());

        Map<String, String> req = Map.of(
                "accommodationName", "Test Hotel",
                "accommodationAddress", "1 Main St",
                "accommodationPhone", "+1000000000"
        );

        mockMvc.perform(put("/api/trips/{tripId}/accommodation", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/trips/{tripId}/accommodation", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accommodation.accommodationName").value("Test Hotel"))
                .andExpect(jsonPath("$.data.accommodation.accommodationAddress").value("1 Main St"));
    }

    /**
     * Non-owner must not load accommodation for another user's trip.
     */
    @Test
    @DisplayName("GET /api/trips/{id}/accommodation returns 404 when trip is not owned")
    void getAccommodationNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-acc@example.com");
        UserEntity other = saveUser("other-acc@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("AccOwn", country("GR")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(get("/api/trips/{tripId}/accommodation", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    /**
     * Non-owner cannot persist accommodation for another user's trip.
     */
    @Test
    @DisplayName("PUT /api/trips/{id}/accommodation returns 404 when trip is not owned")
    void putAccommodationNotOwned() throws Exception {
        UserEntity owner = saveUser("owner-putacc@example.com");
        UserEntity other = saveUser("other-putacc@example.com");
        TripEntity trip = saveTrip(owner.getId(), saveDestination("PutAcc", country("BE")));
        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(put("/api/trips/{tripId}/accommodation", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "accommodationName", "H",
                                "accommodationAddress", "A",
                                "accommodationPhone", "P"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    @Test
    @DisplayName("PUT /api/trips/{id}/budget returns 400 and consistent error for malformed JSON")
    void putBudgetMalformedJson_returns400ConsistentError() throws Exception {
        UserEntity user = saveUser("bad-budget-json@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("BadBudgetJson", country("HU")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(put("/api/trips/{tripId}/budget", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"total\": 123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").isString());
    }

    @Test
    @DisplayName("PUT /api/trips/{id}/itinerary returns 400 and consistent error for malformed JSON")
    void putItineraryMalformedJson_returns400ConsistentError() throws Exception {
        UserEntity user = saveUser("bad-itinerary-json@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("BadItineraryJson", country("RO")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(put("/api/trips/{tripId}/itinerary", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"days\": [}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").isString());
    }

    @Test
    @DisplayName("PUT /api/trips/{id}/accommodation returns 400 when required fields are missing")
    void putAccommodationMissingRequiredFields_returns400Validation() throws Exception {
        UserEntity user = saveUser("missing-acc-fields@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("MissingAccFields", country("BG")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(put("/api/trips/{tripId}/accommodation", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "accommodationPhone", "+359000000"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Validation failed for the request payload."))
                .andExpect(jsonPath("$.data.accommodationName").exists())
                .andExpect(jsonPath("$.data.accommodationAddress").exists());
    }

    @Test
    @DisplayName("PUT /api/trips/{id}/accommodation returns 400 and consistent error for malformed JSON")
    void putAccommodationMalformedJson_returns400ConsistentError() throws Exception {
        UserEntity user = saveUser("bad-acc-json@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("BadAccJson", country("HR")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(put("/api/trips/{tripId}/accommodation", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accommodationName\":\"Hotel\","))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").isString());
    }

    /**
     * Accommodation GET without prior PUT returns empty JSON object under {@code data.accommodation}, matching budget semantics.
     */
    @Test
    @DisplayName("GET /api/trips/{id}/accommodation returns empty object when no accommodation saved")
    void getAccommodationWhenNoneStored() throws Exception {
        UserEntity user = saveUser("noacc@example.com");
        TripEntity trip = saveTrip(user.getId(), saveDestination("NoAccCity", country("PT")));
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/accommodation", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accommodation", anEmptyMap()));
    }

    /**
     * Resolves a country assumed to exist from Flyway seeds (ISO 3166-1 alpha-2).
     */
    private Country country(String isoCode) {
        return countryRepository.findByIsoCode(isoCode)
                .orElseThrow(() -> new IllegalStateException("Test DB missing seeded country: " + isoCode));
    }

    /** Minimal persisted user without OAuth profile fields. */
    private UserEntity saveUser(String email) {
        return userRepository.save(UserEntity.builder()
                .name("T")
                .surname("U")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
    }

    /** Creates a destination with unique name and location to satisfy the DB unique constraint. */
    private DestinationEntity saveDestination(String name, Country country) {
        return destinationRepository.save(DestinationEntity.builder()
                .name(name)
                .location(name)
                .continent("Europe")
                .country(country)
                .imageUrl("https://example.com/x.jpg")
                .imageAlt(name)
                .overview("Overview")
                .budgetPerDay(50)
                .whyVisit("Why")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());
    }

    /** Persists a trip in {@code planned} status with fixed relative dates. */
    private TripEntity saveTrip(Long userId, DestinationEntity destination) {
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(14))
                .status("planned")
                .createdAt(Instant.now())
                .build());
    }
}
