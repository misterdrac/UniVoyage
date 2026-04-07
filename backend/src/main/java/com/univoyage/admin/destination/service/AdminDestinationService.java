package com.univoyage.admin.destination.service;

import com.univoyage.admin.destination.dto.*;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

/**
 * Service for managing destinations in the admin panel.
 * Provides methods for CRUD operations on destinations.
 * Interacts with DestinationRepository for data access.
 * Handles business logic and data transformation.
 * Throws ResourceNotFoundException for non-existent resources.
 * Uses DTOs for request and response payloads.
 * Supports pagination and searching for listing destinations.
 * All methods that modify data are transactional.
 * Maps DestinationEntity to AdminDestinationResponse DTO.
 * Validates input data before processing.
 */
@Service
@RequiredArgsConstructor
public class AdminDestinationService {

    private final DestinationRepository destinationRepository;
    private final CountryRepository countryRepository;

    @Transactional(readOnly = true)
    public AdminDestinationPageResponse list(String search, Pageable pageable) {
        Page<DestinationEntity> page;
        if (search == null || search.isBlank()) {
            page = destinationRepository.findAll(pageable);
        } else {
            page = destinationRepository.searchAdminDestinations(search.toLowerCase(), pageable);
        }

        return new AdminDestinationPageResponse(
                page.getContent().stream().map(this::toDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber()
        );
    }

    @Transactional(readOnly = true)
    public AdminDestinationResponse get(long id) {
        return destinationRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id));
    }

    @Transactional
    public AdminDestinationResponse create(AdminCreateDestinationRequest req) {
        DestinationEntity e = new DestinationEntity();
        e.setName(req.name());
        e.setLocation(req.location());
        e.setContinent(req.continent());
        e.setCountry(resolveCountry(req.countryCode()));
        e.setImageUrl(req.imageUrl());
        e.setImageAlt(req.imageAlt());
        e.setOverview(req.overview());
        e.setBudgetPerDay(req.budgetPerDay());
        e.setWhyVisit(req.whyVisit());
        e.setStudentPerks(req.studentPerks());
        e.setAverageRating(toBigDecimal(req.averageRating()));
        e.setCreatedAt(Instant.now());

        return toDto(destinationRepository.save(e));
    }

    @Transactional
    public AdminDestinationResponse putUpdate(long id, AdminUpdateDestinationRequest req) {
        DestinationEntity e = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id));

        e.setName(req.name());
        e.setLocation(req.location());
        e.setContinent(req.continent());
        e.setCountry(resolveCountry(req.countryCode()));
        e.setImageUrl(req.imageUrl());
        e.setImageAlt(req.imageAlt());
        e.setOverview(req.overview());
        e.setBudgetPerDay(req.budgetPerDay());
        e.setWhyVisit(req.whyVisit());
        e.setStudentPerks(req.studentPerks());
        e.setAverageRating(toBigDecimal(req.averageRating()));

        return toDto(destinationRepository.save(e));
    }

    @Transactional
    public AdminDestinationResponse patchUpdate(long id, AdminPatchDestinationRequest req) {
        DestinationEntity e = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id));

        if (req.name() != null) e.setName(req.name());
        if (req.location() != null) e.setLocation(req.location());
        if (req.continent() != null) e.setContinent(req.continent());
        if (req.countryCode() != null) e.setCountry(resolveCountry(req.countryCode()));
        if (req.imageUrl() != null) e.setImageUrl(req.imageUrl());
        if (req.imageAlt() != null) e.setImageAlt(req.imageAlt());
        if (req.overview() != null) e.setOverview(req.overview());
        if (req.budgetPerDay() != null) e.setBudgetPerDay(req.budgetPerDay());
        if (req.whyVisit() != null) e.setWhyVisit(req.whyVisit());
        if (req.studentPerks() != null) e.setStudentPerks(req.studentPerks());
        if (req.averageRating() != null) e.setAverageRating(toBigDecimal(req.averageRating()));

        return toDto(destinationRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found: " + id);
        }
        destinationRepository.deleteById(id);
    }

    private Country resolveCountry(String countryCode) {
        if (countryCode == null || countryCode.isBlank()) {
            throw new IllegalArgumentException("Country code is required");
        }
        String iso = countryCode.trim().toUpperCase();
        return countryRepository.findByIsoCode(iso)
                .orElseThrow(() -> new IllegalArgumentException("Unknown country code: " + iso));
    }

    private AdminDestinationResponse toDto(DestinationEntity e) {
        String iso = e.getCountry() != null ? e.getCountry().getIsoCode() : null;
        return new AdminDestinationResponse(
                e.getId(),
                e.getName(),
                e.getLocation(),
                e.getContinent(),
                iso,
                e.getImageUrl(),
                e.getImageAlt(),
                e.getOverview(),
                e.getBudgetPerDay(),
                e.getWhyVisit(),
                e.getStudentPerks(),
                e.getAverageRating() == null ? null : e.getAverageRating().doubleValue(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private static BigDecimal toBigDecimal(Double v) {
        if (v == null) {
            return null;
        }
        return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP);
    }
}
