package com.univoyage.ai.controller;

import com.univoyage.ai.dto.GeminiResponse;
import com.univoyage.ai.dto.ItineraryRequest;
import com.univoyage.ai.dto.PackingRequest;
import com.univoyage.ai.service.GeminiService;
import com.univoyage.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;

    @PostMapping("/itinerary")
    public ResponseEntity<ApiResponse<GeminiResponse>> generateItinerary(
            @Valid @RequestBody ItineraryRequest request
    ) {
        GeminiResponse response = geminiService.generateItinerary(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.ok(response));
        }
        
        return ResponseEntity.ok(ApiResponse.fail(response.getError()));
    }

    @PostMapping("/packing")
    public ResponseEntity<ApiResponse<GeminiResponse>> generatePackingSuggestions(
            @Valid @RequestBody PackingRequest request
    ) {
        GeminiResponse response = geminiService.generatePackingSuggestions(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.ok(response));
        }
        
        return ResponseEntity.ok(ApiResponse.fail(response.getError()));
    }
    
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> getStatus() {
        return ResponseEntity.ok(ApiResponse.ok(geminiService.isConfigured()));
    }
}

