package com.univoyage.trip.service;

import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.dto.TripTravellerRatingRequest;
import com.univoyage.trip.dto.TripTravellerRatingResponse;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.model.TripTravellerRatingEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.trip.repository.TripTravellerRatingRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TripTravellerRatingService {

    private final TripRepository tripRepository;
    private final TripTravellerRatingRepository ratingRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public TripTravellerRatingResponse getRating(Long userId, Long tripId) {
        tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        return ratingRepository.findByTripIdAndUserId(tripId, userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public TripTravellerRatingResponse submitRating(Long userId, Long tripId, TripTravellerRatingRequest request) {
        TripEntity trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (!isEligibleToRate(trip)) {
            throw new IllegalArgumentException(
                    "You can rate this trip only after it has ended (return date has passed or status is completed)."
            );
        }

        Long destinationId = trip.getDestination().getId();
        UserEntity userRef = userRepository.getReferenceById(userId);

        String comment = request.getComment();
        if (comment != null && comment.isBlank()) {
            comment = null;
        }

        TripTravellerRatingEntity entity = ratingRepository.findByTripIdAndUserId(tripId, userId)
                .orElseGet(() -> TripTravellerRatingEntity.builder()
                        .trip(trip)
                        .user(userRef)
                        .build());

        entity.setStars((short) request.getStars());
        entity.setComment(comment);
        ratingRepository.save(entity);

        refreshDestinationTravellerStats(destinationId);
        return toResponse(entity);
    }

    private static boolean isEligibleToRate(TripEntity trip) {
        LocalDate today = LocalDate.now();
        boolean returnPassedOrToday = !trip.getReturnDate().isAfter(today);
        boolean completed = "completed".equalsIgnoreCase(trip.getStatus());
        return returnPassedOrToday || completed;
    }

    private void refreshDestinationTravellerStats(Long destinationId) {
        long count = ratingRepository.countForDestinationId(destinationId);
        Double avgRaw = ratingRepository.averageStarsForDestinationId(destinationId);
        BigDecimal avg = null;
        if (count > 0 && avgRaw != null) {
            avg = BigDecimal.valueOf(avgRaw).setScale(1, RoundingMode.HALF_UP);
        }

        destinationRepository.updateTravellerRatingStats(destinationId, avg, (int) count);
    }

    private TripTravellerRatingResponse toResponse(TripTravellerRatingEntity e) {
        return TripTravellerRatingResponse.builder()
                .stars(e.getStars() == null ? 0 : e.getStars().intValue())
                .comment(e.getComment())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
