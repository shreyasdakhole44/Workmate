package com.sdproject.WorkMate.leave.controller;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.leave.dto.LeaveApplyRequest;
import com.sdproject.WorkMate.leave.dto.LeaveBalanceResponse;
import com.sdproject.WorkMate.leave.dto.LeaveResponse;
import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import com.sdproject.WorkMate.leave.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Endpoints for applying leave, viewing balances, and approving requests")
public class LeaveController {

    private final LeaveService leaveService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    // ── APPLY LEAVE ────────────────────────────────────────────────────────
    @PostMapping("/apply")
    @Operation(summary = "Apply for Leave", description = "Allows an employee to submit a leave request.")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            Authentication authentication,
            @Valid @RequestBody LeaveApplyRequest request) {
        
        Long empId = getCurrentEmployeeId(authentication);
        LeaveResponse response = leaveService.applyLeave(empId, request);
        return ResponseEntity.ok(ApiResponse.success("Leave applied successfully. Status is PENDING.", response));
    }

    // ── GET PERSONAL BALANCES ────────────────────────────────────────────────
    @GetMapping("/my-balances")
    @Operation(summary = "Get My Leave Balances", description = "Fetches remaining leave counts for the current year.")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getMyBalances(
            Authentication authentication,
            @RequestParam(required = false) Integer year) {

        Long empId = getCurrentEmployeeId(authentication);
        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<LeaveBalanceResponse> response = leaveService.getEmployeeLeaveBalances(empId, targetYear);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET PERSONAL REQUESTS ────────────────────────────────────────────────
    @GetMapping("/my-requests")
    @Operation(summary = "Get My Leave Requests", description = "Fetches all leave requests submitted by the logged-in employee.")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getMyRequests(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        List<LeaveResponse> response = leaveService.getEmployeeLeaveRequests(empId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET OTHER EMPLOYEE BALANCES (ADMIN/HR) ──────────────────────────────
    @GetMapping("/balances/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelf(#employeeId, authentication.name)")
    @Operation(summary = "Get Employee Leave Balances", description = "Admin/HR or the Employee themselves. View balances of any employee.")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getEmployeeBalances(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year) {

        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<LeaveBalanceResponse> response = leaveService.getEmployeeLeaveBalances(employeeId, targetYear);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET OTHER EMPLOYEE HISTORY (ADMIN/HR) ──────────────────────────────
    @GetMapping("/history/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelf(#employeeId, authentication.name)")
    @Operation(summary = "Get Employee Leave History", description = "Admin/HR or the Employee themselves. View leave history of any employee.")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getEmployeeRequests(@PathVariable Long employeeId) {
        List<LeaveResponse> response = leaveService.getEmployeeLeaveRequests(employeeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET ALL REQUESTS (ADMIN/HR) ─────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get All Leave Requests", description = "Admin or HR Manager only. List all requests in the system.")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllRequests() {
        List<LeaveResponse> response = leaveService.getAllLeaveRequests();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── APPROVE OR REJECT LEAVE (ADMIN/HR) ──────────────────────────────────
    @PutMapping("/{id}/action")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Approve or Reject Leave Request", description = "Admin or HR Manager only. Take action on a pending leave request.")
    public ResponseEntity<ApiResponse<LeaveResponse>> approveOrRejectLeave(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false) String rejectionReason) {

        // Get approvedBy userId
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User account not found"));

        LeaveResponse response = leaveService.approveOrRejectLeave(id, status, user.getId(), rejectionReason);
        return ResponseEntity.ok(ApiResponse.success("Leave request " + status.name().toLowerCase() + " successfully", response));
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
