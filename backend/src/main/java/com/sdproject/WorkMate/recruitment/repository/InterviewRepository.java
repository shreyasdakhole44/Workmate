package com.sdproject.WorkMate.recruitment.repository;

import com.sdproject.WorkMate.recruitment.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidateIdOrderByScheduledAtDesc(Long candidateId);
    List<Interview> findByInterviewerIdOrderByScheduledAtDesc(Long interviewerId);
}
