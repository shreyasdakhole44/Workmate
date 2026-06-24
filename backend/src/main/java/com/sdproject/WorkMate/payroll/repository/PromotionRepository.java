package com.sdproject.WorkMate.payroll.repository;

import com.sdproject.WorkMate.payroll.entity.PromotionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionHistory, Long> {
    List<PromotionHistory> findByEmployeeIdOrderByPromotionDateDesc(Long employeeId);
}
