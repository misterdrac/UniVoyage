package com.univoyage.destination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for creating a new destination.
 */
@Data
public class CreateDestinationRequest {
    @NotBlank @Size(max = 200)
    private String name;

    @NotBlank @Size(max = 250)
    private String location;

    /** Optional ISO 3166-1 alpha-2 country code (validated when present). */
    @Size(min = 2, max = 2)
    private String countryIsoCode;
}
