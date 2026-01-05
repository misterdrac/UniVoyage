package com.univoyage.destination.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * Entity representing a travel destination.
 */
@Entity
@Table(
        name = "destinations",
        uniqueConstraints = @UniqueConstraint(name = "uq_destinations_title_location", columnNames = {"title", "location"})
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

    @Column(name = "title", nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(nullable = false, length = 50)
    private String continent;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_alt")
    private String imageAlt;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "budget_per_day")
    private Integer budgetPerDay;

    @Column(name = "why_visit", columnDefinition = "TEXT")
    private String whyVisit;

    @Column(name = "student_perks", columnDefinition = "TEXT[]")
    private List<String> studentPerks;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }


}