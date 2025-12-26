package com.univoyage.trip.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "trip_itineraries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripItineraryEntity {

    @Id
    @Column(name = "trip_id")
    private Long tripId;

    @Lob
    @Column(columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name="updated_at", nullable = false)
    private Instant updatedAt;
}
