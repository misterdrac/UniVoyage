package com.univoyage.trip.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.dto.CreateTripRequest;
import com.univoyage.trip.dto.TripResponse;
import com.univoyage.trip.model.TripBudgetEntity;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.model.TripItineraryEntity;
import com.univoyage.trip.repository.TripBudgetRepository;
import com.univoyage.trip.repository.TripItineraryRepository;
import com.univoyage.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final TripBudgetRepository tripBudgetRepository;
    private final TripItineraryRepository tripItineraryRepository;
    private final ObjectMapper objectMapper;

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

    @Transactional(readOnly = true)
    public List<TripResponse> getTrips(Long userId) {
        return tripRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteTrip(Long userId, Long tripId) {
        TripEntity trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        tripRepository.delete(trip);
    }

    @Transactional(readOnly = true)
    public Object getBudget(Long userId, Long tripId) {
        ensureOwner(userId, tripId);
        return tripBudgetRepository.findById(tripId)
                .map(e -> readJson(e.getPayload()))
                .orElse(null);
    }

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

    @Transactional(readOnly = true)
    public Object getItinerary(Long userId, Long tripId) {
        ensureOwner(userId, tripId);
        return tripItineraryRepository.findById(tripId)
                .map(e -> readJson(e.getPayload()))
                .orElse(null);
    }

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

    private void ensureOwner(Long userId, Long tripId) {
        if (!tripRepository.existsByIdAndUserId(tripId, userId)) {
            throw new ResourceNotFoundException("Trip not found");
        }
    }

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

    private Object readJson(String raw) {
        try { return objectMapper.readValue(raw, Object.class); }
        catch (Exception e) { throw new IllegalStateException("Invalid stored JSON"); }
    }

    private String writeJson(Object payload) {
        try { return objectMapper.writeValueAsString(payload); }
        catch (Exception e) { throw new IllegalArgumentException("Invalid JSON payload"); }
    }
}
