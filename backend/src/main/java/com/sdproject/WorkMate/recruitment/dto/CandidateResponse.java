package com.sdproject.WorkMate.recruitment.dto;

import com.sdproject.WorkMate.recruitment.entity.CandidateStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateResponse {
    private Long id;
    private Long jobPostingId;
    private String jobTitle;
    private String name;
    private String email;
    private String phone;
    private String resumeUrl;
    private Integer experienceYears;
    private CandidateStatus status;
    private String notes;
    private LocalDateTime appliedAt;
}
