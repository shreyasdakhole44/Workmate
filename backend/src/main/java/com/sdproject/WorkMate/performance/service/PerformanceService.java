package com.sdproject.WorkMate.performance.service;

import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.performance.dto.ReviewRequest;
import com.sdproject.WorkMate.performance.dto.ReviewResponse;
import com.sdproject.WorkMate.performance.entity.PerformanceReview;
import com.sdproject.WorkMate.performance.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdproject.WorkMate.notification.service.NotificationService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AiReviewService aiReviewService;
    private final NotificationService notificationService;

    // ── CREATE REVIEW ───────────────────────────────────────────────────────

    public ReviewResponse createReview(Long reviewerId, ReviewRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        Employee reviewer = employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer", "id", reviewerId));

        if (reviewerId.equals(request.getEmployeeId())) {
            throw new WorkmateException("You cannot review yourself.");
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewPeriod(request.getReviewPeriod())
                .score(request.getScore() != null ? request.getScore().intValue() : null)
                .feedbackText(request.getFeedbackText())
                .build();

        // Generate AI summary before saving
        try {
            String aiSummary = aiReviewService.generateReviewSummary(
                    employee.getFullName(),
                    employee.getDesignation(),
                    request.getScore() != null ? request.getScore().intValue() : 8,
                    request.getFeedbackText()
            );
            review.setAiSummary(aiSummary);
        } catch (Exception e) {
            // If the Groq call fails (rate limit, network, bad key),
            // don't block review creation — just log and continue
            // without a summary. The review itself still saves.
            log.warn("AI summary generation failed for employee {}: {}",
                    employee.getId(), e.getMessage());
            review.setAiSummary(null);
        }

        PerformanceReview savedReview = performanceRepository.save(review);

        try {
            notificationService.notifyReviewAdded(
                employee.getUser().getEmail(),
                employee.getFullName(),
                request.getReviewPeriod(),
                savedReview.getScore(),
                savedReview.getScoreLabel(),
                savedReview.getReviewer().getFullName(),
                savedReview.getAiSummary()
            );
        } catch (Exception e) {
            // Ignore, non-blocking
        }

        return mapToResponse(savedReview);
    }

    // ── GET PERSONAL REVIEWS ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReviewResponse> getEmployeeReviews(Long employeeId) {
        return performanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        PerformanceReview review = performanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
        return mapToResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return performanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── MAPPING HELPERS ────────────────────────────────────────────────────

    private ReviewResponse mapToResponse(PerformanceReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .employeeId(review.getEmployee().getId())
                .employeeName(review.getEmployee().getFullName())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFullName())
                .reviewPeriod(review.getReviewPeriod())
                .score(review.getScore())
                .feedbackText(review.getFeedbackText())
                .aiSummary(review.getAiSummary())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
