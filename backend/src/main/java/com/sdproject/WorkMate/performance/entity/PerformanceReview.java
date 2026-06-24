package com.sdproject.WorkMate.performance.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // The HR/Manager who wrote the review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Column(nullable = false)
    private String reviewPeriod;      // e.g. "Q1 2025", "Annual 2025"

    @Column(nullable = false)
    private Integer score;            // 1 to 10

    @Column(length = 2000)
    private String feedbackText;      // manager's raw notes

    @Column(length = 3000)
    private String aiSummary;         // AI-generated review

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}