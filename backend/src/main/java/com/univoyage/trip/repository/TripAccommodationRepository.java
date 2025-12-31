package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripAccommodationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripAccommodationRepository extends JpaRepository<TripAccommodationEntity, Long> {
}
