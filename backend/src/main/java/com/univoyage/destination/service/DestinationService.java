package com.univoyage.destination.service;

import com.univoyage.destination.dto.CreateDestinationRequest;
import com.univoyage.destination.dto.DestinationResponse;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Service for managing travel destinations.
 * Provides methods to retrieve, search, and create destination records.
 */
@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    /**
     * Retrieve all destinations.
     *
     * @return A list of all DestinationResponse DTOs.
     */
    @Transactional(readOnly = true)
    public List<DestinationResponse> getAll() {
        return destinationRepository.findAll().stream().map(this::toDto).toList();
    }

    /**
     * Search for destinations by name or location.
     *
     * @param query The search query string.
     * @return A list of matching DestinationResponse DTOs.
     */
    @Transactional(readOnly = true)
    public List<DestinationResponse> search(String query) {
        if (query == null || query.isBlank()) return List.of();
        return destinationRepository
                .findTop25ByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(query, query)
                .stream().map(this::toDto).toList();
    }

    /**
     * Create a new destination if it does not already exist.
     *
     * @param req The CreateDestinationRequest DTO containing destination details.
     * @return The created or existing DestinationResponse DTO.
     */
    @Transactional
    public DestinationResponse create(CreateDestinationRequest req) {
        DestinationEntity entity = destinationRepository
                .findByNameAndLocation(req.getName().trim(), req.getLocation().trim())
                .orElseGet(() -> destinationRepository.save(
                        DestinationEntity.builder()
                                .name(req.getName().trim())
                                .location(req.getLocation().trim())
                                .createdAt(Instant.now())
                                .build()
                ));
        return toDto(entity);
    }

    /**
     * Convert a DestinationEntity to a DestinationResponse DTO.
     *
     * @param d The DestinationEntity to convert.
     * @return The corresponding DestinationResponse DTO.
     */
    private DestinationResponse toDto(DestinationEntity d) {
        return DestinationResponse.builder()
                .id(d.getId())
                .title(d.getName())
                .location(d.getLocation())
                .continent(d.getContinent())
                .imageUrl(d.getImageUrl())
                .imageAlt(d.getImageAlt())
                .overview(d.getOverview())
                .budgetPerDay(d.getBudgetPerDay())
                .whyVisit(d.getWhyVisit())
                .studentPerks(d.getStudentPerks())
                .build();
    }
}
