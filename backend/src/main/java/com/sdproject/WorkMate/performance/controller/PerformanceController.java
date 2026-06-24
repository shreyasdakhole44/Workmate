package com.sdproject.WorkMate.performance.controller;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.performance.dto.ReviewRequest;
import com.sdproject.WorkMate.performance.dto.ReviewResponse;
import com.sdproject.WorkMate.performance.service.PerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@Tag(name = "Performance Management", description = "Endpoints for employee performance reviews")
public class PerformanceController {

    private final PerformanceService performanceService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    // ── CREATE REVIEW (ADMIN/HR) ───────────────────────────────────────────
    @PostMapping("/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Submit Performance Review", description = "Admin or HR Manager only. Creates a review for an employee.")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request) {

        Long reviewerEmpId = getCurrentEmployeeId(authentication);
        ReviewResponse response = performanceService.createReview(reviewerEmpId, request);
        return ResponseEntity.ok(ApiResponse.success("Performance review submitted successfully", response));
    }

    // ── GET ALL REVIEWS (ADMIN/HR) ─────────────────────────────────────────
    @GetMapping("/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get All Reviews", description = "Admin and HR Manager only. Fetches all performance reviews.")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        List<ReviewResponse> response = performanceService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET PERSONAL REVIEWS ────────────────────────────────────────────────
    @GetMapping("/my-reviews")
    @Operation(summary = "Get My Reviews", description = "Fetches all performance reviews written for the logged-in employee.")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        List<ReviewResponse> response = performanceService.getEmployeeReviews(empId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET REVIEW BY ID (ADMIN/HR/SELF) ────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelf(#id, authentication.name)")
    @Operation(summary = "Get Review by ID", description = "Admin, HR Manager, or the reviewed employee themselves.")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        ReviewResponse response = performanceService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET REVIEWS FOR EMPLOYEE (ADMIN/HR/SELF) ───────────────────────────
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelf(#employeeId, authentication.name)")
    @Operation(summary = "Get Reviews for Employee", description = "Admin, HR Manager, or the reviewed employee themselves.")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getEmployeeReviews(@PathVariable Long employeeId) {
        List<ReviewResponse> response = performanceService.getEmployeeReviews(employeeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── HELPER TO GET CURRENT EMPLOYEE ID ──────────────────────────────────
    private Long getCurrentEmployeeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User account not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WorkmateException("Employee profile not linked to this user account"));
        return employee.getId();
    }
}
