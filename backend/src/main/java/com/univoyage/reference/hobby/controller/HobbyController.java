package com.univoyage.reference.hobby.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.reference.hobby.dto.HobbyDto;
import com.univoyage.reference.hobby.model.Hobby;
import com.univoyage.reference.hobby.service.HobbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reference/hobbies")
@RequiredArgsConstructor
public class HobbyController {

    private final HobbyService hobbyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HobbyDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(hobbyService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HobbyDto>> create(@RequestBody Hobby hobby) {
        return ResponseEntity.ok(ApiResponse.ok(hobbyService.create(hobby)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        hobbyService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}