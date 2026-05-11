package com.univoyage.admin.language.controller;

import com.univoyage.admin.language.dto.AdminCreateLanguageRequest;
import com.univoyage.admin.language.dto.AdminLanguagePageResponse;
import com.univoyage.admin.language.dto.AdminLanguageResponse;
import com.univoyage.admin.language.dto.AdminPatchLanguageRequest;
import com.univoyage.admin.language.service.AdminLanguageService;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/languages")
@RequiredArgsConstructor
public class AdminLanguageController {

  private final AdminLanguageService adminLanguageService;

  @GetMapping
  public ResponseEntity<ApiResponse<AdminLanguagePageResponse>> list(
      @RequestParam(required = false) String search,
      @PageableDefault(size = 50, sort = "langName", direction = Sort.Direction.ASC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(adminLanguageService.list(search, pageable)));
  }

  @GetMapping("/{langCode}")
  public ResponseEntity<ApiResponse<AdminLanguageResponse>> get(@PathVariable String langCode) {
    return ResponseEntity.ok(ApiResponse.ok(adminLanguageService.get(langCode)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminLanguageResponse>> create(
      @Valid @RequestBody AdminCreateLanguageRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminLanguageService.create(req)));
  }

  @PutMapping("/{langCode}")
  public ResponseEntity<ApiResponse<AdminLanguageResponse>> putUpdate(@PathVariable String langCode,
      @Valid @RequestBody AdminCreateLanguageRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminLanguageService.putUpdate(langCode, req)));
  }

  @PatchMapping("/{langCode}")
  public ResponseEntity<ApiResponse<AdminLanguageResponse>> patchUpdate(
      @PathVariable String langCode, @RequestBody AdminPatchLanguageRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminLanguageService.patchUpdate(langCode, req)));
  }

  @DeleteMapping("/{langCode}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String langCode) {
    adminLanguageService.delete(langCode);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
