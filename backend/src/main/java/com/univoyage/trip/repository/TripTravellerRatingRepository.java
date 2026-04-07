package com.univoyage.trip.repository;

import com.univoyage.trip.model.TripTravellerRatingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TripTravellerRatingRepository extends JpaRepository<TripTravellerRatingEntity, Long> {

    Optional<TripTravellerRatingEntity> findByTripIdAndUserId(Long tripId, Long userId);

    @Query("""
            SELECT AVG(r.stars)
            FROM TripTravellerRatingEntity r
            WHERE r.trip.destination.id = :destinationId
            """)
    Double averageStarsForDestinationId(@Param("destinationId") Long destinationId);

    @Query("""
            SELECT COUNT(r)
            FROM TripTravellerRatingEntity r
            WHERE r.trip.destination.id = :destinationId
            """)
    long countForDestinationId(@Param("destinationId") Long destinationId);
}
