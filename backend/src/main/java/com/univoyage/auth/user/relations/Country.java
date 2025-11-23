package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "countries")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Country {

    @Id
    @Column(name = "iso_code", length = 2) // Primary Key is the 2-char code
    private String isoCode;

    @Column(name = "country_name", unique = true, nullable = false, length = 100)
    private String countryName;

    @OneToMany(mappedBy = "country", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<UserVisitedCountry> visitedCountries;
}