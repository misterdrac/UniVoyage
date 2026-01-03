package com.univoyage.admin.destination.service;

import com.univoyage.admin.destination.dto.*;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AdminDestinationService {

    private final DestinationRepository destinationRepository;

    public Page<AdminDestinationResponse> list(String search, Pageable pageable) {

        Page<DestinationEntity> page;
        if (search == null || search.isBlank()) {
            page = destinationRepository.findAll(pageable);
        } else {
            // treba metoda u repo (ispod ti dajem)
            page = destinationRepository.searchAdminDestinations(search.toLowerCase(), pageable);
        }

        return page.map(this::toDto);
    }


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
        e.setImageUrl(req.imageUrl());
        e.setImageAlt(req.imageAlt());
        e.setOverview(req.overview());
        e.setBudgetPerDay(req.budgetPerDay());
        e.setWhyVisit(req.whyVisit());
        e.setStudentPerks(req.studentPerks());
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
        e.setImageUrl(req.imageUrl());
        e.setImageAlt(req.imageAlt());
        e.setOverview(req.overview());
        e.setBudgetPerDay(req.budgetPerDay());
        e.setWhyVisit(req.whyVisit());
        e.setStudentPerks(req.studentPerks());


        return toDto(destinationRepository.save(e));
    }

    @Transactional
    public AdminDestinationResponse patchUpdate(long id, AdminPatchDestinationRequest req) {
        DestinationEntity e = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found: " + id));

        if (req.name() != null) e.setName(req.name());
        if (req.location() != null) e.setLocation(req.location());
        if (req.continent() != null) e.setContinent(req.continent());
        if (req.imageUrl() != null) e.setImageUrl(req.imageUrl());
        if (req.imageAlt() != null) e.setImageAlt(req.imageAlt());
        if (req.overview() != null) e.setOverview(req.overview());
        if (req.budgetPerDay() != null) e.setBudgetPerDay(req.budgetPerDay());
        if (req.whyVisit() != null) e.setWhyVisit(req.whyVisit());
        if (req.studentPerks() != null) e.setStudentPerks(req.studentPerks());

        return toDto(destinationRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found: " + id);
        }
        destinationRepository.deleteById(id);
    }

    private AdminDestinationResponse toDto(DestinationEntity e) {
        return new AdminDestinationResponse(
                e.getId(),
                e.getName(),
                e.getLocation(),
                e.getContinent(),
                e.getImageUrl(),
                e.getImageAlt(),
                e.getOverview(),
                e.getBudgetPerDay(),
                e.getWhyVisit(),
                e.getStudentPerks(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

}
