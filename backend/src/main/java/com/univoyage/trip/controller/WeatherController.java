package com.univoyage.trip.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.trip.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for fetching weather information.
 */
@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentWeather(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        try {
            WeatherService.WeatherResponse response;
            if (lat != null && lon != null) {
                response = weatherService.getCurrentWeatherByCoordinates(lat, lon);
            } else if (city != null && !city.isBlank()) {
                response = weatherService.getCurrentWeather(city, country);
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Either city or lat/lon parameters are required"));
            }
            return ResponseEntity.ok(ApiResponse.ok(Map.of("weather", response)));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getForecast(
            @RequestParam String city,
            @RequestParam(required = false) String country) {
        try {
            Map<String, Object> forecast = weatherService.getForecast(city, country);
            return ResponseEntity.ok(ApiResponse.ok(forecast));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.fail(e.getMessage()));
        }
    }
}

