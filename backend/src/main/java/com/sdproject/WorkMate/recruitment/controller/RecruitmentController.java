package com.sdproject.WorkMate.recruitment.controller;

import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.recruitment.dto.*;
import com.sdproject.WorkMate.recruitment.entity.CandidateStatus;
import com.sdproject.WorkMate.recruitment.entity.Interview;
import com.sdproject.WorkMate.recruitment.service.RecruitmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
@Tag(name = "Recruitment Management", description = "Endpoints for job postings, candidates, and interviews")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    // ── JOB POSTINGS ──────────────────────────────────────────────

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create Job Posting", description = "Admin or HR Manager only. Creates a new job vacancy.")
    public ResponseEntity<ApiResponse<JobPostingResponse>> createJob(@Valid @RequestBody JobPostingRequest req) {
        JobPostingResponse response = recruitmentService.createJob(req);
        return ResponseEntity.ok(ApiResponse.success("Job posting created successfully.", response));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Get Active Job Postings", description = "Fetch all open job openings.")
    public ResponseEntity<ApiResponse<List<JobPostingResponse>>> getActiveJobs() {
        List<JobPostingResponse> response = recruitmentService.getAllActiveJobs();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/jobs/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Close Job Posting", description = "Admin or HR Manager only. Marks job as inactive.")
    public ResponseEntity<ApiResponse<Void>> closeJob(@PathVariable Long id) {
        recruitmentService.closeJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting closed successfully.", null));
    }

    // ── CANDIDATES ────────────────────────────────────────────────

    @PostMapping("/candidates")
    @Operation(summary = "Add Candidate Application", description = "Submits a candidate application for a job posting.")
    public ResponseEntity<ApiResponse<CandidateResponse>> addCandidate(@Valid @RequestBody CandidateRequest req) {
        CandidateResponse response = recruitmentService.addCandidate(req);
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully.", response));
    }

    @GetMapping("/jobs/{jobId}/candidates")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get Candidates by Job", description = "Admin or HR Manager only. Fetch all applications for a specific job.")
    public ResponseEntity<ApiResponse<List<CandidateResponse>>> getCandidatesByJob(@PathVariable Long jobId) {
        List<CandidateResponse> response = recruitmentService.getCandidatesByJob(jobId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/candidates/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update Candidate Status", description = "Admin or HR Manager only. Advances candidate through recruitment pipeline.")
    public ResponseEntity<ApiResponse<CandidateResponse>> updateCandidateStatus(
            @PathVariable Long id,
            @RequestParam CandidateStatus status,
            @RequestParam(required = false) String notes) {
        CandidateResponse response = recruitmentService.updateCandidateStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Candidate status updated successfully.", response));
    }

    // ── INTERVIEWS ────────────────────────────────────────────────

    @PostMapping("/interviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Schedule Interview", description = "Admin or HR Manager only. Schedules an interview with a candidate.")
    public ResponseEntity<ApiResponse<Interview>> scheduleInterview(@Valid @RequestBody InterviewRequest req) {
        Interview response = recruitmentService.scheduleInterview(req);
        return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully.", response));
    }

    @PutMapping("/interviews/{id}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Submit Interview Feedback", description = "Admin or HR Manager only. Submit ratings and decision for the candidate.")
    public ResponseEntity<ApiResponse<Interview>> submitFeedback(
            @PathVariable Long id,
            @RequestParam String feedback,
            @RequestParam Integer rating,
            @RequestParam String result) {
        Interview response = recruitmentService.submitFeedback(id, feedback, rating, result);
        return ResponseEntity.ok(ApiResponse.success("Interview feedback recorded successfully.", response));
    }
}
