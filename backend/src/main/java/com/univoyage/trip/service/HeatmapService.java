package com.univoyage.trip.service;

import com.univoyage.trip.dto.HeatmapPointDto;
import com.univoyage.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for aggregating trip data into heatmap points.
 */
@Service
@RequiredArgsConstructor
public class HeatmapService {

    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<HeatmapPointDto> getHeatmapData() {
        return tripRepository.findHeatmapData();
    }
}
