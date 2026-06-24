package com.sdproject.WorkMate.leave.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "leave_balances",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"employee_id", "leave_type_id", "year"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private Integer year;             // e.g. 2025

    @Builder.Default
    private Integer totalDays = 0;

    @Builder.Default
    private Integer usedDays = 0;

    @Builder.Default
    private Integer remainingDays = 0;
}