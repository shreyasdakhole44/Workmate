package com.sdproject.WorkMate.onboarding.repository;

import com.sdproject.WorkMate.onboarding.entity.OnboardingTask;
import com.sdproject.WorkMate.onboarding.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnboardingRepository extends JpaRepository<OnboardingTask, Long> {
    List<OnboardingTask> findByEmployeeIdOrderByCreatedAtAsc(Long employeeId);
    long countByEmployeeId(Long employeeId);
    long countByEmployeeIdAndStatus(Long employeeId, TaskStatus status);
}
