package com.sdproject.WorkMate.payroll.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotion_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private String previousRole;
    private String newRole;

    private String previousDesignation;
    private String newDesignation;

    private BigDecimal previousSalary;
    private BigDecimal newSalary;

    @CreationTimestamp
    private LocalDateTime promotionDate;

    private String notes;
}
