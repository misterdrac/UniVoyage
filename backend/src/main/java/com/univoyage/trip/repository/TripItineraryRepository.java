package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripItineraryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for TripItineraryEntity.
 */
public interface TripItineraryRepository extends JpaRepository<TripItineraryEntity, Long> {}
