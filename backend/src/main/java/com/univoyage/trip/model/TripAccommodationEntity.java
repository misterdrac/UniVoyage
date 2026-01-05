package com.univoyage.trip.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity representing accommodation details for a trip.
 */
@Entity
@Table(name = "trip_accommodations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripAccommodationEntity {

    @Id
    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "accommodation_name", length = 200)
    private String accommodationName;

    @Column(name = "accommodation_address", columnDefinition = "text")
    private String accommodationAddress;

    @Column(name = "accommodation_phone", length = 50)
    private String accommodationPhone;

    @Column(name="updated_at", nullable = false)
    private Instant updatedAt;
}
