package com.sdproject.WorkMate.recruitment.entity;

import com.sdproject.WorkMate.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private Employee interviewer;       // internal employee doing the interview

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private String mode;                // ONLINE / OFFLINE / PHONE

    private String meetingLink;

    @Column(length = 1000)
    private String feedback;

    private Integer rating;             // 1-10

    @Builder.Default
    private String result = "PENDING";  // PENDING / PASSED / FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
