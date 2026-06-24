package com.sdproject.WorkMate.performance.repository;

import com.sdproject.WorkMate.performance.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceRepository extends JpaRepository<PerformanceReview, Long> {
    
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    
    List<PerformanceReview> findByReviewerId(Long reviewerId);
}
