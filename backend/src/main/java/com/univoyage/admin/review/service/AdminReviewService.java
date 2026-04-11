package com.univoyage.admin.review.service;

import com.univoyage.admin.review.dto.AdminPendingReviewPageResponse;
import com.univoyage.admin.review.dto.AdminPendingReviewResponse;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.trip.model.ReviewModerationStatus;
import com.univoyage.trip.model.TripTravellerRatingEntity;
import com.univoyage.trip.repository.TripTravellerRatingRepository;
import com.univoyage.trip.service.TripTravellerRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final TripTravellerRatingRepository ratingRepository;
    private final TripTravellerRatingService tripTravellerRatingService;

    @Transactional(readOnly = true)
    public AdminPendingReviewPageResponse listPending(Pageable pageable) {
        Page<TripTravellerRatingEntity> page = ratingRepository.findByModerationStatusOrderByUpdatedAtAsc(
                ReviewModerationStatus.PENDING,
                pageable);
        return new AdminPendingReviewPageResponse(
                page.getContent().stream().map(this::toPendingDto).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber());
    }

    @Transactional
    public void approve(long ratingId) {
        TripTravellerRatingEntity r = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (r.getModerationStatus() == ReviewModerationStatus.APPROVED) {
            return;
        }
        if (r.getModerationStatus() != ReviewModerationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending reviews can be approved.");
        }
        r.setModerationStatus(ReviewModerationStatus.APPROVED);
        ratingRepository.save(r);
        tripTravellerRatingService.recomputeTravellerStatsForDestination(r.getTrip().getDestination().getId());
    }

    @Transactional
    public void reject(long ratingId) {
        TripTravellerRatingEntity r = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (r.getModerationStatus() == ReviewModerationStatus.REJECTED) {
            return;
        }
        if (r.getModerationStatus() != ReviewModerationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending reviews can be rejected.");
        }
        r.setModerationStatus(ReviewModerationStatus.REJECTED);
        ratingRepository.save(r);
        tripTravellerRatingService.recomputeTravellerStatsForDestination(r.getTrip().getDestination().getId());
    }

    private AdminPendingReviewResponse toPendingDto(TripTravellerRatingEntity r) {
        return new AdminPendingReviewResponse(
                r.getId(),
                r.getTrip().getId(),
                r.getTrip().getDestination().getId(),
                r.getTrip().getDestination().getName(),
                r.getUser().getEmail(),
                r.getStars() == null ? 0 : r.getStars().intValue(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt());
    }
}
