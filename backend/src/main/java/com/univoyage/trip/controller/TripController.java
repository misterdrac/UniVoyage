package com.univoyage.trip.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.trip.dto.CreateTripRequest;
import com.univoyage.trip.dto.TripResponse;
import com.univoyage.trip.service.TripService;
import com.univoyage.auth.security.CurrentUser;
import com.univoyage.trip.dto.TripAccommodationRequest;
import com.univoyage.trip.dto.TripAccommodationResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;


@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
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
        return ResponseEntity.ok(ApiResponse.ok(Map.of("budget", tripService.getBudget(userId, tripId))));
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
        return ResponseEntity.ok(ApiResponse.ok(Map.of("itinerary", tripService.getItinerary(userId, tripId))));
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
        return ResponseEntity.ok(ApiResponse.ok(Map.of("accommodation", acc)));
    }


}
