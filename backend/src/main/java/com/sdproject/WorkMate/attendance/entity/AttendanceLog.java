package com.sdproject.WorkMate.attendance.entity;

import com.sdproject.WorkMate.attendance.enums.AttendanceStatus;
import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
    name = "attendance_logs",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"employee_id", "date"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    private Double workingHours;      // auto-calculated on checkout

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    private String remarks;           // e.g. "WFH approved by manager"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Custom getters for Jackson serialization
    public String getEmployeeName() {
        return employee != null ? employee.getFullName() : null;
    }

    public String getEmpCode() {
        return employee != null ? employee.getEmpCode() : null;
    }
}