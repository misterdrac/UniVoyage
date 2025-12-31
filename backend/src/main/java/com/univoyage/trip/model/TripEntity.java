package com.univoyage.trip.model;

import com.univoyage.destination.model.DestinationEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "trips")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // owner
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_id", nullable = false)
    private DestinationEntity destination;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
