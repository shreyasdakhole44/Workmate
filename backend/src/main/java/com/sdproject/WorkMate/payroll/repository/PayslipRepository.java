package com.sdproject.WorkMate.payroll.repository;

import com.sdproject.WorkMate.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
    Optional<Payslip> findByEmployeeIdAndYearAndMonth(Long employeeId, Integer year, Integer month);
}
