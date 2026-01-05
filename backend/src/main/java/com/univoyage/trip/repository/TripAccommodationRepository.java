package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripAccommodationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for TripAccommodationEntity.
 */
public interface TripAccommodationRepository extends JpaRepository<TripAccommodationEntity, Long> {
}
