package com.univoyage.trip.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripAccommodationResponse {
    private String accommodationName;
    private String accommodationAddress;
    private String accommodationPhone;
}
