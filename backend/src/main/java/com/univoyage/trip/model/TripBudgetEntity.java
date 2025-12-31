package com.univoyage.trip.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "trip_budgets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripBudgetEntity {

    @Id
    @Column(name = "trip_id")
    private Long tripId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name="updated_at", nullable = false)
    private Instant updatedAt;
}
