package com.univoyage.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for searching hotels by city.
 */
@Data
public class HotelSearchRequest {
    @NotBlank
    private String city;
}

