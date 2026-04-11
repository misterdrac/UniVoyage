package com.univoyage.destination.service;

import com.univoyage.destination.dto.DestinationReviewPublicResponse;
import com.univoyage.destination.dto.DestinationReviewsPageResponse;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.model.ReviewModerationStatus;
import com.univoyage.trip.model.TripTravellerRatingEntity;
import com.univoyage.trip.repository.TripTravellerRatingRepository;
import com.univoyage.trip.util.ReviewerDisplayNameFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DestinationReviewService {

    private final DestinationRepository destinationRepository;
    private final TripTravellerRatingRepository tripTravellerRatingRepository;

    @Transactional(readOnly = true)
    public DestinationReviewsPageResponse listPublishedReviews(Long destinationId, Pageable pageable) {
        if (!destinationRepository.existsById(destinationId)) {
            throw new ResourceNotFoundException("Destination not found");
        }
        Page<TripTravellerRatingEntity> page = tripTravellerRatingRepository.findPublishedTextReviews(
                destinationId,
                ReviewModerationStatus.APPROVED,
                pageable);
        return new DestinationReviewsPageResponse(
                page.getContent().stream().map(this::toPublic).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber());
    }

    private DestinationReviewPublicResponse toPublic(TripTravellerRatingEntity r) {
        return new DestinationReviewPublicResponse(
                r.getId(),
                r.getStars() == null ? 0 : r.getStars().intValue(),
                r.getComment(),
                ReviewerDisplayNameFormatter.format(r.getUser()),
                r.getUpdatedAt());
    }
}
