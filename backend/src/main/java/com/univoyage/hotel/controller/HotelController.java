package com.univoyage.hotel.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.hotel.dto.HotelResponse;
import com.univoyage.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchHotels(
            @RequestParam String city,
            @RequestParam(defaultValue = "10") int limit
    ) {
        try {
            List<HotelResponse> hotels = hotelService.searchHotels(city);
            
            // Limit results
            if (hotels.size() > limit) {
                hotels = hotels.subList(0, limit);
            }
            
            return ResponseEntity.ok(ApiResponse.ok(Map.of("hotels", hotels)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.fail("Failed to fetch hotels: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> getStatus() {
        return ResponseEntity.ok(ApiResponse.ok(hotelService.isConfigured()));
    }
}

