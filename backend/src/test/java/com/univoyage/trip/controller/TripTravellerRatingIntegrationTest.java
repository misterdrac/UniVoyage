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
import org.assertj.core.api.Assertions;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class TripTravellerRatingIntegrationTest {

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
    @DisplayName("POST /api/trips/{id}/rating succeeds when return date has passed")
    void shouldAcceptRatingAfterReturnDate() throws Exception {
        Country country = saveCountry("HR", "Croatia", "EUR", "Euro");
        UserEntity user = saveUser("rater@mail.com", country);
        DestinationEntity destination = saveDestination("Split", "Split", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":4,\"comment\":\"Great trip\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating.stars").value(4))
                .andExpect(jsonPath("$.data.rating.comment").value("Great trip"));

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(4));

        DestinationEntity refreshed = destinationRepository.findById(destination.getId()).orElseThrow();
        Assertions.assertThat(refreshed.getTravellerRatingCount()).isEqualTo(1);
        Assertions.assertThat(refreshed.getTravellerRatingAverage())
                .isEqualByComparingTo(java.math.BigDecimal.valueOf(4.0));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 400 when trip has not ended")
    void shouldRejectRatingWhenTripNotEnded() throws Exception {
        Country country = saveCountry("DE", "Germany", "EUR", "Euro");
        UserEntity user = saveUser("early@mail.com", country);
        DestinationEntity destination = saveDestination("Berlin", "Berlin", "Europe", country);
        TripEntity trip = saveFutureTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 404 when trip is not owned by user")
    void shouldReturn404WhenNotOwner() throws Exception {
        Country country = saveCountry("IT", "Italy", "EUR", "Euro");
        UserEntity owner = saveUser("owner-r@mail.com", country);
        UserEntity other = saveUser("other-r@mail.com", country);
        DestinationEntity destination = saveDestination("Rome", "Rome", "Europe", country);
        TripEntity trip = saveEndedTrip(owner.getId(), destination);

        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":3}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
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

    private TripEntity saveFutureTrip(Long userId, DestinationEntity destination) {
        LocalDate today = LocalDate.now();
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(today.plusDays(1))
                .returnDate(today.plusDays(7))
                .status("planned")
                .createdAt(Instant.now())
                .build());
    }
}
