package com.sdproject.WorkMate.leave.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveApplyRequest {

    @NotNull(message = "Leave type is required")
    private Long leaveTypeId;

    @NotNull(message = "From date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate fromDate;

    @NotNull(message = "To date is required")
    private LocalDate toDate;

    @NotBlank(message = "Reason is required")
    private String reason;
}
