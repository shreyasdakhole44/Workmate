package com.sdproject.WorkMate.attendance.service;

import com.sdproject.WorkMate.attendance.dto.AttendanceSummary;
import com.sdproject.WorkMate.attendance.dto.CheckInRequest;
import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.enums.AttendanceStatus;
import com.sdproject.WorkMate.attendance.repository.AttendanceRepository;
import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // ── CHECK IN ───────────────────────────────────────────────────────────

    public AttendanceLog checkIn(Long employeeId, CheckInRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();

        // Check if log already exists for today
        if (attendanceRepository.findByEmployeeIdAndDate(employeeId, today).isPresent()) {
            throw new WorkmateException("You have already checked in today.");
        }

        // Determine status (WFH if specified in remarks)
        AttendanceStatus status = AttendanceStatus.PRESENT;
        if (request.getRemarks() != null && request.getRemarks().toUpperCase().contains("WFH")) {
            status = AttendanceStatus.WFH;
        }

        AttendanceLog log = AttendanceLog.builder()
                .employee(employee)
                .date(today)
                .checkInTime(LocalTime.now())
                .status(status)
                .remarks(request.getRemarks())
                .build();

        return attendanceRepository.save(log);
    }

    // ── CHECK OUT ──────────────────────────────────────────────────────────

    public AttendanceLog checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        AttendanceLog log = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new WorkmateException("No check-in record found for today. Please check in first."));

        if (log.getCheckOutTime() != null) {
            throw new WorkmateException("You have already checked out today.");
        }

        LocalTime now = LocalTime.now();
        log.setCheckOutTime(now);

        // Calculate working hours
        double hours = Duration.between(log.getCheckInTime(), now).toMinutes() / 60.0;
        log.setWorkingHours(Math.round(hours * 100.0) / 100.0); // round to 2 decimal places

        // Auto-adjust status if hours are less than 4 (Half-day)
        if (log.getWorkingHours() < 4.0 && log.getStatus() != AttendanceStatus.WFH) {
            log.setStatus(AttendanceStatus.HALF_DAY);
        }

        return attendanceRepository.save(log);
    }

    // ── GET MONTHLY SUMMARY ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AttendanceSummary getEmployeeAttendanceSummary(Long employeeId, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        long present = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employeeId, AttendanceStatus.PRESENT, startDate, endDate);
        long absent = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employeeId, AttendanceStatus.ABSENT, startDate, endDate);
        long halfDay = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employeeId, AttendanceStatus.HALF_DAY, startDate, endDate);
        long wfh = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employeeId, AttendanceStatus.WFH, startDate, endDate);
        long leave = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employeeId, AttendanceStatus.LEAVE, startDate, endDate);

        List<AttendanceLog> logs = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        double totalHours = logs.stream()
                .mapToDouble(log -> log.getWorkingHours() != null ? log.getWorkingHours() : 0.0)
                .sum();

        return AttendanceSummary.builder()
                .presentDays(present)
                .absentDays(absent)
                .halfDays(halfDay)
                .wfhDays(wfh)
                .leaveDays(leave)
                .totalWorkingHours(Math.round(totalHours * 100.0) / 100.0)
                .build();
    }

    // ── GET HISTORY ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceLog> getAttendanceHistory(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
    }

    // ── GET DAILY ATTENDANCE (ADMIN/HR) ─────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttendanceLog> getDailyAttendance(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
}
