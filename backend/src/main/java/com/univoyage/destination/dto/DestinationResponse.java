package com.univoyage.destination.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DestinationResponse {
    private Long id;
    private String title;
    private String location;
    private String continent;
    private String imageUrl;
    private String imageAlt;
    private String overview;
    private Integer budgetPerDay;
    private String whyVisit;
    private List<String> studentPerks;
}