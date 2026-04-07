package com.univoyage.destination.model;

import com.univoyage.reference.country.model.Country;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_code", referencedColumnName = "iso_code", nullable = false)
    private Country country;

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

    /** Average rating 0–5 (one decimal), optional. */
    @Column(name = "average_rating", precision = 2, scale = 1)
    private BigDecimal averageRating;

    /** Rolling average from trip_traveller_ratings for this destination (separate from admin average_rating). */
    @Column(name = "traveller_rating_average", precision = 2, scale = 1)
    private BigDecimal travellerRatingAverage;

    @Builder.Default
    @Column(name = "traveller_rating_count", nullable = false)
    private Integer travellerRatingCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (travellerRatingCount == null) {
            travellerRatingCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}