package com.sdproject.WorkMate.attendance.controller;

import com.sdproject.WorkMate.attendance.dto.AttendanceSummary;
import com.sdproject.WorkMate.attendance.dto.CheckInRequest;
import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.service.AttendanceService;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management", description = "Endpoints for employee check-in, check-out, and logs summary")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    // ── CHECK IN ───────────────────────────────────────────────────────────
    @PostMapping("/check-in")
    @Operation(summary = "Daily Check-In", description = "Allows an employee to check-in for the day.")
    public ResponseEntity<ApiResponse<AttendanceLog>> checkIn(
            Authentication authentication,
            @RequestBody(required = false) CheckInRequest request) {
        
        Long empId = getCurrentEmployeeId(authentication);
        CheckInRequest req = request != null ? request : new CheckInRequest();
        AttendanceLog log = attendanceService.checkIn(empId, req);
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", log));
    }

    // ── CHECK OUT ──────────────────────────────────────────────────────────
    @PostMapping("/check-out")
    @Operation(summary = "Daily Check-Out", description = "Allows an employee to check-out for the day and calculates total hours.")
    public ResponseEntity<ApiResponse<AttendanceLog>> checkOut(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        AttendanceLog log = attendanceService.checkOut(empId);
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", log));
    }

    // ── GET MONTHLY SUMMARY ─────────────────────────────────────────────────
    @GetMapping("/summary")
    @Operation(summary = "Get Monthly Summary", description = "Returns stats of present/absent/wfh days for a given month.")
    public ResponseEntity<ApiResponse<AttendanceSummary>> getSummary(
            Authentication authentication,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        Long empId = getCurrentEmployeeId(authentication);
        LocalDate today = LocalDate.now();
        int targetMonth = month != null ? month : today.getMonthValue();
        int targetYear = year != null ? year : today.getYear();

        AttendanceSummary summary = attendanceService.getEmployeeAttendanceSummary(empId, targetMonth, targetYear);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    // ── GET PERSONAL HISTORY ────────────────────────────────────────────────
    @GetMapping("/my-history")
    @Operation(summary = "Get My Attendance History", description = "Fetches check-in/out records for the logged-in employee.")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getMyHistory(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long empId = getCurrentEmployeeId(authentication);
        List<AttendanceLog> history = attendanceService.getAttendanceHistory(empId, from, to);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ── GET OTHER EMPLOYEE HISTORY (ADMIN/HR) ──────────────────────────────
    @GetMapping("/history/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get Employee History", description = "Admin or HR Manager only. Fetch history of any employee.")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<AttendanceLog> history = attendanceService.getAttendanceHistory(employeeId, from, to);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ── GET DAILY LOGS (ADMIN/HR) ──────────────────────────────────────────
    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get Daily Attendance Logs", description = "Admin or HR Manager only. Fetch daily log status of all employees.")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getDailyLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AttendanceLog> daily = attendanceService.getDailyAttendance(targetDate);
        return ResponseEntity.ok(ApiResponse.success(daily));
    }

    // ── HELPER TO GET CURRENT EMPLOYEE ID ──────────────────────────────────
    private Long getCurrentEmployeeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User account not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WorkmateException("Employee profile not linked to this user account"));
        return employee.getId();
    }
}
