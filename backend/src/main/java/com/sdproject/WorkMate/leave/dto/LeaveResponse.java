package com.sdproject.WorkMate.leave.dto;

import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer totalDays;
    private String reason;
    private LeaveStatus status;
    private Long approvedBy;
    private String rejectionReason;
    private LocalDateTime appliedAt;
    private LocalDateTime actionTakenAt;
}
