package com.sdproject.WorkMate.onboarding.dto;

import com.sdproject.WorkMate.onboarding.entity.TaskStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
