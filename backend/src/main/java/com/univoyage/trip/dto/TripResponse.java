package com.univoyage.trip.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripResponse {
    private Long id;

    private Long destinationId;
    private String destinationName;
    private String destinationLocation;

    private String departureDate;
    private String returnDate;

    private String createdAt;
    private String status;
}
