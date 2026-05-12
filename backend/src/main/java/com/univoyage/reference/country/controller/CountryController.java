package com.univoyage.reference.country.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.reference.country.dto.CountryDto;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.service.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reference/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService countryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CountryDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(countryService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CountryDto>> create(@RequestBody Country country) {
        return ResponseEntity.ok(ApiResponse.ok(countryService.create(country)));
    }

    @DeleteMapping("/{isoCode}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String isoCode) {
        countryService.delete(isoCode);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}