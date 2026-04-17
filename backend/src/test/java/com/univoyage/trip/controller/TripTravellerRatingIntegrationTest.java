package com.univoyage.trip.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;

import static org.hamcrest.Matchers.nullValue;
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
    private TripTravellerRatingRepository tripTravellerRatingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private CountryRepository countryRepository;

    @MockBean
    private CurrentUser currentUser;

    @Autowired
    private ObjectMapper objectMapper;

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
                .andExpect(jsonPath("$.data.rating.comment").value("Great trip"))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("PENDING"));

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(4));

        DestinationEntity beforeApprove = destinationRepository.findById(destination.getId()).orElseThrow();
        Assertions.assertThat(beforeApprove.getTravellerRatingCount()).isZero();

        approveReview(trip.getId(), user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));

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

    @Test
    @DisplayName("GET /api/trips/{id}/rating returns null rating when none submitted yet")
    void getRating_returnsNullWhenAbsent() throws Exception {
        Country country = saveCountry("PL", "Poland", "PLN", "Zloty");
        UserEntity user = saveUser("norating@mail.com", country);
        DestinationEntity destination = saveDestination("Krakow", "Krakow", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating").value(nullValue()));
    }

    @Test
    @DisplayName("GET /api/trips/{id}/rating returns 404 for unknown trip id")
    void getRating_returns404WhenTripMissing() throws Exception {
        Country country = saveCountry("SK", "Slovakia", "EUR", "Euro");
        UserEntity user = saveUser("get404@mail.com", country);
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/rating", 9_999_999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    @Test
    @DisplayName("GET /api/trips/{id}/rating returns 404 when trip belongs to another user")
    void getRating_returns404WhenNotOwner() throws Exception {
        Country country = saveCountry("SI", "Slovenia", "EUR", "Euro");
        UserEntity owner = saveUser("owner-get@mail.com", country);
        UserEntity other = saveUser("other-get@mail.com", country);
        DestinationEntity destination = saveDestination("Ljubljana", "Ljubljana", "Europe", country);
        TripEntity trip = saveEndedTrip(owner.getId(), destination);

        when(currentUser.id()).thenReturn(other.getId());

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating succeeds when return date is today")
    void shouldAcceptRatingWhenReturnDateIsToday() throws Exception {
        Country country = saveCountry("PT", "Portugal", "EUR", "Euro");
        UserEntity user = saveUser("today@mail.com", country);
        DestinationEntity destination = saveDestination("Porto", "Porto", "Europe", country);
        TripEntity trip = saveTripReturnToday(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(5))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating succeeds when status is completed even if return date is in the future")
    void shouldAcceptRatingWhenCompletedDespiteFutureReturn() throws Exception {
        Country country = saveCountry("GR", "Greece", "EUR", "Euro");
        UserEntity user = saveUser("completed@mail.com", country);
        DestinationEntity destination = saveDestination("Athens", "Athens", "Europe", country);
        TripEntity trip = saveCompletedTripFutureReturn(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(3))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating updates existing rating and refreshes destination aggregate")
    void shouldUpdateRatingOnSecondSubmit() throws Exception {
        Country country = saveCountry("NL", "Netherlands", "EUR", "Euro");
        UserEntity user = saveUser("update@mail.com", country);
        DestinationEntity destination = saveDestination("Utrecht", "Utrecht", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":2,\"comment\":\"Meh\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("PENDING"));

        approveReview(trip.getId(), user.getId());
        Assertions.assertThat(destinationRepository.findById(destination.getId()).orElseThrow().getTravellerRatingCount())
                .isEqualTo(1);

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5,\"comment\":\"Actually great\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(5))
                .andExpect(jsonPath("$.data.rating.comment").value("Actually great"))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("PENDING"));

        Assertions.assertThat(destinationRepository.findById(destination.getId()).orElseThrow().getTravellerRatingCount())
                .isZero();

        approveReview(trip.getId(), user.getId());

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(jsonPath("$.data.rating.stars").value(5));

        DestinationEntity refreshed = destinationRepository.findById(destination.getId()).orElseThrow();
        Assertions.assertThat(refreshed.getTravellerRatingCount()).isEqualTo(1);
        Assertions.assertThat(refreshed.getTravellerRatingAverage())
                .isEqualByComparingTo(java.math.BigDecimal.valueOf(5.0));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating treats whitespace-only comment as absent")
    void shouldNormalizeBlankCommentToNull() throws Exception {
        Country country = saveCountry("BE", "Belgium", "EUR", "Euro");
        UserEntity user = saveUser("blankc@mail.com", country);
        DestinationEntity destination = saveDestination("Bruges", "Bruges", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":4,\"comment\":\"   \\t\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.comment").value(nullValue()))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));

        mockMvc.perform(get("/api/trips/{tripId}/rating", trip.getId()))
                .andExpect(jsonPath("$.data.rating.comment").value(nullValue()));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 404 for unknown trip id")
    void postRating_returns404WhenTripMissing() throws Exception {
        Country country = saveCountry("AT", "Austria", "EUR", "Euro");
        UserEntity user = saveUser("post404@mail.com", country);
        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", 9_999_999_999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 400 when stars are below minimum")
    void shouldRejectStarsTooLow() throws Exception {
        Country country = saveCountry("CH", "Switzerland", "CHF", "Franc");
        UserEntity user = saveUser("lowstars@mail.com", country);
        DestinationEntity destination = saveDestination("Bern", "Bern", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.stars").exists());
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 400 when stars are above maximum")
    void shouldRejectStarsTooHigh() throws Exception {
        Country country = saveCountry("SE", "Sweden", "SEK", "Krona");
        UserEntity user = saveUser("highstars@mail.com", country);
        DestinationEntity destination = saveDestination("Malmo", "Malmo", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":6}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.stars").exists());
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 400 when comment exceeds max length")
    void shouldRejectCommentTooLong() throws Exception {
        Country country = saveCountry("NO", "Norway", "NOK", "Krone");
        UserEntity user = saveUser("longc@mail.com", country);
        DestinationEntity destination = saveDestination("Bergen", "Bergen", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        String body = objectMapper.writeValueAsString(Map.of(
                "stars", 5,
                "comment", "c".repeat(2001)));

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.comment").exists());
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating returns 400 when stars field is missing (defaults to 0)")
    void shouldRejectWhenStarsMissing() throws Exception {
        Country country = saveCountry("DK", "Denmark", "DKK", "Krone");
        UserEntity user = saveUser("nostars@mail.com", country);
        DestinationEntity destination = saveDestination("Aarhus", "Aarhus", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.stars").exists());
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating allows stars only with null comment in response")
    void shouldAcceptStarsWithoutComment() throws Exception {
        Country country = saveCountry("FI", "Finland", "EUR", "Euro");
        UserEntity user = saveUser("nocomment@mail.com", country);
        DestinationEntity destination = saveDestination("Tampere", "Tampere", "Europe", country);
        TripEntity trip = saveEndedTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.stars").value(1))
                .andExpect(jsonPath("$.data.rating.comment").value(nullValue()))
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("Multiple travellers rating the same destination updates average and count")
    void destinationAggregate_reflectsMultipleTrips() throws Exception {
        Country country = saveCountry("IE", "Ireland", "EUR", "Euro");
        UserEntity userA = saveUser("multi-a@mail.com", country);
        UserEntity userB = saveUser("multi-b@mail.com", country);
        DestinationEntity destination = saveDestination("Galway", "Galway", "Europe", country);
        TripEntity tripA = saveEndedTrip(userA.getId(), destination);
        TripEntity tripB = saveEndedTrip(userB.getId(), destination);

        when(currentUser.id()).thenReturn(userA.getId());
        mockMvc.perform(post("/api/trips/{tripId}/rating", tripA.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));

        when(currentUser.id()).thenReturn(userB.getId());
        mockMvc.perform(post("/api/trips/{tripId}/rating", tripB.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating.moderationStatus").value("APPROVED"));

        DestinationEntity refreshed = destinationRepository.findById(destination.getId()).orElseThrow();
        Assertions.assertThat(refreshed.getTravellerRatingCount()).isEqualTo(2);
        Assertions.assertThat(refreshed.getTravellerRatingAverage())
                .isEqualByComparingTo(java.math.BigDecimal.valueOf(3.0));
    }

    @Test
    @DisplayName("POST /api/trips/{id}/rating error message mentions eligibility when trip not ended")
    void shouldReturnClearMessageWhenNotEligible() throws Exception {
        Country country = saveCountry("LU", "Luxembourg", "EUR", "Euro");
        UserEntity user = saveUser("inelig@mail.com", country);
        DestinationEntity destination = saveDestination("Luxembourg", "Luxembourg", "Europe", country);
        TripEntity trip = saveFutureTrip(user.getId(), destination);

        when(currentUser.id()).thenReturn(user.getId());

        mockMvc.perform(post("/api/trips/{tripId}/rating", trip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stars\":5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(
                        "You can rate this trip only after it has ended (return date has passed or status is completed)."));
    }

    private void approveReview(long tripId, long userId) throws Exception {
        long ratingId = tripTravellerRatingRepository.findByTripIdAndUserId(tripId, userId).orElseThrow().getId();
        mockMvc.perform(post("/api/admin/reviews/{ratingId}/approve", ratingId))
                .andExpect(status().isOk());
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

    private TripEntity saveTripReturnToday(Long userId, DestinationEntity destination) {
        LocalDate today = LocalDate.now();
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(today.minusDays(5))
                .returnDate(today)
                .status("ongoing")
                .createdAt(Instant.now())
                .build());
    }

    private TripEntity saveCompletedTripFutureReturn(Long userId, DestinationEntity destination) {
        LocalDate today = LocalDate.now();
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(today.minusDays(1))
                .returnDate(today.plusDays(30))
                .status("completed")
                .createdAt(Instant.now())
                .build());
    }
}
