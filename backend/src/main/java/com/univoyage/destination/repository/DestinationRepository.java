package com.univoyage.destination.repository;

import com.univoyage.destination.model.DestinationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DestinationRepository extends JpaRepository<DestinationEntity, Long> {
    Optional<DestinationEntity> findByNameAndLocation(String name, String location);
    List<DestinationEntity> findTop25ByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location);
}