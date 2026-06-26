package com.sdproject.WorkMate.leave.service;

import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.enums.AttendanceStatus;
import com.sdproject.WorkMate.attendance.repository.AttendanceRepository;
import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.leave.dto.LeaveApplyRequest;
import com.sdproject.WorkMate.leave.dto.LeaveBalanceResponse;
import com.sdproject.WorkMate.leave.dto.LeaveResponse;
import com.sdproject.WorkMate.leave.entity.LeaveBalance;
import com.sdproject.WorkMate.leave.entity.LeaveRequest;
import com.sdproject.WorkMate.leave.entity.LeaveType;
import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import com.sdproject.WorkMate.leave.repository.LeaveBalanceRepository;
import com.sdproject.WorkMate.leave.repository.LeaveRepository;
import com.sdproject.WorkMate.leave.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.notification.service.NotificationService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── APPLY LEAVE ────────────────────────────────────────────────────────

    public LeaveResponse applyLeave(Long employeeId, LeaveApplyRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new WorkmateException("From date cannot be after to date.");
        }

        long days = ChronoUnit.DAYS.between(request.getFromDate(), request.getToDate()) + 1;
        int totalDaysNeeded = (int) days;

        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", request.getLeaveTypeId()));

        if (!leaveType.getIsActive()) {
            throw new WorkmateException("This leave type is currently inactive.");
        }

        int year = request.getFromDate().getYear();

        // Get or initialize leave balance
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), year)
                .orElseGet(() -> initLeaveBalance(employee, leaveType, year));

        if (balance.getRemainingDays() < totalDaysNeeded) {
            throw new WorkmateException("Insufficient leave balance. Remaining: " 
                    + balance.getRemainingDays() + " days. Requested: " + totalDaysNeeded + " days.");
        }

        // Deduct balance immediately upon application
        balance.setUsedDays(balance.getUsedDays() + totalDaysNeeded);
        balance.setRemainingDays(balance.getTotalDays() - balance.getUsedDays());
        leaveBalanceRepository.save(balance);

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .totalDays(totalDaysNeeded)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        LeaveRequest savedRequest = leaveRepository.save(leaveRequest);

        try {
            List<User> hrUsers = userRepository.findByRoleIn(List.of(Role.HR_MANAGER, Role.ADMIN));
            hrUsers.forEach(hr -> {
                try {
                    notificationService.notifyHrNewLeaveRequest(
                        hr.getEmail(),
                        hr.getRole() == Role.ADMIN ? "Admin" : "HR Team",
                        employee.getFullName(),
                        employee.getEmpCode(),
                        employee.getDepartment(),
                        leaveType.getName(),
                        savedRequest.getFromDate().toString(),
                        savedRequest.getToDate().toString(),
                        savedRequest.getTotalDays(),
                        savedRequest.getReason()
                    );
                } catch (Exception e) {
                    // Ignore, non-blocking
                }
            });
        } catch (Exception e) {
            // Ignore, non-blocking
        }

        return mapToResponse(savedRequest);
    }

    // ── APPROVE OR REJECT LEAVE ─────────────────────────────────────────────

    public LeaveResponse approveOrRejectLeave(Long requestId, LeaveStatus status, Long approvedByUserId, String rejectionReason) {
        LeaveRequest leaveRequest = leaveRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", requestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new WorkmateException("This leave request is already processed. Status: " + leaveRequest.getStatus());
        }

        if (status != LeaveStatus.APPROVED && status != LeaveStatus.REJECTED) {
            throw new WorkmateException("Invalid status action. Must be APPROVED or REJECTED.");
        }

        leaveRequest.setStatus(status);
        leaveRequest.setApprovedBy(approvedByUserId);
        leaveRequest.setRejectionReason(rejectionReason);
        leaveRequest.setActionTakenAt(LocalDateTime.now());

        if (status == LeaveStatus.APPROVED) {
            // Auto-create/update Attendance logs during leave period
            LocalDate current = leaveRequest.getFromDate();
            while (!current.isAfter(leaveRequest.getToDate())) {
                LocalDate dateCursor = current;
                AttendanceLog attendanceLog = attendanceRepository
                        .findByEmployeeIdAndDate(leaveRequest.getEmployee().getId(), dateCursor)
                        .orElseGet(() -> AttendanceLog.builder()
                                .employee(leaveRequest.getEmployee())
                                .date(dateCursor)
                                .build());

                attendanceLog.setStatus(AttendanceStatus.LEAVE);
                attendanceLog.setRemarks("Approved Leave: " + leaveRequest.getLeaveType().getName());
                attendanceRepository.save(attendanceLog);
                
                current = current.plusDays(1);
            }
        } else if (status == LeaveStatus.REJECTED) {
            // Restore/refund balance if rejected since it was already deducted on apply
            int year = leaveRequest.getFromDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(
                            leaveRequest.getEmployee().getId(),
                            leaveRequest.getLeaveType().getId(),
                            year
                    )
                    .orElseThrow(() -> new WorkmateException("Leave balance not found for the employee."));

            balance.setUsedDays(balance.getUsedDays() - leaveRequest.getTotalDays());
            balance.setRemainingDays(balance.getTotalDays() - balance.getUsedDays());
            leaveBalanceRepository.save(balance);
        }

        LeaveRequest updatedRequest = leaveRepository.save(leaveRequest);

        if (status == LeaveStatus.APPROVED) {
            try {
                int year = updatedRequest.getFromDate().getYear();
                LeaveBalance balance = leaveBalanceRepository
                        .findByEmployeeIdAndLeaveTypeIdAndYear(
                                updatedRequest.getEmployee().getId(),
                                updatedRequest.getLeaveType().getId(),
                                year
                        )
                        .orElse(null);

                int remainingDays = balance != null ? balance.getRemainingDays() : 0;
                int totalDays = balance != null ? balance.getTotalDays() : 0;

                notificationService.notifyLeaveApproved(
                    updatedRequest.getEmployee().getUser().getEmail(),
                    updatedRequest.getEmployee().getFullName(),
                    updatedRequest.getLeaveType().getName(),
                    updatedRequest.getFromDate().toString(),
                    updatedRequest.getToDate().toString(),
                    updatedRequest.getTotalDays(),
                    remainingDays,
                    totalDays
                );
            } catch (Exception e) {
                // Ignore, non-blocking
            }
        }

        return mapToResponse(updatedRequest);
    }

    // ── GET PERSONAL BALANCES ────────────────────────────────────────────────

    public List<LeaveBalanceResponse> getEmployeeLeaveBalances(Long employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        List<LeaveType> activeTypes = leaveTypeRepository.findByIsActive(true);
        List<LeaveBalanceResponse> responses = new ArrayList<>();

        for (LeaveType type : activeTypes) {
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, type.getId(), year)
                    .orElseGet(() -> initLeaveBalance(employee, type, year));
            responses.add(mapToBalanceResponse(balance));
        }

        return responses;
    }

    // ── GET REQUESTS ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LeaveResponse> getEmployeeLeaveRequests(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaveRequests() {
        return leaveRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── PRIVATE INITIALIZERS & MAPPERS ──────────────────────────────────────

    private LeaveBalance initLeaveBalance(Employee employee, LeaveType leaveType, int year) {
        LeaveBalance balance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(leaveType)
                .year(year)
                .totalDays(leaveType.getMaxDaysPerYear())
                .usedDays(0)
                .remainingDays(leaveType.getMaxDaysPerYear())
                .build();
        return leaveBalanceRepository.save(balance);
    }

    private LeaveResponse mapToResponse(LeaveRequest request) {
        return LeaveResponse.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .leaveTypeId(request.getLeaveType().getId())
                .leaveTypeName(request.getLeaveType().getName())
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .totalDays(request.getTotalDays())
                .reason(request.getReason())
                .status(request.getStatus())
                .approvedBy(request.getApprovedBy())
                .rejectionReason(request.getRejectionReason())
                .appliedAt(request.getAppliedAt())
                .actionTakenAt(request.getActionTakenAt())
                .build();
    }

    private LeaveBalanceResponse mapToBalanceResponse(LeaveBalance balance) {
        return LeaveBalanceResponse.builder()
                .id(balance.getId())
                .leaveTypeId(balance.getLeaveType().getId())
                .leaveTypeName(balance.getLeaveType().getName())
                .year(balance.getYear())
                .totalDays(balance.getTotalDays())
                .usedDays(balance.getUsedDays())
                .remainingDays(balance.getRemainingDays())
                .build();
    }
}
