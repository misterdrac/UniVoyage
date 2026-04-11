package com.univoyage.destination.controller;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.trip.repository.TripTravellerRatingRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class DestinationReviewIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripTravellerRatingRepository tripTravellerRatingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CountryRepository countryRepository;

    @MockBean
    private CurrentUser currentUser;

    @Test
    @DisplayName("GET /api/destinations/{id}/reviews returns 404 when destination missing")
    void listReviews_destinationNotFound() throws Exception {
        mockMvc.perform(get("/api/destinations/{id}/reviews", 9_999_999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/destinations/{id}/reviews lists only approved text reviews")
    void listReviews_showsApprovedOnly() throws Exception {
        Country country = saveCountry("MT", "Malta", "EUR", "Euro");
        UserEntity user = saveUser("reviewer@mail.com", country);
        DestinationEntity destination = saveDestination("Valletta", "Valletta", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());
        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5,\"comment\":\"Wonderful place\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/destinations/{id}/reviews", destination.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reviews.content", hasSize(0)));

        long ratingId = tripTravellerRatingRepository.findByTripIdAndUserId(trip.getId(), user.getId()).orElseThrow().getId();
        mockMvc.perform(post("/api/admin/reviews/{id}/approve", ratingId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/destinations/{id}/reviews", destination.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reviews.content", hasSize(1)))
                .andExpect(jsonPath("$.data.reviews.content[0].stars").value(5))
                .andExpect(jsonPath("$.data.reviews.content[0].comment").value("Wonderful place"))
                .andExpect(jsonPath("$.data.reviews.content[0].reviewerDisplayName").value("Test U."))
                .andExpect(jsonPath("$.data.reviews.totalElements").value(1));
    }

    @Test
    @DisplayName("Rejected text review does not appear in public list")
    void listReviews_hidesRejected() throws Exception {
        Country country = saveCountry("CY", "Cyprus", "EUR", "Euro");
        UserEntity user = saveUser("reject-me@mail.com", country);
        DestinationEntity destination = saveDestination("Paphos", "Paphos", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());
        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":1,\"comment\":\"spam spam\"}"))
                .andExpect(status().isOk());

        long ratingId = tripTravellerRatingRepository.findByTripIdAndUserId(trip.getId(), user.getId()).orElseThrow().getId();
        mockMvc.perform(post("/api/admin/reviews/{id}/reject", ratingId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/destinations/{id}/reviews", destination.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reviews.content", hasSize(0)));
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
