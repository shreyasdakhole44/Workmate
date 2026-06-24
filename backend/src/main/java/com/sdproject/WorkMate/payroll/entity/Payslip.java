package com.sdproject.WorkMate.payroll.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslips", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "year", "month"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month; // 1 = January, ..., 12 = December

    @Column(nullable = false)
    private BigDecimal basicSalary;

    @Column(nullable = false)
    private BigDecimal hra;

    @Column(nullable = false)
    private BigDecimal medicalAllowance;

    @Column(nullable = false)
    private BigDecimal otherAllowances;

    @Column(nullable = false)
    private BigDecimal providentFund;

    @Column(nullable = false)
    private BigDecimal professionalTax;

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

    @Column(nullable = false)
    private BigDecimal grossSalary;

    @Column(nullable = false)
    private BigDecimal netSalary;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PAID"; // PAID or GENERATED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

    // ── Helper Getters for iText Payslip Generator ─────────────────

    public BigDecimal getGrossEarnings() {
        return this.grossSalary;
    }

    public BigDecimal getNetPay() {
        return this.netSalary;
    }

    public BigDecimal getTotalDeductions() {
        BigDecimal pf = providentFund != null ? providentFund : BigDecimal.ZERO;
        BigDecimal pt = professionalTax != null ? professionalTax : BigDecimal.ZERO;
        BigDecimal it = incomeTax != null ? incomeTax : BigDecimal.ZERO;
        BigDecimal e = esi != null ? esi : BigDecimal.ZERO;
        return pf.add(pt).add(it).add(e);
    }
}
