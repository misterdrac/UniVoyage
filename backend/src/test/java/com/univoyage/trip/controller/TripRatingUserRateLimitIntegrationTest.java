package com.univoyage.trip.controller;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.trip.rating.ip-max-attempts=999",
        "app.trip.rating.ip-window=PT1H",
        "app.trip.rating.user-max-attempts=2",
        "app.trip.rating.user-window=PT1H"
})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class TripRatingUserRateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CountryRepository countryRepository;

    @MockBean
    private CurrentUser currentUser;

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 429 when user exceeds configured window limit")
    void ratingRateLimitedByUser() throws Exception {
        Country country = saveCountry("LT", "Lithuania", "EUR", "Euro");
        UserEntity user = saveUser("ratelimit-user@mail.com", country);
        DestinationEntity destination = saveDestination("Vilnius", "Vilnius", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);
        when(currentUser.id()).thenReturn(user.getId());

        String body = "{\"stars\":3}";
        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(header().exists("Retry-After"));
    }

    private Country saveCountry(String isoCode, String countryName, String currencyCode, String currencyName) {
        return countryRepository.save(Country.builder()
                .isoCode(isoCode)
                .countryName(countryName)
                .currencyCode(currencyCode)
                .currencyName(currencyName)
                .build());
    }

    private UserEntity saveUser(String email, Country country) {
        return userRepository.save(UserEntity.builder()
                .name("Test")
                .surname("User")
                .email(email)
                .passwordHash("hashed-password")
                .country(country)
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
    }

    private DestinationEntity saveDestination(String name, String location, String continent, Country country) {
        return destinationRepository.save(DestinationEntity.builder()
                .name(name)
                .location(location)
                .continent(continent)
                .country(country)
                .imageUrl("https://example.com/image.jpg")
                .imageAlt("Test")
                .overview("Overview")
                .budgetPerDay(50)
                .whyVisit("Why")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());
    }

    private TripEntity saveEndedTrip(Long userId, DestinationEntity destination) {
        LocalDate today = LocalDate.now();
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(today.minusDays(10))
                .returnDate(today.minusDays(1))
                .status("ongoing")
                .createdAt(Instant.now())
                .build());
    }
}
