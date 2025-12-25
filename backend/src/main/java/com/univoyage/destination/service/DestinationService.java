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

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public List<DestinationResponse> getAll() {
        return destinationRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<DestinationResponse> search(String query) {
        if (query == null || query.isBlank()) return List.of();
        return destinationRepository
                .findTop25ByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(query, query)
                .stream().map(this::toDto).toList();
    }

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

    private DestinationResponse toDto(DestinationEntity d) {
        return DestinationResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .location(d.getLocation())
                .build();
    }
}
