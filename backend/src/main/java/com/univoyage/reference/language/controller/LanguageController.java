package com.univoyage.reference.language.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.reference.language.dto.LanguageDto;
import com.univoyage.reference.language.model.Language;
import com.univoyage.reference.language.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reference/languages")
@RequiredArgsConstructor
public class LanguageController {

  private final LanguageService languageService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<LanguageDto>>> getAll() {
    return ResponseEntity.ok(ApiResponse.ok(languageService.getAll()));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<LanguageDto>> create(@RequestBody Language language) {
    return ResponseEntity.ok(ApiResponse.ok(languageService.create(language)));
  }

  @DeleteMapping("/{code}")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String code) {
    languageService.delete(code);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }
}
