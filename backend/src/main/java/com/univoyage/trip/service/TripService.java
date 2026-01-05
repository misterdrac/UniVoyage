package com.univoyage.trip.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.dto.CreateTripRequest;
import com.univoyage.trip.dto.TripResponse;
import com.univoyage.trip.dto.TripAccommodationRequest;
import com.univoyage.trip.dto.TripAccommodationResponse;
import com.univoyage.trip.model.TripBudgetEntity;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.model.TripItineraryEntity;
import com.univoyage.trip.model.TripAccommodationEntity;
import com.univoyage.trip.repository.TripBudgetRepository;
import com.univoyage.trip.repository.TripItineraryRepository;
import com.univoyage.trip.repository.TripAccommodationRepository;
import com.univoyage.trip.repository.TripRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Service class for managing trips.
 */
@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final TripBudgetRepository tripBudgetRepository;
    private final TripItineraryRepository tripItineraryRepository;
    private final TripAccommodationRepository tripAccommodationRepository;
    private final ObjectMapper objectMapper;

    /**
     * Creates a new trip for the specified user.
     *
     * @param userId The ID of the user creating the trip.
     * @param req    The request object containing trip details.
     * @return The created TripResponse object.
     */
    @Transactional
    public TripResponse createTrip(Long userId, CreateTripRequest req) {
        DestinationEntity dest = destinationRepository.findById(req.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        System.out.println("destinationId = " + req.getDestinationId());

        TripEntity trip = TripEntity.builder()
                .userId(userId)
                .destination(dest)
                .departureDate(LocalDate.parse(req.getDepartureDate()))
                .returnDate(LocalDate.parse(req.getReturnDate()))
                .status("planned")
                .createdAt(Instant.now())
                .build();

        TripEntity saved = tripRepository.save(trip);
        return toResponse(saved);
    }

    /**
     * Retrieves all trips for the specified user.
     *
     * @param userId The ID of the user whose trips are to be retrieved.
     * @return A list of TripResponse objects.
     */
    @Transactional(readOnly = true)
    public List<TripResponse> getTrips(Long userId) {
        return tripRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    /**
     * Deletes a trip for the specified user.
     *
     * @param userId The ID of the user deleting the trip.
     * @param tripId The ID of the trip to be deleted.
     */
    @Transactional
    public void deleteTrip(Long userId, Long tripId) {
        TripEntity trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        tripRepository.delete(trip);
    }

    /**
     * Retrieves the budget for a specific trip.
     *
     * @param userId The ID of the user requesting the budget.
     * @param tripId The ID of the trip whose budget is to be retrieved.
     * @return The budget object, or null if not found.
     */
    @Transactional(readOnly = true)
    public Object getBudget(Long userId, Long tripId) {
        ensureOwner(userId, tripId);
        return tripBudgetRepository.findById(tripId)
                .map(e -> readJson(e.getPayload()))
                .orElse(null);
    }

    /**
     * Saves the budget for a specific trip.
     *
     * @param userId  The ID of the user saving the budget.
     * @param tripId  The ID of the trip whose budget is to be saved.
     * @param payload The budget data to be saved.
     */
    @Transactional
    public void saveBudget(Long userId, Long tripId, Object payload) {
        ensureOwner(userId, tripId);
        tripBudgetRepository.save(
                TripBudgetEntity.builder()
                        .tripId(tripId)
                        .payload(writeJson(payload))
                        .updatedAt(Instant.now())
                        .build()
        );
    }

    /**
     * Retrieves the itinerary for a specific trip.
     *
     * @param userId The ID of the user requesting the itinerary.
     * @param tripId The ID of the trip whose itinerary is to be retrieved.
     * @return The itinerary object, or null if not found.
     */
    @Transactional(readOnly = true)
    public Object getItinerary(Long userId, Long tripId) {
        ensureOwner(userId, tripId);
        return tripItineraryRepository.findById(tripId)
                .map(e -> readJson(e.getPayload()))
                .orElse(null);
    }

    /**
     * Saves the itinerary for a specific trip.
     *
     * @param userId  The ID of the user saving the itinerary.
     * @param tripId  The ID of the trip whose itinerary is to be saved.
     * @param payload The itinerary data to be saved.
     */
    @Transactional
    public void saveItinerary(Long userId, Long tripId, Object payload) {
        ensureOwner(userId, tripId);
        tripItineraryRepository.save(
                TripItineraryEntity.builder()
                        .tripId(tripId)
                        .payload(writeJson(payload))
                        .updatedAt(Instant.now())
                        .build()
        );
    }

    /**
     * Retrieves the accommodation details for a specific trip.
     *
     * @param userId The ID of the user requesting the accommodation details.
     * @param tripId The ID of the trip whose accommodation details are to be retrieved.
     * @return The TripAccommodationResponse object, or null if not found.
     */
    @Transactional(readOnly = true)
    public TripAccommodationResponse getAccommodation(Long userId, Long tripId) {
        ensureOwner(userId, tripId);

        return tripAccommodationRepository.findById(tripId)
                .map(e -> TripAccommodationResponse.builder()
                        .tripId(tripId)
                        .accommodationName(e.getAccommodationName())
                        .accommodationAddress(e.getAccommodationAddress())
                        .accommodationPhone(e.getAccommodationPhone())
                        .updatedAt(e.getUpdatedAt())
                        .build()
                )
                .orElse(null);
    }

    /**
     * Saves the accommodation details for a specific trip.
     *
     * @param userId The ID of the user saving the accommodation details.
     * @param tripId The ID of the trip whose accommodation details are to be saved.
     * @param req    The TripAccommodationRequest object containing accommodation details.
     */
    @Transactional
    public void saveAccommodation(Long userId, Long tripId, TripAccommodationRequest req) {
        ensureOwner(userId, tripId);

        TripAccommodationEntity entity = TripAccommodationEntity.builder()
                .tripId(tripId)
                .accommodationName(req.getAccommodationName())
                .accommodationAddress(req.getAccommodationAddress())
                .accommodationPhone(req.getAccommodationPhone())
                .updatedAt(Instant.now())
                .build();

        tripAccommodationRepository.save(entity);
    }

    /**
     * Ensures that the specified user is the owner of the specified trip.
     *
     * @param userId The ID of the user.
     * @param tripId The ID of the trip.
     * @throws ResourceNotFoundException if the trip does not belong to the user.
     */
    private void ensureOwner(Long userId, Long tripId) {
        if (!tripRepository.existsByIdAndUserId(tripId, userId)) {
            throw new ResourceNotFoundException("Trip not found");
        }
    }

    /**
     * Converts a TripEntity to a TripResponse.
     *
     * @param t The TripEntity to convert.
     * @return The corresponding TripResponse.
     */
    private TripResponse toResponse(TripEntity t) {
        return TripResponse.builder()
                .id(t.getId())
                .destinationId(t.getDestination().getId())
                .destinationName(t.getDestination().getName())
                .destinationLocation(t.getDestination().getLocation())
                .departureDate(t.getDepartureDate().toString())
                .returnDate(t.getReturnDate().toString())
                .createdAt(t.getCreatedAt().toString())
                .status(t.getStatus())
                .build();
    }

    /**
     * Reads a JSON string and converts it to an Object.
     * @param raw
     * @return The deserialized Object.
     */
    private Object readJson(String raw) {
        try { return objectMapper.readValue(raw, Object.class); }
        catch (Exception e) { throw new IllegalStateException("Invalid stored JSON"); }
    }

    /**
     * Converts an Object to a JSON string.
     * @param payload The object to serialize.
     * @return The JSON string.
     */
    private String writeJson(Object payload) {
        try { return objectMapper.writeValueAsString(payload); }
        catch (Exception e) { throw new IllegalArgumentException("Invalid JSON payload"); }
    }
}
