package com.univoyage.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO representing a single heatmap point: a destination and how many trips target it.
 */
@Data
@AllArgsConstructor
public class HeatmapPointDto {
    private String destinationName;
    private String destinationLocation;
    private long tripCount;
}
