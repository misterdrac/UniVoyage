package com.univoyage.user.model;

import com.univoyage.user.model.UserEntity;
import com.univoyage.reference.country.model.Country;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity representing a country visited by a user.
 */
@Entity
@Table(name = "user_visited_countries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserVisitedCountry {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserVisitedCountryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("countryCode")
    @JoinColumn(name = "country_code", nullable = false)
    private Country country;

    @Column(name = "date_of_visit")
    private LocalDate dateOfVisit;

    public static UserVisitedCountry of(UserEntity user, Country country, LocalDate date) {
        UserVisitedCountryId key = new UserVisitedCountryId(user.getId(), country.getIsoCode());

        UserVisitedCountry uvc = new UserVisitedCountry();
        uvc.setId(key);
        uvc.setUser(user);
        uvc.setCountry(country);
        uvc.setDateOfVisit(date);

        return uvc;
    }
}
