package com.univoyage.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Hotel entity.
 * Contains basic information about a hotel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {
    private String hotelName;
    private String hotelId;
}

