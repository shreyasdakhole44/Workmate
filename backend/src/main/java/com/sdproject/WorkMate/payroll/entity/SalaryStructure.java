package com.sdproject.WorkMate.payroll.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "salary_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true, nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private BigDecimal basicSalary;

    @Column(nullable = false)
    private BigDecimal hra;

    @Column(nullable = false)
    private BigDecimal medicalAllowance;

    @Column(nullable = false)
    private BigDecimal otherAllowances;

    @Column(nullable = false)
    private BigDecimal providentFund; // Deduction

    @Column(nullable = false)
    private BigDecimal professionalTax; // Deduction

    @Column(nullable = false)
    private BigDecimal specialAllowance;

    @Column(nullable = false)
    private BigDecimal conveyanceAllowance;

    @Column(nullable = false)
    private BigDecimal performanceBonus;

    @Column(nullable = false)
    private BigDecimal incomeTax;

    @Column(nullable = false)
    private BigDecimal esi;

    public BigDecimal getGrossSalary() {
        return basicSalary
            .add(hra)
            .add(medicalAllowance)
            .add(otherAllowances)
            .add(specialAllowance != null ? specialAllowance : BigDecimal.ZERO)
            .add(conveyanceAllowance != null ? conveyanceAllowance : BigDecimal.ZERO)
            .add(performanceBonus != null ? performanceBonus : BigDecimal.ZERO);
    }

    public BigDecimal getTotalDeductions() {
        BigDecimal pf = providentFund != null ? providentFund : BigDecimal.ZERO;
        BigDecimal pt = professionalTax != null ? professionalTax : BigDecimal.ZERO;
        BigDecimal it = incomeTax != null ? incomeTax : BigDecimal.ZERO;
        BigDecimal e = esi != null ? esi : BigDecimal.ZERO;
        return pf.add(pt).add(it).add(e);
    }

    public BigDecimal getNetSalary() {
        return getGrossSalary().subtract(getTotalDeductions());
    }
}
