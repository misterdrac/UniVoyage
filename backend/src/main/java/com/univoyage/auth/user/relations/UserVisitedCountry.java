package com.univoyage.auth.user.relations;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_visited_countries")
@IdClass(UserVisitedCountryId.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@ToString
public class UserVisitedCountry {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private UserEntity user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_code")
    private Country country;

    @Column(name = "date_of_visit")
    private Instant dateOfVisit; // TIMESTAMPTZ
}
