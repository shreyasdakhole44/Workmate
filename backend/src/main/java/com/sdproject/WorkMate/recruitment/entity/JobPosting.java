package com.sdproject.WorkMate.recruitment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;               // e.g. "Senior Java Developer"

    @Column(nullable = false)
    private String department;

    @Column(length = 2000)
    private String description;

    private String requirements;        // comma-separated or short text

    private Integer openings;           // number of positions

    private LocalDate deadline;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
