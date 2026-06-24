package com.sdproject.WorkMate.payroll.service;

import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.payroll.entity.*;
import com.sdproject.WorkMate.payroll.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PayrollService {

    private final SalaryStructureRepository salaryStructureRepo;
    private final PayslipRepository payslipRepo;
    private final PromotionRepository promotionRepo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;

    // ── SALARY STRUCTURES ─────────────────────────────────────────

    public SalaryStructure saveSalaryStructure(Long employeeId, BigDecimal basicSalary, BigDecimal hra, 
                                               BigDecimal medicalAllowance, BigDecimal otherAllowances, 
                                               BigDecimal specialAllowance, BigDecimal conveyanceAllowance,
                                               BigDecimal performanceBonus, BigDecimal providentFund, 
                                               BigDecimal professionalTax, BigDecimal incomeTax, BigDecimal esi) {
        Employee emp = employeeRepo.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        SalaryStructure struct = salaryStructureRepo.findByEmployeeId(employeeId)
            .orElse(SalaryStructure.builder().employee(emp).build());

        struct.setBasicSalary(basicSalary);
        struct.setHra(hra);
        struct.setMedicalAllowance(medicalAllowance);
        struct.setOtherAllowances(otherAllowances);
        struct.setSpecialAllowance(specialAllowance != null ? specialAllowance : BigDecimal.ZERO);
        struct.setConveyanceAllowance(conveyanceAllowance != null ? conveyanceAllowance : BigDecimal.ZERO);
        struct.setPerformanceBonus(performanceBonus != null ? performanceBonus : BigDecimal.ZERO);
        struct.setProvidentFund(providentFund);
        struct.setProfessionalTax(professionalTax);
        struct.setIncomeTax(incomeTax != null ? incomeTax : BigDecimal.ZERO);
        struct.setEsi(esi != null ? esi : BigDecimal.ZERO);

        // Update employee's base salary field to match net salary
        emp.setSalary(struct.getNetSalary());
        employeeRepo.save(emp);

        return salaryStructureRepo.save(struct);
    }

    @Transactional(readOnly = true)
    public Optional<SalaryStructure> getSalaryStructure(Long employeeId) {
        return salaryStructureRepo.findByEmployeeId(employeeId);
    }

    // ── PAYSLIPS ──────────────────────────────────────────────────

    public Payslip generatePayslip(Long employeeId, Integer year, Integer month) {
        Employee emp = employeeRepo.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        SalaryStructure struct = salaryStructureRepo.findByEmployeeId(employeeId)
            .orElseThrow(() -> new WorkmateException("Salary structure not defined for employee: " + emp.getFullName()));

        // If payslip already exists for this year and month, delete it first to overwrite
        payslipRepo.findByEmployeeIdAndYearAndMonth(employeeId, year, month)
            .ifPresent(payslipRepo::delete);

        Payslip payslip = Payslip.builder()
            .employee(emp)
            .year(year)
            .month(month)
            .basicSalary(struct.getBasicSalary())
            .hra(struct.getHra())
            .medicalAllowance(struct.getMedicalAllowance())
            .otherAllowances(struct.getOtherAllowances())
            .specialAllowance(struct.getSpecialAllowance() != null ? struct.getSpecialAllowance() : BigDecimal.ZERO)
            .conveyanceAllowance(struct.getConveyanceAllowance() != null ? struct.getConveyanceAllowance() : BigDecimal.ZERO)
            .performanceBonus(struct.getPerformanceBonus() != null ? struct.getPerformanceBonus() : BigDecimal.ZERO)
            .providentFund(struct.getProvidentFund())
            .professionalTax(struct.getProfessionalTax())
            .incomeTax(struct.getIncomeTax() != null ? struct.getIncomeTax() : BigDecimal.ZERO)
            .esi(struct.getEsi() != null ? struct.getEsi() : BigDecimal.ZERO)
            .grossSalary(struct.getGrossSalary())
            .netSalary(struct.getNetSalary())
            .status("PAID")
            .build();

        return payslipRepo.save(payslip);
    }

    @Transactional(readOnly = true)
    public List<Payslip> getEmployeePayslips(Long employeeId) {
        return payslipRepo.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
    }

    @Transactional(readOnly = true)
    public Payslip getPayslip(Long payslipId) {
        return payslipRepo.findById(payslipId)
            .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", payslipId));
    }

    // ── PROMOTIONS & ROLES ─────────────────────────────────────────

    public PromotionHistory promoteEmployee(Long employeeId, String newRole, String newDesignation, 
                                            BigDecimal newSalary, String notes) {
        Employee emp = employeeRepo.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        User user = emp.getUser();
        if (user == null) {
            throw new WorkmateException("User account not found for employee: " + emp.getFullName());
        }

        String prevRole = user.getRole().name();
        String prevDesignation = emp.getDesignation();
        BigDecimal prevSalary = emp.getSalary();

        // 1. Update User Role (if changed)
        if (newRole != null && !newRole.trim().isEmpty()) {
            try {
                Role roleEnum = Role.valueOf(newRole.toUpperCase());
                user.setRole(roleEnum);
                userRepo.save(user);
            } catch (IllegalArgumentException e) {
                throw new WorkmateException("Invalid role value: " + newRole);
            }
        }

        // 2. Update Employee Designation
        if (newDesignation != null && !newDesignation.trim().isEmpty()) {
            emp.setDesignation(newDesignation);
        }

        // 3. Update Employee Salary and scale Salary Structure (if changed)
        if (newSalary != null && newSalary.compareTo(BigDecimal.ZERO) > 0) {
            emp.setSalary(newSalary);

            // Scale salary structure components proportionally (Net = Salary)
            // Target components:
            // Basic: 50%, HRA: 30%, Medical: 10%, Other: 10%, PF: 12% of basic, PT: 200
            // Since Net = Gross - Deductions, we need to balance it out
            // Let's set basic, HRA, med, other. Deduct PF and PT.
            BigDecimal basic = newSalary.multiply(new BigDecimal("0.50"));
            BigDecimal hra = newSalary.multiply(new BigDecimal("0.30"));
            BigDecimal med = newSalary.multiply(new BigDecimal("0.10"));
            BigDecimal other = newSalary.multiply(new BigDecimal("0.10"));
            BigDecimal pf = basic.multiply(new BigDecimal("0.12"));
            BigDecimal pt = new BigDecimal("200.00");

            saveSalaryStructure(employeeId, basic, hra, med, other, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, pf, pt, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        employeeRepo.save(emp);

        // 4. Record Promotion History log
        PromotionHistory history = PromotionHistory.builder()
            .employee(emp)
            .previousRole(prevRole)
            .newRole(user.getRole().name())
            .previousDesignation(prevDesignation)
            .newDesignation(emp.getDesignation())
            .previousSalary(prevSalary)
            .newSalary(emp.getSalary())
            .notes(notes)
            .build();

        return promotionRepo.save(history);
    }

    @Transactional(readOnly = true)
    public List<PromotionHistory> getEmployeePromotionHistory(Long employeeId) {
        return promotionRepo.findByEmployeeIdOrderByPromotionDateDesc(employeeId);
    }

    @Transactional(readOnly = true)
    public List<PromotionHistory> getAllPromotionHistory() {
        return promotionRepo.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "promotionDate"));
    }

    @Transactional(readOnly = true)
    public List<Payslip> getAllPayslips() {
        return payslipRepo.findAll();
    }
}
