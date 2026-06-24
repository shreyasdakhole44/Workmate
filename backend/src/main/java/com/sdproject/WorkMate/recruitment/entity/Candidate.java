package com.sdproject.WorkMate.recruitment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String resumeUrl;           // link to uploaded resume

    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CandidateStatus status = CandidateStatus.APPLIED;

    @Column(length = 1000)
    private String notes;               // HR notes

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    private LocalDateTime statusUpdatedAt;
}
