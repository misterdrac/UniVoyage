package com.univoyage.destination.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.destination.dto.CreateDestinationRequest;
import com.univoyage.destination.dto.DestinationResponse;
import com.univoyage.destination.service.DestinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing travel destinations.
 * Provides endpoints to retrieve all destinations, search destinations,
 * and create new destinations.
 * All endpoints are prefixed with /api/destinations.
 * Uses DestinationService for business logic.
 * Returns responses wrapped in ApiResponse for consistent API structure.
 */
@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAll() {
        List<DestinationResponse> destinations = destinationService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("destinations", destinations)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(@RequestParam String query) {
        List<DestinationResponse> destinations = destinationService.search(query);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("destinations", destinations)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody CreateDestinationRequest req) {
        DestinationResponse created = destinationService.create(req);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("destination", created)));
    }
}
