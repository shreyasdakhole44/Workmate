package com.sdproject.WorkMate.recruitment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CandidateRequest {
    @NotNull  private Long jobPostingId;
    @NotBlank private String name;
    @NotBlank @Email private String email;
    private String phone;
    private String resumeUrl;
    private Integer experienceYears;
    private String notes;
}
