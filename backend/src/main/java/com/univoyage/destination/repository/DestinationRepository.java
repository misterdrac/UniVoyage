package com.univoyage.destination.repository;

import com.univoyage.destination.model.DestinationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DestinationEntity.
 * Extends JpaRepository to provide CRUD operations and custom query methods.
 */
public interface DestinationRepository extends JpaRepository<DestinationEntity, Long> {

    Optional<DestinationEntity> findByNameAndLocation(String name, String location);

    List<DestinationEntity> findTop25ByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location);

    @Query("""
    SELECT d FROM DestinationEntity d
    WHERE lower(d.name) LIKE concat('%', :q, '%')
       OR lower(d.location) LIKE concat('%', :q, '%')
       OR lower(d.continent) LIKE concat('%', :q, '%')
    """)
    Page<DestinationEntity> searchAdminDestinations(@Param("q") String q, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE DestinationEntity d
            SET d.travellerRatingAverage = :avg, d.travellerRatingCount = :count
            WHERE d.id = :id
            """)
    void updateTravellerRatingStats(@Param("id") Long id,
                                      @Param("avg") BigDecimal avg,
                                      @Param("count") int count);
}