package com.univoyage.admin.destination;

import com.univoyage.admin.destination.dto.*;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
public class AdminDestinationController {

    private final AdminDestinationService adminDestinationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminDestinationResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDestinationService.list(page, size)));
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
