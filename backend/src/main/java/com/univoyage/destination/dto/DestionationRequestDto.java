package com.univoyage.destination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDestinationRequest {
    @NotBlank @Size(max = 200)
    private String name;

    @NotBlank @Size(max = 250)
    private String location;
}
