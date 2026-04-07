package com.univoyage.trip.controller;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.trip.dto.CreateTripRequest;
import com.univoyage.trip.dto.TripAccommodationRequest;
import com.univoyage.trip.dto.TripAccommodationResponse;
import com.univoyage.trip.dto.TripCurrencyResponse;
import com.univoyage.trip.dto.TripResponse;
import com.univoyage.trip.dto.TripTravellerRatingRequest;
import com.univoyage.trip.dto.TripTravellerRatingResponse;
import com.univoyage.trip.service.TripCurrencyService;
import com.univoyage.trip.service.TripService;
import com.univoyage.trip.service.TripTravellerRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for managing trips.
 */
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Log4j2
public class TripController {

    private final TripCurrencyService tripCurrencyService;
    private final TripService tripService;
    private final TripTravellerRatingService tripTravellerRatingService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTrip(@Valid @RequestBody CreateTripRequest req) {
        Long userId = currentUser.id();
        TripResponse trip = tripService.createTrip(userId, req);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("trip", trip)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrips() {
        Long userId = currentUser.id();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("trips", tripService.getTrips(userId))));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Object>> deleteTrip(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        tripService.deleteTrip(userId, tripId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{tripId}/budget")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBudget(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        Object budget = tripService.getBudget(userId, tripId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("budget", budget == null ? Map.of() : budget)));
    }

    @PutMapping("/{tripId}/budget")
    public ResponseEntity<ApiResponse<Object>> saveBudget(@PathVariable Long tripId, @RequestBody Object payload) {
        Long userId = currentUser.id();
        tripService.saveBudget(userId, tripId, payload);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{tripId}/itinerary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getItinerary(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        Object itinerary = tripService.getItinerary(userId, tripId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("itinerary", itinerary == null ? Map.of() : itinerary)));
    }

    @PutMapping("/{tripId}/itinerary")
    public ResponseEntity<ApiResponse<Object>> saveItinerary(@PathVariable Long tripId, @RequestBody Object payload) {
        Long userId = currentUser.id();
        tripService.saveItinerary(userId, tripId, payload);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{tripId}/accommodation")
    public ResponseEntity<ApiResponse<Object>> saveAccommodation(
            @PathVariable Long tripId,
            @RequestBody TripAccommodationRequest req
    ) {
        Long userId = currentUser.id();
        tripService.saveAccommodation(userId, tripId, req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{tripId}/accommodation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAccommodation(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        TripAccommodationResponse acc = tripService.getAccommodation(userId, tripId);
        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("accommodation", acc == null ? Map.of() : acc)
        ));
    }

    @GetMapping("/{tripId}/currency")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrency(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        // Trip currency tab logging: helps trace failures + measure usage.
        log.info("Trip currency tab requested: tripId={} userId={}", tripId, userId);
        try {
            TripCurrencyResponse currency = tripCurrencyService.getTripCurrency(userId, tripId);
            log.debug(
                    "Trip currency tab response ready: tripId={} userId={} baseCurrency={} destinationCurrency={}",
                    tripId, userId,
                    currency.getBaseCurrencyCode(),
                    currency.getDestinationCurrencyCode()
            );
            return ResponseEntity.ok(ApiResponse.ok(Map.of("currency", currency)));
        } catch (RuntimeException ex) {
            // Let GlobalExceptionHandler translate the error, but log it here for observability.
            log.warn("Trip currency tab failed: tripId={} userId={} reason={}", tripId, userId, ex.getMessage());
            throw ex;
        }
    }

    @GetMapping("/{tripId}/rating")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTripRating(@PathVariable Long tripId) {
        Long userId = currentUser.id();
        TripTravellerRatingResponse rating = tripTravellerRatingService.getRating(userId, tripId);
        Map<String, Object> data = new HashMap<>();
        data.put("rating", rating);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/{tripId}/rating")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitTripRating(
            @PathVariable Long tripId,
            @Valid @RequestBody TripTravellerRatingRequest request
    ) {
        Long userId = currentUser.id();
        TripTravellerRatingResponse rating = tripTravellerRatingService.submitRating(userId, tripId, request);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("rating", rating)));
    }
}