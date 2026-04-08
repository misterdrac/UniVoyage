package com.univoyage.trip.controller;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link HeatmapController} (DB-backed aggregation, no external APIs).
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class HeatmapControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TripRepository tripRepository;

    @Test
    @DisplayName("GET /api/heatmap returns points array (may be empty)")
    void heatmapReturnsOk() throws Exception {
        mockMvc.perform(get("/api/heatmap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.points").isArray());
    }

    @Test
    @DisplayName("GET /api/heatmap aggregates trip counts per destination")
    void heatmapAggregatesTripsPerDestination() throws Exception {
        UserEntity user = saveUser("heatmap-user@example.com");
        Country lu = country("LU");
        Country mt = country("MT");
        DestinationEntity d1 = saveDestination("HeatmapCityA", lu);
        DestinationEntity d2 = saveDestination("HeatmapCityB", mt);
        saveTrip(user.getId(), d1);
        saveTrip(user.getId(), d1);
        saveTrip(user.getId(), d2);

        mockMvc.perform(get("/api/heatmap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.points[0].destinationName").value("HeatmapCityA"))
                .andExpect(jsonPath("$.data.points[0].tripCount").value(2))
                .andExpect(jsonPath("$.data.points[1].destinationName").value("HeatmapCityB"))
                .andExpect(jsonPath("$.data.points[1].tripCount").value(1));
    }

    private Country country(String isoCode) {
        return countryRepository.findByIsoCode(isoCode)
                .orElseThrow(() -> new IllegalStateException("Test DB missing seeded country: " + isoCode));
    }

    private UserEntity saveUser(String email) {
        return userRepository.save(UserEntity.builder()
                .name("T")
                .surname("U")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
    }

    private DestinationEntity saveDestination(String name, Country c) {
        return destinationRepository.save(DestinationEntity.builder()
                .name(name)
                .location(name)
                .continent("Europe")
                .country(c)
                .imageUrl("https://example.com/x.jpg")
                .imageAlt(name)
                .overview("Overview")
                .budgetPerDay(50)
                .whyVisit("Why")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());
    }

    private TripEntity saveTrip(Long userId, DestinationEntity destination) {
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(14))
                .status("planned")
                .createdAt(Instant.now())
                .build());
    }
}
