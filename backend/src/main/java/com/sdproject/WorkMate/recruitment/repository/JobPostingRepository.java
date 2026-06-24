package com.sdproject.WorkMate.recruitment.repository;

import com.sdproject.WorkMate.recruitment.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByIsActiveTrueOrderByCreatedAtDesc();
    List<JobPosting> findByDepartmentAndIsActiveTrue(String department);
}
