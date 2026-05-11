package com.univoyage.admin.country.controller;

import com.univoyage.admin.country.dto.AdminCountryPageResponse;
import com.univoyage.admin.country.dto.AdminCountryResponse;
import com.univoyage.admin.country.dto.AdminCreateCountryRequest;
import com.univoyage.admin.country.dto.AdminPatchCountryRequest;
import com.univoyage.admin.country.service.AdminCountryService;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/countries")
@RequiredArgsConstructor
public class AdminCountryController {

  private final AdminCountryService adminCountryService;

  @GetMapping
  public ResponseEntity<ApiResponse<AdminCountryPageResponse>> list(
      @RequestParam(required = false) String search,
      @PageableDefault(size = 100, sort = "countryName", direction = Sort.Direction.ASC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(adminCountryService.list(search, pageable)));
  }

  @GetMapping("/{isoCode}")
  public ResponseEntity<ApiResponse<AdminCountryResponse>> get(@PathVariable String isoCode) {
    return ResponseEntity.ok(ApiResponse.ok(adminCountryService.get(isoCode)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminCountryResponse>> create(
      @Valid @RequestBody AdminCreateCountryRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminCountryService.create(req)));
  }

  @PutMapping("/{isoCode}")
  public ResponseEntity<ApiResponse<AdminCountryResponse>> putUpdate(@PathVariable String isoCode,
      @Valid @RequestBody AdminCreateCountryRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminCountryService.putUpdate(isoCode, req)));
  }

  @PatchMapping("/{isoCode}")
  public ResponseEntity<ApiResponse<AdminCountryResponse>> patchUpdate(@PathVariable String isoCode,
      @RequestBody AdminPatchCountryRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminCountryService.patchUpdate(isoCode, req)));
  }

  @DeleteMapping("/{isoCode}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String isoCode) {
    adminCountryService.delete(isoCode);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
