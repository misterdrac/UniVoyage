package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for TripEntity.
 */
public interface TripRepository extends JpaRepository<TripEntity, Long> {
    List<TripEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<TripEntity> findByIdAndUserId(Long tripId, Long userId);
    boolean existsByIdAndUserId(Long tripId, Long userId);
}
