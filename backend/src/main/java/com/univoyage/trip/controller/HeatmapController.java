package com.univoyage.trip.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.trip.dto.HeatmapPointDto;
import com.univoyage.trip.service.HeatmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public controller exposing aggregated trip-per-destination data for the landing page heatmap.
 */
@RestController
@RequestMapping("/api/heatmap")
@RequiredArgsConstructor
public class HeatmapController {

    private final HeatmapService heatmapService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHeatmapData() {
        List<HeatmapPointDto> points = heatmapService.getHeatmapData();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("points", points)));
    }
}
