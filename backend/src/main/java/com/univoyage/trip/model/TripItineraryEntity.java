package com.univoyage.trip.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/**
 * Entity representing itinerary details for a trip.
 */
@Entity
@Table(name = "trip_itineraries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripItineraryEntity {

    @Id
    @Column(name = "trip_id")
    private Long tripId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name="updated_at", nullable = false)
    private Instant updatedAt;
}
