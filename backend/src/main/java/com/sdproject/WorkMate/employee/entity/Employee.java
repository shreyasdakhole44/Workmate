package com.sdproject.WorkMate.employee.entity;

import com.sdproject.WorkMate.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String empCode;           // e.g. WM-001

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String department;        // IT, HR, Finance, etc.

    private String designation;       // Software Engineer, HR Manager, etc.

    private String phone;

    private String address;

    private LocalDate joinDate;

    private BigDecimal salary;

    private String profilePicUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ── Relationships ──────────────────────────────────────────

    // Every employee has one login account
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Self-referencing FK — employee's reporting manager
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    private String panNumber;
    private String uanNumber;
    private String bankAccount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ── Helper ────────────────────────────────────────────────

    public String getFullName() {
        return firstName + " " + lastName;
    }
}