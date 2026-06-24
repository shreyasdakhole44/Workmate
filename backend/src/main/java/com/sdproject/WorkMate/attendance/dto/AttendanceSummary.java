package com.sdproject.WorkMate.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummary {
    private Long presentDays;
    private Long absentDays;
    private Long halfDays;
    private Long wfhDays;
    private Long leaveDays;
    private Double totalWorkingHours;
}
