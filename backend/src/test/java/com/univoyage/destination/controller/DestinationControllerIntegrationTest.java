package com.univoyage.destination.controller;

import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for public {@link DestinationController} read endpoints.
 * <p>
 * Exercises {@link org.springframework.test.web.servlet.MockMvc} against the full application with
 * servlet filters enabled. Flyway may already seed destinations; assertions use Hamcrest
 * {@link org.hamcrest.Matchers#hasItem} on JSON arrays so tests stay stable when the catalog is non-empty.
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DestinationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    /**
     * {@code GET /api/destinations} must return HTTP 200 and include the inserted destination title
     * somewhere in {@code data.destinations} (response field is {@code title}, not {@code name}).
     */
    @Test
    @DisplayName("GET /api/destinations returns 200 and destinations list")
    void getAllDestinations() throws Exception {
        Country country = countryRepository.save(Country.builder()
                .isoCode("PT")
                .countryName("Portugal")
                .currencyCode("EUR")
                .currencyName("Euro")
                .build());

        destinationRepository.save(DestinationEntity.builder()
                .name("Lisbon")
                .location("Lisbon")
                .continent("Europe")
                .country(country)
                .imageUrl("https://example.com/lisbon.jpg")
                .imageAlt("Lisbon")
                .overview("Coastal capital")
                .budgetPerDay(80)
                .whyVisit("Great food")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinations").isArray())
                .andExpect(jsonPath("$.data.destinations[*].title", hasItem("Lisbon")));
    }

    /**
     * {@code GET /api/destinations/search} applies case-insensitive partial match on name or location;
     * query {@code Barce} should match {@code Barcelona}.
     */
    @Test
    @DisplayName("GET /api/destinations/search filters by query")
    void searchDestinations() throws Exception {
        Country country = countryRepository.save(Country.builder()
                .isoCode("ES")
                .countryName("Spain")
                .currencyCode("EUR")
                .currencyName("Euro")
                .build());

        destinationRepository.save(DestinationEntity.builder()
                .name("Barcelona")
                .location("Barcelona")
                .continent("Europe")
                .country(country)
                .imageUrl("https://example.com/bcn.jpg")
                .imageAlt("BCN")
                .overview("Mediterranean city")
                .budgetPerDay(90)
                .whyVisit("Architecture")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        mockMvc.perform(get("/api/destinations/search").param("query", "Barce"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinations").isArray())
                .andExpect(jsonPath("$.data.destinations[*].title", hasItem("Barcelona")));
    }

    /**
     * {@link com.univoyage.destination.service.DestinationService#search} returns an empty list when
     * {@code query} is null or blank, without error.
     */
    @Test
    @DisplayName("GET /api/destinations/search returns empty list for blank query")
    void searchWithBlankQueryReturnsEmpty() throws Exception {
        mockMvc.perform(get("/api/destinations/search").param("query", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinations").isArray())
                .andExpect(jsonPath("$.data.destinations.length()").value(0));
    }

    /**
     * Search string that matches no destination name or location yields an empty array (HTTP 200).
     */
    @Test
    @DisplayName("GET /api/destinations/search returns empty when nothing matches")
    void searchWithNoMatchesReturnsEmpty() throws Exception {
        mockMvc.perform(get("/api/destinations/search").param("query", "ZZZ_NO_MATCH_XYZ_12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.destinations").isArray())
                .andExpect(jsonPath("$.data.destinations.length()").value(0));
    }
}
