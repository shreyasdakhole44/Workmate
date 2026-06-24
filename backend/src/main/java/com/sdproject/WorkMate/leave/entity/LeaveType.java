package com.sdproject.WorkMate.leave.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;              // Casual, Sick, Earned

    private Integer maxDaysPerYear;   // 12, 7, 15

    @Builder.Default
    private Boolean carryForward = false;

    @Builder.Default
    private Boolean isActive = true;
}