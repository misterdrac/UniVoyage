package com.univoyage.admin.review.controller;

import com.univoyage.admin.review.dto.AdminPendingReviewPageResponse;
import com.univoyage.admin.review.service.AdminReviewService;
import com.univoyage.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<AdminPendingReviewPageResponse>> listPending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(adminReviewService.listPending(pageable)));
    }

    @PostMapping("/{ratingId}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable long ratingId) {
        adminReviewService.approve(ratingId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{ratingId}/reject")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable long ratingId) {
        adminReviewService.reject(ratingId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
