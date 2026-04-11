package com.univoyage.trip.repository;

import com.univoyage.trip.model.ReviewModerationStatus;
import com.univoyage.trip.model.TripTravellerRatingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
              AND r.moderationStatus = :status
            """)
    Double averageStarsForDestinationId(
            @Param("destinationId") Long destinationId,
            @Param("status") ReviewModerationStatus status);

    @Query("""
            SELECT COUNT(r)
            FROM TripTravellerRatingEntity r
            WHERE r.trip.destination.id = :destinationId
              AND r.moderationStatus = :status
            """)
    long countForDestinationId(
            @Param("destinationId") Long destinationId,
            @Param("status") ReviewModerationStatus status);

    /**
     * Published text reviews for a destination (approved, non-blank comment), newest first.
     */
    @Query("""
            SELECT r FROM TripTravellerRatingEntity r
            WHERE r.trip.destination.id = :destinationId
              AND r.moderationStatus = :status
              AND r.comment IS NOT NULL
              AND TRIM(r.comment) <> ''
            ORDER BY r.updatedAt DESC
            """)
    Page<TripTravellerRatingEntity> findPublishedTextReviews(
            @Param("destinationId") Long destinationId,
            @Param("status") ReviewModerationStatus status,
            Pageable pageable);

    Page<TripTravellerRatingEntity> findByModerationStatusOrderByUpdatedAtAsc(
            ReviewModerationStatus status,
            Pageable pageable);
}
