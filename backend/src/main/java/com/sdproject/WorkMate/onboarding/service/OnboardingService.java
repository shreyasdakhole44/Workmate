package com.sdproject.WorkMate.onboarding.service;

import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.onboarding.dto.OnboardingTaskDto;
import com.sdproject.WorkMate.onboarding.entity.OnboardingTask;
import com.sdproject.WorkMate.onboarding.entity.TaskStatus;
import com.sdproject.WorkMate.onboarding.repository.OnboardingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OnboardingService {

    private final OnboardingRepository onboardingRepo;
    private final EmployeeRepository employeeRepo;

    // Default onboarding checklist tasks
    private static final List<String[]> DEFAULT_TASKS = List.of(
        new String[]{"Complete Profile Information", "Fill out personal details, address, and profile picture in your settings page."},
        new String[]{"Submit Identity Documents", "Provide government-issued photo ID, passport, and address verification proofs."},
        new String[]{"Sign Code of Conduct & NDA", "Read and sign the company's code of conduct and non-disclosure agreement."},
        new String[]{"Submit Bank Account Details", "Provide your bank name, routing/IFSC code, and account number for salary disbursement."},
        new String[]{"Review Employee Handbook", "Go through the official handbook covering company policies, work hours, and benefits."},
        new String[]{"Setup Developer/Workspace Environment", "Install necessary software, set up email, and connect to company Slack/Teams."}
    );

    public void seedDefaultTasks(Long employeeId) {
        Employee emp = employeeRepo.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        long count = onboardingRepo.countByEmployeeId(employeeId);
        if (count == 0) {
            for (String[] taskDef : DEFAULT_TASKS) {
                OnboardingTask task = OnboardingTask.builder()
                    .employee(emp)
                    .title(taskDef[0])
                    .description(taskDef[1])
                    .status(TaskStatus.PENDING)
                    .build();
                onboardingRepo.save(task);
            }
        }
    }

    public List<OnboardingTaskDto> getTasksByEmployee(Long employeeId) {
        // Automatically seed if empty
        seedDefaultTasks(employeeId);

        return onboardingRepo.findByEmployeeIdOrderByCreatedAtAsc(employeeId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public OnboardingTaskDto updateTaskStatus(Long taskId, TaskStatus status) {
        OnboardingTask task = onboardingRepo.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("OnboardingTask", "id", taskId));

        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        return mapToDto(onboardingRepo.save(task));
    }

    public Map<String, Object> getProgressMetrics(Long employeeId) {
        long total = onboardingRepo.countByEmployeeId(employeeId);
        if (total == 0) {
            // Seed if not seeded
            seedDefaultTasks(employeeId);
            total = onboardingRepo.countByEmployeeId(employeeId);
        }
        long completed = onboardingRepo.countByEmployeeIdAndStatus(employeeId, TaskStatus.COMPLETED);
        long inProgress = onboardingRepo.countByEmployeeIdAndStatus(employeeId, TaskStatus.IN_PROGRESS);

        int progressPercent = total > 0 ? (int) ((completed * 100.0) / total) : 0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("employeeId", employeeId);
        metrics.put("totalTasks", total);
        metrics.put("completedTasks", completed);
        metrics.put("inProgressTasks", inProgress);
        metrics.put("progressPercent", progressPercent);
        return metrics;
    }

    public List<Map<String, Object>> getAllEmployeesProgress() {
        return employeeRepo.findAll().stream()
            .filter(Employee::getIsActive)
            .map(emp -> {
                Map<String, Object> metrics = getProgressMetrics(emp.getId());
                metrics.put("employeeName", emp.getFullName());
                metrics.put("empCode", emp.getEmpCode());
                metrics.put("department", emp.getDepartment());
                return metrics;
            })
            .collect(Collectors.toList());
    }

    private OnboardingTaskDto mapToDto(OnboardingTask task) {
        return OnboardingTaskDto.builder()
            .id(task.getId())
            .employeeId(task.getEmployee().getId())
            .employeeName(task.getEmployee().getFullName())
            .title(task.getTitle())
            .description(task.getDescription())
            .status(task.getStatus())
            .createdAt(task.getCreatedAt())
            .completedAt(task.getCompletedAt())
            .build();
    }
}
