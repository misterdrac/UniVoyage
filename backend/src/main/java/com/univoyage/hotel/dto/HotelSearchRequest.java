package com.univoyage.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HotelSearchRequest {
    @NotBlank
    private String city;
}

