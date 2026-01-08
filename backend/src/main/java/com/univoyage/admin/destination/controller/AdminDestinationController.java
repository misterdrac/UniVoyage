package com.univoyage.admin.destination.controller;

import com.univoyage.admin.destination.dto.*;
import com.univoyage.admin.destination.service.AdminDestinationService;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

/**
 * Controller for managing destinations in the admin panel.
 * Provides endpoints for CRUD operations on destinations.
 * All endpoints are prefixed with /api/admin/destinations.
 * Requires authentication and admin privileges.
 * Uses AdminDestinationService for business logic.
 * Returns responses wrapped in ApiResponse for consistent API structure.
 * Supports pagination and searching for listing destinations.
 * Validates request bodies for create and update operations.
 * Handles exceptions and returns appropriate HTTP status codes.
 */
@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
public class AdminDestinationController {

    private final AdminDestinationService adminDestinationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminDestinationResponse>>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.list(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminDestinationResponse>> get(@PathVariable long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.get(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminDestinationResponse>> create(
            @Valid @RequestBody AdminCreateDestinationRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminDestinationResponse>> putUpdate(
            @PathVariable long id,
            @Valid @RequestBody AdminUpdateDestinationRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.putUpdate(id, req)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminDestinationResponse>> patchUpdate(
            @PathVariable long id,
            @RequestBody AdminPatchDestinationRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.patchUpdate(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable long id) {
        adminDestinationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
