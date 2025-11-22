package com.univoyage.user.visited;

import com.univoyage.auth.user.UserEntity;
import com.univoyage.user.relations.Country;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_visited_countries", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "country_code"}) // Enforces the unique constraint we defined
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserVisitedCountry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_code", nullable = false)
    private Country country;

    @Column(name = "date_of_visit")
    private LocalDate dateOfVisit; // Using LocalDate for a DATE type
}