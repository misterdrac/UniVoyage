package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "countries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Country {

    @Id
    @Column(name = "iso_code", length = 2)
    private String isoCode;

    @Column(name = "country_name", nullable = false, unique = true, length = 100)
    private String countryName;
}

