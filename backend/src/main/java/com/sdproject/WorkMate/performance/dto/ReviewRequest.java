package com.sdproject.WorkMate.performance.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Review period is required")
    private String reviewPeriod; // e.g. "Q1 2025" or "Annual 2025"

    @NotNull(message = "Score is required")
    @DecimalMin(value = "1.0", message = "Score must be at least 1.0")
    @DecimalMax(value = "10.0", message = "Score cannot be more than 10.0")
    private Double score;

    @NotBlank(message = "Feedback text is required")
    @Size(max = 2000, message = "Feedback must not exceed 2000 characters")
    private String feedbackText;
}
