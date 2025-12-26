package com.univoyage.destination.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DestinationResponse {
    private Long id;
    private String name;
    private String location;
}