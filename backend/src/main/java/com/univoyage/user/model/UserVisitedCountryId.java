package com.univoyage.user.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Composite key class for UserHobby entity.
 */
@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class UserVisitedCountryId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "country_code", length = 2)
    private String countryCode;
}
