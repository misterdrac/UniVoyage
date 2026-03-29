package com.univoyage.reference.country.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a country with its ISO code and name.
 */
@Entity
@Table(name = "countries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country {

    @Id
    @Column(name = "iso_code", length = 2)
    private String isoCode;

    @Column(name = "country_name", nullable = false, unique = true, length = 100)
    private String countryName;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    @Column(name = "currency_name", length = 100)
    private String currencyName;
}