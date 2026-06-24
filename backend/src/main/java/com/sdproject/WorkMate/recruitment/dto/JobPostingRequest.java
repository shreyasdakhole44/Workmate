package com.sdproject.WorkMate.recruitment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class JobPostingRequest {
    @NotBlank private String title;
    @NotBlank private String department;
    private String description;
    private String requirements;
    @Min(1) private Integer openings;
    private LocalDate deadline;
}
