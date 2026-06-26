package com.sdproject.WorkMate.recruitment.service;

import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.recruitment.dto.*;
import com.sdproject.WorkMate.recruitment.entity.*;
import com.sdproject.WorkMate.recruitment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.notification.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecruitmentService {

    private final JobPostingRepository jobRepo;
    private final CandidateRepository  candidateRepo;
    private final InterviewRepository  interviewRepo;
    private final EmployeeRepository   employeeRepo;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;

    // ── JOB POSTINGS ──────────────────────────────────────────────

    public JobPostingResponse createJob(JobPostingRequest req) {
        JobPosting job = JobPosting.builder()
            .title(req.getTitle()).department(req.getDepartment())
            .description(req.getDescription()).requirements(req.getRequirements())
            .openings(req.getOpenings()).deadline(req.getDeadline())
            .isActive(true).build();
        return mapJob(jobRepo.save(job));
    }

    @Transactional(readOnly = true)
    public List<JobPostingResponse> getAllActiveJobs() {
        return jobRepo.findByIsActiveTrueOrderByCreatedAtDesc()
            .stream().map(this::mapJob).collect(Collectors.toList());
    }

    public void closeJob(Long id) {
        JobPosting job = jobRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosting","id",id));
        job.setIsActive(false);
        jobRepo.save(job);
    }

    // ── CANDIDATES ────────────────────────────────────────────────

    public CandidateResponse addCandidate(CandidateRequest req) {
        JobPosting job = jobRepo.findById(req.getJobPostingId())
            .orElseThrow(() -> new ResourceNotFoundException("JobPosting","id",req.getJobPostingId()));
        Candidate c = Candidate.builder()
            .jobPosting(job).name(req.getName()).email(req.getEmail())
            .phone(req.getPhone()).resumeUrl(req.getResumeUrl())
            .experienceYears(req.getExperienceYears()).notes(req.getNotes())
            .status(CandidateStatus.APPLIED).build();
        Candidate savedCandidate = candidateRepo.save(c);

        try {
            List<User> hrUsers = userRepository.findByRoleIn(List.of(Role.HR_MANAGER, Role.ADMIN));
            hrUsers.forEach(hr -> {
                try {
                    notificationService.notifyHrNewCandidate(
                        hr.getEmail(),
                        hr.getRole() == Role.ADMIN ? "Admin" : "HR Team",
                        savedCandidate.getName(),
                        savedCandidate.getEmail(),
                        job.getTitle(),
                        job.getDepartment(),
                        req.getExperienceYears(),
                        savedCandidate.getResumeUrl()
                    );
                } catch (Exception e) {
                    // Ignore, non-blocking
                }
            });
        } catch (Exception e) {
            // Ignore, non-blocking
        }

        return mapCandidate(savedCandidate);
    }

    @Transactional(readOnly = true)
    public List<CandidateResponse> getCandidatesByJob(Long jobId) {
        return candidateRepo.findByJobPostingIdOrderByAppliedAtDesc(jobId)
            .stream().map(this::mapCandidate).collect(Collectors.toList());
    }

    public CandidateResponse updateCandidateStatus(Long id, CandidateStatus status, String notes) {
        Candidate c = candidateRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Candidate","id",id));
        c.setStatus(status);
        if (notes != null) c.setNotes(notes);
        c.setStatusUpdatedAt(LocalDateTime.now());
        return mapCandidate(candidateRepo.save(c));
    }

    // ── INTERVIEWS ────────────────────────────────────────────────

    public Interview scheduleInterview(InterviewRequest req) {
        Candidate c = candidateRepo.findById(req.getCandidateId())
            .orElseThrow(() -> new ResourceNotFoundException("Candidate","id",req.getCandidateId()));
        Employee interviewer = null;
        if (req.getInterviewerId() != null)
            interviewer = employeeRepo.findById(req.getInterviewerId()).orElse(null);

        // update candidate status
        c.setStatus(CandidateStatus.INTERVIEW_SCHEDULED);
        c.setStatusUpdatedAt(LocalDateTime.now());
        candidateRepo.save(c);

        Interview interview = Interview.builder()
            .candidate(c).interviewer(interviewer)
            .scheduledAt(req.getScheduledAt()).mode(req.getMode())
            .meetingLink(req.getMeetingLink()).result("PENDING").build();
        return interviewRepo.save(interview);
    }

    public Interview submitFeedback(Long interviewId, String feedback, Integer rating, String result) {
        Interview iv = interviewRepo.findById(interviewId).orElse(null);
        if (iv == null) {
            // Fallback: look up by candidate ID (since frontend passes candidate ID)
            List<Interview> interviews = interviewRepo.findByCandidateIdOrderByScheduledAtDesc(interviewId);
            if (!interviews.isEmpty()) {
                iv = interviews.get(0);
            }
        }
        if (iv == null) {
            throw new ResourceNotFoundException("Interview", "id or candidateId", interviewId);
        }
        iv.setFeedback(feedback);
        iv.setRating(rating);
        iv.setResult(result);
        if ("PASSED".equals(result))
            updateCandidateStatus(iv.getCandidate().getId(), CandidateStatus.SELECTED, null);
        else if ("FAILED".equals(result))
            updateCandidateStatus(iv.getCandidate().getId(), CandidateStatus.REJECTED, null);
        else if ("ON_HOLD".equals(result))
            updateCandidateStatus(iv.getCandidate().getId(), CandidateStatus.ON_HOLD, null);
        return interviewRepo.save(iv);
    }

    // ── MAPPERS ───────────────────────────────────────────────────

    private JobPostingResponse mapJob(JobPosting j) {
        return JobPostingResponse.builder()
            .id(j.getId()).title(j.getTitle()).department(j.getDepartment())
            .description(j.getDescription()).requirements(j.getRequirements())
            .openings(j.getOpenings()).deadline(j.getDeadline())
            .isActive(j.getIsActive()).createdAt(j.getCreatedAt())
            .candidateCount(candidateRepo.countByJobPostingId(j.getId()))
            .build();
    }

    private CandidateResponse mapCandidate(Candidate c) {
        return CandidateResponse.builder()
            .id(c.getId()).jobPostingId(c.getJobPosting().getId())
            .jobTitle(c.getJobPosting().getTitle())
            .name(c.getName()).email(c.getEmail()).phone(c.getPhone())
            .resumeUrl(c.getResumeUrl()).experienceYears(c.getExperienceYears())
            .status(c.getStatus()).notes(c.getNotes()).appliedAt(c.getAppliedAt())
            .build();
    }
}
