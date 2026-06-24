package com.sdproject.WorkMate.recruitment.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobPostingResponse {
    private Long id;
    private String title;
    private String department;
    private String description;
    private String requirements;
    private Integer openings;
    private LocalDate deadline;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private long candidateCount;
}
