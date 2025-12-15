package com.univoyage.auth.user.relations;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

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
