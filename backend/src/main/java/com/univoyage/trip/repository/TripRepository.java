package com.univoyage.trip.repository;

import com.univoyage.trip.dto.HeatmapPointDto;
import com.univoyage.trip.model.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for TripEntity.
 */
public interface TripRepository extends JpaRepository<TripEntity, Long> {
    List<TripEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<TripEntity> findByIdAndUserId(Long tripId, Long userId);
    boolean existsByIdAndUserId(Long tripId, Long userId);

    @Query("""
            SELECT new com.univoyage.trip.dto.HeatmapPointDto(
                d.name, d.location, COUNT(t.id)
            )
            FROM TripEntity t JOIN t.destination d
            GROUP BY d.name, d.location
            ORDER BY COUNT(t.id) DESC
            """)
    List<HeatmapPointDto> findHeatmapData();
}
