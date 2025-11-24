package com.univoyage.auth.user.relations;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_visited_countries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
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
    private LocalDate dateOfVisit;
}
