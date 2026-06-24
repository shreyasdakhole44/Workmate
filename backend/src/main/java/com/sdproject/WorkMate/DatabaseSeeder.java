package com.sdproject.WorkMate;

import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.enums.AttendanceStatus;
import com.sdproject.WorkMate.attendance.repository.AttendanceRepository;
import com.sdproject.WorkMate.payroll.entity.Payslip;
import com.sdproject.WorkMate.payroll.entity.SalaryStructure;
import com.sdproject.WorkMate.payroll.repository.PayslipRepository;
import com.sdproject.WorkMate.payroll.repository.SalaryStructureRepository;
import com.sdproject.WorkMate.performance.entity.PerformanceReview;
import com.sdproject.WorkMate.performance.repository.PerformanceRepository;
import com.sdproject.WorkMate.leave.repository.LeaveRepository;
import com.sdproject.WorkMate.leave.repository.LeaveTypeRepository;
import com.sdproject.WorkMate.leave.repository.LeaveBalanceRepository;
import com.sdproject.WorkMate.leave.entity.LeaveRequest;
import com.sdproject.WorkMate.leave.entity.LeaveType;
import com.sdproject.WorkMate.leave.entity.LeaveBalance;
import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import com.sdproject.WorkMate.onboarding.entity.OnboardingTask;
import com.sdproject.WorkMate.onboarding.entity.TaskStatus;
import com.sdproject.WorkMate.onboarding.repository.OnboardingRepository;
import com.sdproject.WorkMate.recruitment.entity.JobPosting;
import com.sdproject.WorkMate.recruitment.entity.Candidate;
import com.sdproject.WorkMate.recruitment.entity.CandidateStatus;
import com.sdproject.WorkMate.recruitment.entity.Interview;
import com.sdproject.WorkMate.recruitment.repository.JobPostingRepository;
import com.sdproject.WorkMate.recruitment.repository.CandidateRepository;
import com.sdproject.WorkMate.recruitment.repository.InterviewRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Transactional
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayslipRepository payslipRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PerformanceRepository performanceRepository;
    private final LeaveRepository leaveRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final OnboardingRepository onboardingRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewRepository interviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Leave Types
        LeaveType casualLeave = getOrCreateLeaveType("Casual Leave", 12, false);
        LeaveType sickLeave = getOrCreateLeaveType("Sick Leave", 8, false);
        LeaveType earnedLeave = getOrCreateLeaveType("Earned Leave", 15, true);
        List<LeaveType> leaveTypes = List.of(casualLeave, sickLeave, earnedLeave);

        // 2. Seed Users & Employee Profiles
        // Admin
        User adminUser = getOrCreateUser("admin@workmate.com", "admin123", Role.ADMIN);
        Employee adminEmp = getOrCreateEmployee("ADM001", "Admin", "User", "Management", "System Administrator", "+91 99999 88888", "Workmate HQ, Bangalore", LocalDate.of(2024, 1, 1), BigDecimal.valueOf(2500000), adminUser);

        // HR Shivam (Newly Requested)
        User shivamUser = getOrCreateUser("shivam@workmate.com", "shivam123", Role.HR_MANAGER);
        Employee shivamEmp = getOrCreateEmployee("HR001", "Shivam", "Gupta", "HR", "HR Operations Manager", "+91 98765 43210", "A-45, Sector 62, Noida", LocalDate.of(2025, 2, 1), BigDecimal.valueOf(1800000), shivamUser);

        // HR Specialist Karan (from demo credentials)
        User hrUser = getOrCreateUser("hr@workmate.com", "hr123", Role.HR_MANAGER);
        Employee hrEmp = getOrCreateEmployee("HR002", "Karan", "Malhotra", "HR", "HR Specialist", "+91 98765 43211", "Flat 302, Sunrise Towers, Gurgaon", LocalDate.of(2025, 5, 10), BigDecimal.valueOf(1200000), hrUser);

        // Employee Priya (from demo credentials)
        User priyaUser = getOrCreateUser("emp@workmate.com", "emp123", Role.EMPLOYEE);
        Employee priyaEmp = getOrCreateEmployee("EMP001", "Priya", "Patel", "Engineering", "Software Engineer", "+91 98765 43212", "C-12, Royal Enclave, Ahmedabad", LocalDate.of(2025, 8, 20), BigDecimal.valueOf(900000), priyaUser);

        // Employee Rohit (existing in current seeder)
        User rohitUser = getOrCreateUser("rohit@workmate.com", "rohit123", Role.EMPLOYEE);
        Employee rohitEmp = getOrCreateEmployee("EMP005", "Rohit", "Sharma", "IT", "Senior Frontend Engineer", "+91 98765 43214", "104, Green Valley Apartments, Pune", LocalDate.of(2025, 1, 15), BigDecimal.valueOf(1500000), rohitUser);

        List<Employee> activeEmployees = List.of(adminEmp, shivamEmp, hrEmp, priyaEmp, rohitEmp);

        // 3. Seed Salary Structures, Payslips, Attendance, and Leave Balances for everyone
        for (Employee emp : activeEmployees) {
            seedSalaryStructureAndPayslips(emp);
            seedLeaveBalances(emp, leaveTypes);
            if (!emp.getUser().getRole().equals(Role.ADMIN)) {
                seedAttendance(emp);
            }
        }

        // 4. Seed Leave Requests
        seedLeaveRequests(priyaEmp, rohitEmp, shivamEmp);

        // 5. Seed Onboarding Tasks
        seedOnboardingTasks(priyaEmp);
        seedOnboardingTasks(rohitEmp);

        // 6. Seed Performance Reviews
        seedPerformanceReviews(priyaEmp, rohitEmp, shivamEmp, adminEmp);

        // 7. Seed Recruitment Data
        seedRecruitmentData(shivamEmp, hrEmp);
    }

    private LeaveType getOrCreateLeaveType(String name, int maxDays, boolean carryForward) {
        return leaveTypeRepository.findAll().stream()
                .filter(t -> t.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> leaveTypeRepository.save(
                        LeaveType.builder()
                                .name(name)
                                .maxDaysPerYear(maxDays)
                                .carryForward(carryForward)
                                .isActive(true)
                                .build()
                ));
    }

    private User getOrCreateUser(String email, String password, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
                User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode(password))
                        .role(role)
                        .isActive(true)
                        .build()
        ));
    }

    private Employee getOrCreateEmployee(String empCode, String firstName, String lastName,
                                         String dept, String designation, String phone,
                                         String address, LocalDate joinDate, BigDecimal salary,
                                         User user) {
        return employeeRepository.findByUserId(user.getId()).orElseGet(() -> {
            String suffix = empCode.replaceAll("[^0-9]", "");
            if (suffix.isEmpty()) {
                suffix = "001";
            }
            String pan = "ABCDE" + String.format("%04d", Integer.parseInt(suffix)) + "F";
            String uan = "1009" + String.format("%08d", Integer.parseInt(suffix));
            String bank = "987654" + String.format("%06d", Integer.parseInt(suffix));
            return employeeRepository.save(
                Employee.builder()
                        .empCode(empCode)
                        .firstName(firstName)
                        .lastName(lastName)
                        .department(dept)
                        .designation(designation)
                        .phone(phone)
                        .address(address)
                        .joinDate(joinDate)
                        .salary(salary)
                        .isActive(true)
                        .user(user)
                        .panNumber(pan)
                        .uanNumber(uan)
                        .bankAccount(bank)
                        .build()
            );
        });
    }

    private void seedSalaryStructureAndPayslips(Employee emp) {
        BigDecimal basic = emp.getSalary().multiply(BigDecimal.valueOf(0.5)).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal hra = basic.multiply(BigDecimal.valueOf(0.4)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medical = BigDecimal.valueOf(5000).setScale(2, RoundingMode.HALF_UP);
        BigDecimal other = BigDecimal.valueOf(10000).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pf = basic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pt = BigDecimal.valueOf(200).setScale(2, RoundingMode.HALF_UP);
        BigDecimal special = basic.multiply(BigDecimal.valueOf(0.15)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal conveyance = BigDecimal.valueOf(1600).setScale(2, RoundingMode.HALF_UP);
        BigDecimal bonus = basic.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal it = basic.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal esi = basic.multiply(BigDecimal.valueOf(0.0075)).setScale(2, RoundingMode.HALF_UP);

        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(emp.getId()).orElseGet(() -> salaryStructureRepository.save(
                SalaryStructure.builder()
                        .employee(emp)
                        .basicSalary(basic)
                        .hra(hra)
                        .medicalAllowance(medical)
                        .otherAllowances(other)
                        .specialAllowance(special)
                        .conveyanceAllowance(conveyance)
                        .performanceBonus(bonus)
                        .providentFund(pf)
                        .professionalTax(pt)
                        .incomeTax(it)
                        .esi(esi)
                        .build()
        ));

        // Seed payslips for March, April, May 2026
        for (int m = 3; m <= 5; m++) {
            final int month = m;
            Optional<Payslip> payslipOpt = payslipRepository.findByEmployeeIdAndYearAndMonth(emp.getId(), 2026, month);
            if (payslipOpt.isEmpty()) {
                Payslip payslip = Payslip.builder()
                        .employee(emp)
                        .year(2026)
                        .month(month)
                        .basicSalary(structure.getBasicSalary())
                        .hra(structure.getHra())
                        .medicalAllowance(structure.getMedicalAllowance())
                        .otherAllowances(structure.getOtherAllowances())
                        .specialAllowance(structure.getSpecialAllowance())
                        .conveyanceAllowance(structure.getConveyanceAllowance())
                        .performanceBonus(structure.getPerformanceBonus())
                        .providentFund(structure.getProvidentFund())
                        .professionalTax(structure.getProfessionalTax())
                        .incomeTax(structure.getIncomeTax())
                        .esi(structure.getEsi())
                        .grossSalary(structure.getGrossSalary())
                        .netSalary(structure.getNetSalary())
                        .status("PAID")
                        .build();
                payslipRepository.save(payslip);
            }
        }
    }

    private void seedLeaveBalances(Employee emp, List<LeaveType> leaveTypes) {
        int year = 2026;
        for (LeaveType type : leaveTypes) {
            Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(emp.getId(), type.getId(), year);
            if (balanceOpt.isEmpty()) {
                LeaveBalance balance = LeaveBalance.builder()
                        .employee(emp)
                        .leaveType(type)
                        .year(year)
                        .totalDays(type.getMaxDaysPerYear())
                        .remainingDays(type.getMaxDaysPerYear())
                        .usedDays(0)
                        .build();
                leaveBalanceRepository.save(balance);
            }
        }
    }

    private void seedAttendance(Employee employee) {
        LocalDate start = LocalDate.now().minusDays(35);
        int count = 0;
        while (count < 30) {
            // Skip weekends
            if (start.getDayOfWeek().getValue() < 6) {
                Optional<AttendanceLog> logOpt = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), start);
                if (logOpt.isEmpty()) {
                    AttendanceStatus status = AttendanceStatus.PRESENT;
                    // Introduce variation
                    if (count == 5 || count == 15) {
                        status = AttendanceStatus.WFH;
                    } else if (count == 10) {
                        status = AttendanceStatus.HALF_DAY;
                    } else if (count == 22) {
                        status = AttendanceStatus.LEAVE;
                    } else if (count == 28) {
                        status = AttendanceStatus.ABSENT;
                    }

                    LocalTime checkIn = LocalTime.of(9, 15 + (count % 10));
                    LocalTime checkOut = LocalTime.of(18, 5 + (count % 15));
                    Double hours = 8.5 + (count % 3) * 0.2;

                    if (status == AttendanceStatus.ABSENT || status == AttendanceStatus.LEAVE) {
                        checkIn = null;
                        checkOut = null;
                        hours = 0.0;
                    }

                    AttendanceLog log = AttendanceLog.builder()
                            .employee(employee)
                            .date(start)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .workingHours(hours)
                            .status(status)
                            .remarks(status == AttendanceStatus.WFH ? "WFH approved" : "")
                            .build();
                    attendanceRepository.save(log);
                }
                count++;
            }
            start = start.plusDays(1);
        }
    }

    private void seedLeaveRequests(Employee priya, Employee rohit, Employee shivam) {
        if (leaveRepository.count() == 0) {
            LeaveType casual = leaveTypeRepository.findAll().stream().filter(t -> t.getName().equalsIgnoreCase("Casual Leave")).findFirst().get();
            LeaveType sick = leaveTypeRepository.findAll().stream().filter(t -> t.getName().equalsIgnoreCase("Sick Leave")).findFirst().get();

            // 1. Pending leave for Rohit
            LeaveRequest req1 = LeaveRequest.builder()
                    .employee(rohit)
                    .leaveType(casual)
                    .fromDate(LocalDate.now().plusDays(5))
                    .toDate(LocalDate.now().plusDays(7))
                    .totalDays(3)
                    .reason("Family function in my hometown")
                    .status(LeaveStatus.PENDING)
                    .build();
            leaveRepository.save(req1);

            // 2. Pending leave for Priya
            LeaveRequest req2 = LeaveRequest.builder()
                    .employee(priya)
                    .leaveType(sick)
                    .fromDate(LocalDate.now().plusDays(2))
                    .toDate(LocalDate.now().plusDays(2))
                    .totalDays(1)
                    .reason("Dental checkup")
                    .status(LeaveStatus.PENDING)
                    .build();
            leaveRepository.save(req2);

            // 3. Approved leave for Rohit
            LeaveRequest req3 = LeaveRequest.builder()
                    .employee(rohit)
                    .leaveType(sick)
                    .fromDate(LocalDate.now().minusDays(10))
                    .toDate(LocalDate.now().minusDays(9))
                    .totalDays(2)
                    .reason("Fever recovery")
                    .status(LeaveStatus.APPROVED)
                    .approvedBy(shivam.getUser().getId())
                    .actionTakenAt(LocalDateTime.now().minusDays(11))
                    .build();
            leaveRepository.save(req3);
        }
    }

    private void seedOnboardingTasks(Employee emp) {
        long count = onboardingRepository.countByEmployeeId(emp.getId());
        if (count == 0) {
            List<String[]> tasks = List.of(
                new String[]{"Complete Profile Information", "Fill out personal details, address, and profile picture in settings.", "COMPLETED"},
                new String[]{"Submit Identity Documents", "Provide passport, PAN, and Aadhaar card copies.", "COMPLETED"},
                new String[]{"Sign Code of Conduct & NDA", "Sign the digital company policies agreement.", "IN_PROGRESS"},
                new String[]{"Submit Bank Account Details", "Provide direct deposit instructions for payroll.", "PENDING"},
                new String[]{"Review Employee Handbook", "Read company history, values, and guidelines.", "PENDING"},
                new String[]{"Setup Workspace Environment", "Configure Slack, Git, and email access.", "PENDING"}
            );

            for (String[] t : tasks) {
                TaskStatus status = TaskStatus.valueOf(t[2]);
                OnboardingTask task = OnboardingTask.builder()
                        .employee(emp)
                        .title(t[0])
                        .description(t[1])
                        .status(status)
                        .completedAt(status == TaskStatus.COMPLETED ? LocalDateTime.now().minusDays(1) : null)
                        .build();
                onboardingRepository.save(task);
            }
        }
    }

    private void seedPerformanceReviews(Employee priya, Employee rohit, Employee shivam, Employee admin) {
        // Seed Rohit
        if (performanceRepository.findByEmployeeId(rohit.getId()).isEmpty()) {
            performanceRepository.save(
                    PerformanceReview.builder()
                            .employee(rohit)
                            .reviewer(shivam)
                            .reviewPeriod("Q1 2026")
                            .score(9)
                            .feedbackText("Rohit is an exceptional frontend engineer. Highly proactive and collaborative.")
                            .aiSummary("AI Review Summary: Employee scored 9/10 for Q1 2026. Feedback highlights exceptional frontend work, proactivity, and collaboration.")
                            .build()
            );
        }

        // Seed Priya
        if (performanceRepository.findByEmployeeId(priya.getId()).isEmpty()) {
            performanceRepository.save(
                    PerformanceReview.builder()
                            .employee(priya)
                            .reviewer(shivam)
                            .reviewPeriod("Q1 2026")
                            .score(8)
                            .feedbackText("Priya has integrated the backend endpoints perfectly. Nice focus on API security and testing.")
                            .aiSummary("AI Review Summary: Employee scored 8/10 for Q1 2026. Feedback praises backend integration, API security, and testing.")
                            .build()
            );
        }

        // Seed Admin
        if (performanceRepository.findByEmployeeId(admin.getId()).isEmpty()) {
            performanceRepository.save(
                    PerformanceReview.builder()
                            .employee(admin)
                            .reviewer(shivam)
                            .reviewPeriod("Q1 2026")
                            .score(10)
                            .feedbackText("Admin User has done an outstanding job managing platform systems. The security protocols and database sync are highly reliable.")
                            .aiSummary("AI Review Summary: Employee scored 10/10 for Q1 2026. Feedback highlights outstanding platform systems management and reliable security.")
                            .build()
            );

            performanceRepository.save(
                    PerformanceReview.builder()
                            .employee(admin)
                            .reviewer(shivam)
                            .reviewPeriod("Annual 2025")
                            .score(9)
                            .feedbackText("Strong leadership demonstrated in system upgrades and user database scaling migrations.")
                            .aiSummary("AI Review Summary: Employee scored 9/10 for Annual 2025. Feedback praises leadership in system upgrades and database scaling.")
                            .build()
            );
        }
    }

    private void seedRecruitmentData(Employee shivam, Employee karan) {
        if (jobPostingRepository.count() == 0) {
            // Seed Job Postings
            JobPosting job1 = JobPosting.builder()
                    .title("React Developer")
                    .department("IT")
                    .description("We are looking for a Senior React Developer to join our frontend team. You will build responsive dashboard interfaces, collaborate with backend engineers, and maintain clean codebase.")
                    .requirements("React, Redux, Tailwind CSS, Javascript, 3+ years experience")
                    .openings(2)
                    .deadline(LocalDate.now().plusDays(20))
                    .isActive(true)
                    .build();
            jobPostingRepository.save(job1);

            JobPosting job2 = JobPosting.builder()
                    .title("HR Executive")
                    .department("HR")
                    .description("We are looking for an HR Executive to coordinate recruitment, handle employee queries, and support employee onboarding processes.")
                    .requirements("MBA in HR, excellent communication, 1+ years experience")
                    .openings(1)
                    .deadline(LocalDate.now().plusDays(10))
                    .isActive(true)
                    .build();
            jobPostingRepository.save(job2);

            JobPosting job3 = JobPosting.builder()
                    .title("Backend Java Engineer")
                    .department("IT")
                    .description("Join our engineering team to build scalable enterprise APIs. You will design data structures, write performant services, and work with Hibernate/MySQL.")
                    .requirements("Java, Spring Boot, Hibernate, MySQL, REST APIs, 2+ years experience")
                    .openings(3)
                    .deadline(LocalDate.now().plusDays(15))
                    .isActive(true)
                    .build();
            jobPostingRepository.save(job3);

            // Seed Candidates
            // Candidates for React Developer
            Candidate cand1 = Candidate.builder()
                    .name("Neha Sharma")
                    .email("neha.sharma@example.com")
                    .phone("+91 99001 12233")
                    .experienceYears(3)
                    .notes("Good React knowledge, worked on dashboards. Impressive screening.")
                    .status(CandidateStatus.SHORTLISTED)
                    .jobPosting(job1)
                    .build();
            candidateRepository.save(cand1);

            Candidate cand2 = Candidate.builder()
                    .name("Karan Johar")
                    .email("karan.johar@example.com")
                    .phone("+91 99001 12234")
                    .experienceYears(4)
                    .notes("Excellent experience in styling and component architecture. Ready to join.")
                    .status(CandidateStatus.SELECTED)
                    .jobPosting(job1)
                    .build();
            candidateRepository.save(cand2);

            Candidate cand3 = Candidate.builder()
                    .name("Amit Patel")
                    .email("amit.patel@example.com")
                    .phone("+91 99001 12235")
                    .experienceYears(2)
                    .notes("Basic React. Needs preparation on hooks and state management.")
                    .status(CandidateStatus.APPLIED)
                    .jobPosting(job1)
                    .build();
            candidateRepository.save(cand3);

            // Candidates for HR Executive
            Candidate cand4 = Candidate.builder()
                    .name("Pooja Hegde")
                    .email("pooja.hegde@example.com")
                    .phone("+91 99001 12236")
                    .experienceYears(2)
                    .notes("Friendly, proactive. Good HR coordination experience.")
                    .status(CandidateStatus.INTERVIEW_SCHEDULED)
                    .jobPosting(job2)
                    .build();
            candidateRepository.save(cand4);

            Candidate cand5 = Candidate.builder()
                    .name("Rahul Roy")
                    .email("rahul.roy@example.com")
                    .phone("+91 99001 12237")
                    .experienceYears(1)
                    .notes("MBA fresh graduate. Enthusiastic, needs training.")
                    .status(CandidateStatus.APPLIED)
                    .jobPosting(job2)
                    .build();
            candidateRepository.save(cand5);

            // Seed Interviews
            // Interview for Neha Sharma (scheduled)
            Interview int1 = Interview.builder()
                    .candidate(cand1)
                    .interviewer(shivam)
                    .scheduledAt(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0).withSecond(0))
                    .mode("ONLINE")
                    .meetingLink("https://zoom.us/j/123456789")
                    .result("PENDING")
                    .build();
            interviewRepository.save(int1);

            // Interview for Pooja Hegde (passed interview)
            Interview int2 = Interview.builder()
                    .candidate(cand4)
                    .interviewer(karan)
                    .scheduledAt(LocalDateTime.now().minusDays(1).withHour(14).withMinute(30).withSecond(0))
                    .mode("ONLINE")
                    .meetingLink("https://zoom.us/j/987654321")
                    .feedback("Pooja demonstrated outstanding communication skills and solid understanding of employee relations.")
                    .rating(9)
                    .result("PASSED")
                    .build();
            interviewRepository.save(int2);
        }
    }
}
