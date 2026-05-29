package com.univoyage.reference.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.reference.service.ReferenceDataService;
import com.univoyage.reference.service.dto.ReferenceCountryResponse;
import com.univoyage.reference.service.dto.ReferenceHobbyResponse;
import com.univoyage.reference.service.dto.ReferenceLanguageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceController {

  private final ReferenceDataService referenceDataService;

  @GetMapping("/hobbies")
  public ResponseEntity<ApiResponse<List<ReferenceHobbyResponse>>> hobbies() {
    return ResponseEntity.ok(ApiResponse.ok(referenceDataService.listActiveHobbies()));
  }

  @GetMapping("/languages")
  public ResponseEntity<ApiResponse<List<ReferenceLanguageResponse>>> languages() {
    return ResponseEntity.ok(ApiResponse.ok(referenceDataService.listActiveLanguages()));
  }

  @GetMapping("/countries")
  public ResponseEntity<ApiResponse<List<ReferenceCountryResponse>>> countries() {
    return ResponseEntity.ok(ApiResponse.ok(referenceDataService.listActiveCountries()));
  }
}
