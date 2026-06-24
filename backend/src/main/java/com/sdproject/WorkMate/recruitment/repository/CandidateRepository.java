package com.sdproject.WorkMate.recruitment.repository;

import com.sdproject.WorkMate.recruitment.entity.Candidate;
import com.sdproject.WorkMate.recruitment.entity.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByJobPostingIdOrderByAppliedAtDesc(Long jobPostingId);
    List<Candidate> findByStatus(CandidateStatus status);
    long countByJobPostingId(Long jobPostingId);
}
