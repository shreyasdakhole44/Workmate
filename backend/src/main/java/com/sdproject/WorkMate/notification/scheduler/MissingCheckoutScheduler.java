package com.sdproject.WorkMate.notification.scheduler;

import com.sdproject.WorkMate.attendance.repository.AttendanceRepository;
import com.sdproject.WorkMate.notification.service.NotificationService;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.entity.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MissingCheckoutScheduler {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Runs every day at 9:00 AM server time
    @Scheduled(cron = "0 0 9 * * *")
    public void checkMissingCheckouts() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        var incompleteLogs = attendanceRepository
            .findByDateAndCheckOutTimeIsNull(yesterday);

        if (incompleteLogs.isEmpty()) return;

        List<User> hrUsers = userRepository.findByRoleIn(
            List.of(Role.HR_MANAGER, Role.ADMIN));

        incompleteLogs.forEach(log -> 
            hrUsers.forEach(hr -> {
                try {
                    notificationService.notifyHrMissingCheckout(
                        hr.getEmail(), 
                        hr.getRole() == Role.ADMIN ? "Admin" : "HR Team",
                        log.getEmployee().getFullName(),
                        log.getEmployee().getEmpCode(),
                        log.getDate().toString(),
                        log.getCheckInTime() != null ? log.getCheckInTime().toString() : "N/A"
                    );
                } catch (Exception e) {
                    // Fail-safe wrapper so a failing notification for one doesn't break the loop
                }
            })
        );
    }
}
