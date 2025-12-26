package com.univoyage.destination.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "destinations",
        uniqueConstraints = @UniqueConstraint(name = "uq_destinations_name_location", columnNames = {"name", "location"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 250)
    private String location;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}