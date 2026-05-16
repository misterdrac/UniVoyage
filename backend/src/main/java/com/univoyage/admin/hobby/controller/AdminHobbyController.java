package com.univoyage.admin.hobby.controller;

import com.univoyage.admin.hobby.dto.AdminCreateHobbyRequest;
import com.univoyage.admin.hobby.dto.AdminHobbyPageResponse;
import com.univoyage.admin.hobby.dto.AdminHobbyResponse;
import com.univoyage.admin.hobby.dto.AdminPatchHobbyRequest;
import com.univoyage.admin.hobby.service.AdminHobbyService;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hobbies")
@RequiredArgsConstructor
public class AdminHobbyController {

  private final AdminHobbyService adminHobbyService;

  @GetMapping
  public ResponseEntity<ApiResponse<AdminHobbyPageResponse>> list(
      @RequestParam(required = false) String search,
      @PageableDefault(size = 50, sort = "displayLabel", direction = Sort.Direction.ASC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(adminHobbyService.list(search, pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminHobbyResponse>> get(@PathVariable long id) {
    return ResponseEntity.ok(ApiResponse.ok(adminHobbyService.get(id)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminHobbyResponse>> create(
      @Valid @RequestBody AdminCreateHobbyRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminHobbyService.create(req)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminHobbyResponse>> putUpdate(@PathVariable long id,
      @Valid @RequestBody AdminCreateHobbyRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminHobbyService.putUpdate(id, req)));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminHobbyResponse>> patchUpdate(@PathVariable long id,
      @RequestBody AdminPatchHobbyRequest req) {
    return ResponseEntity.ok(ApiResponse.ok(adminHobbyService.patchUpdate(id, req)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable long id) {
    adminHobbyService.delete(id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
