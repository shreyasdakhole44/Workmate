package com.sdproject.WorkMate.recruitment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewRequest {
    @NotNull  private Long candidateId;
    private Long interviewerId;
    @NotNull  private LocalDateTime scheduledAt;
    private String mode;        // ONLINE / OFFLINE / PHONE
    private String meetingLink;
}
