package com.univoyage.trip.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.trip.service.GeoapifyService;
import com.univoyage.trip.service.GeoapifyService.PointOfInterest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Controller for searching places using Geoapify API.
 */
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlacesController {

    private final GeoapifyService geoapifyService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchPlaces(
            @RequestParam String city,
            @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            List<PointOfInterest> places = geoapifyService.searchPlaces(city, Math.min(limit, 22));
            return ResponseEntity.ok(ApiResponse.ok(Map.of("places", places)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.fail("Failed to fetch places: " + e.getMessage()));
        }
    }
}

