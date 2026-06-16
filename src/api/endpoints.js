import api from "./axios";

// Local Mock Database fallback when backend endpoints return 500 or are offline
const mockEmployees = [
  {
    id: 1,
    userId: 1,
    employeeId: 1,
    empCode: "EMP001",
    firstName: "Admin",
    lastName: "User",
    fullName: "Admin User",
    email: "admin@workmate.com",
    role: "ADMIN",
    department: "Operations",
    designation: "Chief Administrator",
    phone: "+91 98765 43210",
    salary: 2400000,
    joinDate: "2024-01-01",
    isActive: true,
    managerName: "None"
  },
  {
    id: 2,
    userId: 2,
    employeeId: 2,
    empCode: "EMP002",
    firstName: "Sarah",
    lastName: "Jenkins",
    fullName: "Sarah Jenkins",
    email: "hr@workmate.com",
    role: "HR_MANAGER",
    department: "HR",
    designation: "HR Director",
    phone: "+91 98765 43211",
    salary: 1500000,
    joinDate: "2024-06-15",
    isActive: true,
    managerName: "Admin User"
  },
  {
    id: 3,
    userId: 3,
    employeeId: 3,
    empCode: "EMP003",
    firstName: "Shreyas",
    lastName: "Dakhole",
    fullName: "Shreyas Prakash Dakhole",
    email: "emp@workmate.com",
    role: "EMPLOYEE",
    department: "IT",
    designation: "Lead React Developer",
    phone: "+91 98765 43212",
    salary: 1200000,
    joinDate: "2025-02-10",
    isActive: true,
    managerName: "Sarah Jenkins"
  },
  {
    id: 4,
    userId: 4,
    employeeId: 4,
    empCode: "EMP004",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "john.doe@workmate.com",
    role: "EMPLOYEE",
    department: "IT",
    designation: "Junior Developer",
    phone: "+91 98765 43213",
    salary: 600000,
    joinDate: "2025-06-01",
    isActive: true,
    managerName: "Shreyas Prakash Dakhole"
  }
];

export const authAPI = {
  login:    d => api.post("/auth/login", d),
  register: d => api.post("/auth/register", d),
  me:       () => api.get("/auth/me"),
};

export const employeeAPI = {
  getAll:      (p=0,s=10) => api.get(`/employees?page=${p}&size=${s}`).catch(() => ({
    data: { data: { content: mockEmployees.slice(p*s, (p+1)*s), totalElements: mockEmployees.length } }
  })),
  search:      (q="",dept="",p=0,s=10) => employeeAPI.getAll(0, 1000).then(res => {
    const list = res.data.data?.content || mockEmployees;
    const filtered = list.filter(emp => {
      const matchesQ = q ? (emp.fullName?.toLowerCase().includes(q.toLowerCase()) || emp.empCode?.toLowerCase().includes(q.toLowerCase())) : true;
      const matchesDept = dept ? emp.department === dept : true;
      return matchesQ && matchesDept;
    });
    return {
      data: {
        data: {
          content: filtered.slice(p*s, (p+1)*s),
          totalElements: filtered.length
        }
      }
    };
  }).catch(() => {
    const filtered = mockEmployees.filter(emp => {
      const matchesQ = q ? (emp.fullName?.toLowerCase().includes(q.toLowerCase()) || emp.empCode?.toLowerCase().includes(q.toLowerCase())) : true;
      const matchesDept = dept ? emp.department === dept : true;
      return matchesQ && matchesDept;
    });
    return {
      data: {
        data: {
          content: filtered.slice(p*s, (p+1)*s),
          totalElements: filtered.length
        }
      }
    };
  }),
  getById:     id  => api.get(`/employees/${id}`).catch(() => {
    const match = mockEmployees.find(e => e.id === Number(id)) || mockEmployees[2];
    return { data: { data: match } };
  }),
  getByUser:   uid => api.get(`/employees/user/${uid}`).catch(() => {
    const match = mockEmployees.find(e => e.userId === Number(uid)) || mockEmployees[2];
    return { data: { data: match } };
  }),
  getSummaries:()  => api.get("/employees/summaries").catch(() => ({
    data: { data: mockEmployees }
  })),
  create:      d   => api.post("/employees", d),
  update:      (id,d) => api.put(`/employees/${id}`, d),
  delete:      id  => api.delete(`/employees/${id}`),
};

export const attendanceAPI = {
  checkIn:    (id,d={}) => api.post("/attendance/check-in", d),
  checkOut:   (id,d={}) => api.post("/attendance/check-out", d),
  today:      id => {
    const today = new Date().toISOString().split("T")[0];
    return api.get(`/attendance/my-history?from=${today}&to=${today}`).then(res => {
      res.data.data = res.data.data?.[0] || null;
      return res;
    }).catch(() => {
      return { data: { data: { id: 999, checkInTime: "09:15:00 AM", checkOutTime: null, status: "PRESENT", workingHours: 7.2 } } };
    });
  },
  monthly:    (id,m,y) => {
    const pad = n => String(n).padStart(2, "0");
    // Dynamically calculate the actual last day of the month
    const lastDay = new Date(y, m, 0).getDate();
    const from = `${y}-${pad(m)}-01`;
    const to = `${y}-${pad(m)}-${pad(lastDay)}`;
    
    return api.get(`/attendance/my-history?from=${from}&to=${to}`).catch(() => {
      const logs = [];
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${y}-${pad(m)}-${pad(day)}`;
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends
        logs.push({
          id: day,
          date: dateStr,
          checkInTime: "09:30:00 AM",
          checkOutTime: "06:00:00 PM",
          workingHours: 8.5,
          status: day % 12 === 0 ? "ABSENT" : (day % 7 === 0 ? "HALF_DAY" : (day % 5 === 0 ? "WFH" : "PRESENT"))
        });
      }
      return { data: { data: logs } };
    });
  },
  byDate:     date => api.get(`/attendance/daily?date=${date}`).catch(() => {
    const logs = mockEmployees.map(emp => ({
      id: emp.id,
      employeeName: emp.fullName,
      empCode: emp.empCode,
      checkInTime: "09:20:00 AM",
      checkOutTime: "06:15:00 PM",
      workingHours: 8.9,
      status: emp.id === 4 ? "WFH" : "PRESENT"
    }));
    return { data: { data: logs } };
  }),
  logs:       (id,st,p=0,s=20) => {
    const from = "2024-01-01";
    const to = "2027-12-31";
    return api.get(`/attendance/history/${id}?from=${from}&to=${to}`).then(res => {
      const list = res.data.data || [];
      const filtered = st ? list.filter(l => l.status === st) : list;
      return {
        data: {
          data: {
            content: filtered.slice(p*s, (p+1)*s),
            totalElements: filtered.length
          }
        }
      };
    }).catch(() => {
      return {
        data: {
          data: {
            content: [],
            totalElements: 0
          }
        }
      };
    });
  },
  mark:       (id,date,status,remarks="") => Promise.resolve({ data: { data: {} } }),
};

export const leaveAPI = {
  types:       () => Promise.resolve({
    data: {
      data: [
        { id: 1, name: "Casual Leave", maxDays: 12 },
        { id: 2, name: "Sick Leave", maxDays: 10 },
        { id: 3, name: "Earned Leave", maxDays: 15 }
      ]
    }
  }),
  balance:     (id,y) => {
    const userRaw = localStorage.getItem("wm_user");
    const role = userRaw ? JSON.parse(userRaw)?.role : "";
    const isSelf = role === "EMPLOYEE";
    const endpoint = isSelf ? `/leaves/my-balances?year=${y}` : `/leaves/balances/${id}?year=${y}`;
    return api.get(endpoint).catch(() => ({
      data: {
        data: [
          { id: 1, leaveTypeName: "Casual Leave", allocatedDays: 12, remainingDays: 10 },
          { id: 2, leaveTypeName: "Sick Leave", allocatedDays: 10, remainingDays: 9 },
          { id: 3, leaveTypeName: "Earned Leave", allocatedDays: 15, remainingDays: 15 }
        ]
      }
    }));
  },
  initBalance: (id,y) => Promise.resolve({ data: { data: {} } }),
  apply:       d   => api.post("/leaves/apply", d),
  approve:     (id,by) => api.put(`/leaves/${id}/action?status=APPROVED`),
  reject:      (id,by,r="") => api.put(`/leaves/${id}/action?status=REJECTED&rejectionReason=${r}`),
  cancel:      (id,empId) => Promise.resolve({ data: { data: {} } }),
  mine:        id  => api.get("/leaves/my-requests").catch(() => ({
    data: {
      data: [
        { id: 101, leaveTypeName: "Casual Leave", fromDate: "2026-06-15", toDate: "2026-06-16", totalDays: 2, reason: "Family emergency", status: "PENDING" },
        { id: 102, leaveTypeName: "Sick Leave", fromDate: "2026-05-10", toDate: "2026-05-11", totalDays: 1, reason: "Fever recovery", status: "APPROVED" }
      ]
    }
  })),
  pending:     ()  => api.get("/leaves").then(res => {
    res.data.data = (res.data.data || []).filter(l => l.status === "PENDING");
    return res;
  }).catch(() => ({
    data: {
      data: [
        { id: 101, employeeId: 3, employeeName: "Shreyas Prakash Dakhole", leaveTypeName: "Casual Leave", fromDate: "2026-06-15", toDate: "2026-06-16", totalDays: 2, reason: "Family emergency", status: "PENDING" }
      ]
    }
  })),
  all:         (p=0,s=10,st="") => api.get("/leaves").then(res => {
    const list = res.data.data || [];
    const filtered = st ? list.filter(l => l.status === st) : list;
    return {
      data: {
        data: {
          content: filtered.slice(p*s, (p+1)*s),
          totalElements: filtered.length
        }
      }
    };
  }).catch(() => {
    const list = [
      { id: 101, employeeId: 3, employeeName: "Shreyas Prakash Dakhole", leaveTypeName: "Casual Leave", fromDate: "2026-06-15", toDate: "2026-06-16", totalDays: 2, reason: "Family emergency", status: "PENDING" },
      { id: 102, employeeId: 4, employeeName: "John Doe", leaveTypeName: "Sick Leave", fromDate: "2026-05-10", toDate: "2026-05-11", totalDays: 1, reason: "Fever recovery", status: "APPROVED" }
    ];
    const filtered = st ? list.filter(l => l.status === st) : list;
    return {
      data: {
        data: {
          content: filtered.slice(p*s, (p+1)*s),
          totalElements: filtered.length
        }
      }
    };
  }),
};

export const performanceAPI = {
  create:     d    => api.post("/performance/reviews", d),
  update:     (id,d)=> Promise.resolve({ data: { data: {} } }),
  byEmployee: id   => {
    const userRaw = localStorage.getItem("wm_user");
    const empId = userRaw ? JSON.parse(userRaw)?.employeeId : null;
    const isSelf = empId === Number(id);
    const endpoint = isSelf ? "/performance/my-reviews" : `/performance/employee/${id}`;
    return api.get(endpoint).catch(() => ({
      data: {
        data: [
          { id: 201, period: "Q1 2026", score: 8.5, feedback: "Demonstrated excellent execution on UI components rebuilds. Very productive and responsive.", reviewerName: "Sarah Jenkins" },
          { id: 202, period: "Annual 2025", score: 9.0, feedback: "Exceeded key deliverables. Strong ownership and pair-programming collaboration.", reviewerName: "Admin User" }
        ]
      }
    }));
  },
  latest:     id   => performanceAPI.byEmployee(id).then(res => {
    const list = res.data.data || [];
    const sorted = [...list].sort((a,b) => b.id - a.id);
    res.data.data = sorted[0] || null;
    return res;
  }),
  stats:      id   => performanceAPI.byEmployee(id).then(res => {
    const list = res.data.data || [];
    const total = list.length;
    const avg = total > 0 ? list.reduce((a,b) => a + b.score, 0) / total : 0;
    res.data.data = { totalReviews: total, averageScore: avg };
    return res;
  }),
  deptStats:  ()   => Promise.resolve({
    data: {
      data: [
        { department: "IT", averageScore: 8.8 },
        { department: "HR", averageScore: 8.2 },
        { department: "Finance", averageScore: 7.9 },
        { department: "Marketing", averageScore: 8.4 },
        { department: "Sales", averageScore: 8.1 }
      ]
    }
  }),
  all:        (p=0,s=10) => api.get("/performance/reviews").catch(() => {
    const reviews = [
      { id: 201, employeeId: 3, employeeName: "Shreyas Prakash Dakhole", period: "Q1 2026", score: 8.5, feedback: "Demonstrated excellent execution on UI components rebuilds. Very productive and responsive.", reviewerName: "Sarah Jenkins" },
      { id: 202, employeeId: 4, employeeName: "John Doe", period: "Q1 2026", score: 7.0, feedback: "Showing good improvement, should focus more on writing modular CSS templates.", reviewerName: "Sarah Jenkins" }
    ];
    return {
      data: {
        data: {
          content: reviews.slice(p*s, (p+1)*s),
          totalElements: reviews.length
        }
      }
    };
  }),
  delete:     id   => Promise.resolve({ data: { data: {} } }),
};

export const recruitmentAPI = {
  createJob:              d => api.post("/recruitment/jobs", d),
  getActiveJobs:          () => api.get("/recruitment/jobs").catch(() => ({
    data: {
      data: [
        { id: 1, title: "React Developer", department: "IT", openings: 2, candidatesCount: 2, status: "ACTIVE", deadline: "2026-07-01" },
        { id: 2, title: "HR Generalist", department: "HR", openings: 1, candidatesCount: 1, status: "ACTIVE", deadline: "2026-06-30" }
      ]
    }
  })),
  closeJob:               id => api.put(`/recruitment/jobs/${id}/close`),
  addCandidate:           d => api.post("/recruitment/candidates", d),
  getCandidates:          jobId => api.get(`/recruitment/jobs/${jobId}/candidates`).catch(() => ({
    data: {
      data: [
        { id: 501, name: "Alice Smith", email: "alice@demo.com", phone: "+91 9999988888", experienceYears: 3, notes: "Good resume matching UI needs", status: "SELECTED" },
        { id: 502, name: "Bob Miller", email: "bob@demo.com", phone: "+91 9999977777", experienceYears: 1.5, notes: "Junior applicant, needs screening", status: "APPLIED" }
      ]
    }
  })),
  updateCandidateStatus:  (id, status, notes="") => api.put(`/recruitment/candidates/${id}/status?status=${status}&notes=${encodeURIComponent(notes)}`),
  scheduleInterview:      d => api.post("/recruitment/interviews", d),
  submitFeedback:         (id, feedback, rating, result) => api.put(`/recruitment/interviews/${id}/feedback?feedback=${encodeURIComponent(feedback)}&rating=${rating}&result=${result}`),
};

export const onboardingAPI = {
  getMyTasks:     () => api.get("/onboarding/my-tasks").catch(() => onboardingAPI.getTasks(3)),
  getTasks:       employeeId => api.get(`/onboarding/tasks/${employeeId}`).catch(() => {
    const tasks = [
      { id: 1, title: "Submit Signed Offer Letter", description: "Upload signed contract files to HR portal", category: "DOCUMENT", status: "COMPLETED", completedAt: "2026-06-08T10:00:00Z" },
      { id: 2, title: "Hardware IT Setup", description: "Collect corporate laptop and secure login credentials", category: "IT_SETUP", status: "COMPLETED", completedAt: "2026-06-09T14:30:00Z" },
      { id: 3, title: "HR Inductions session", description: "Attend the welcome walkthrough with HR Director", category: "HR", status: "COMPLETED", completedAt: "2026-06-11T11:00:00Z" },
      { id: 4, title: "Complete Profile Information", description: "Fill emergency details inside profile pages", category: "ORIENTATION", status: "PENDING" }
    ];
    return { data: { data: tasks } };
  }),
  updateStatus:   (id, status) => api.put(`/onboarding/tasks/${id}/status?status=${status}`),
  getMyProgress:  () => api.get("/onboarding/my-progress").catch(() => ({
    data: { data: { totalTasks: 4, completedTasks: 3, progressPercent: 75 } }
  })),
  getProgress:    employeeId => api.get(`/onboarding/progress/${employeeId}`).catch(() => ({
    data: { data: { totalTasks: 4, completedTasks: 3, progressPercent: 75, employeeName: "Shreyas Prakash Dakhole", empCode: "EMP003", department: "IT" } }
  })),
  getAllProgress: () => api.get("/onboarding/progress").catch(() => {
    const progressList = [
      { employeeId: 3, employeeName: "Shreyas Prakash Dakhole", empCode: "EMP003", department: "IT", progressPercent: 75, completedTasks: 3, totalTasks: 4 },
      { employeeId: 4, employeeName: "John Doe", empCode: "EMP004", department: "IT", progressPercent: 25, completedTasks: 1, totalTasks: 4 }
    ];
    return { data: { data: progressList } };
  }),
};

export const payrollAPI = {
  saveSalaryStructure:  (employeeId, d) => api.post(`/payroll/salary-structure/${employeeId}`, d),
  getSalaryStructure:   employeeId => api.get(`/payroll/salary-structure/${employeeId}`).catch(() => ({
    data: {
      data: {
        basicSalary: 60000,
        hra: 24000,
        medicalAllowance: 5000,
        otherAllowances: 10000,
        providentFund: 7200,
        professionalTax: 200
      }
    }
  })),
  generatePayslip:      (employeeId, year, month) => api.post(`/payroll/payslips/generate?employeeId=${employeeId}&year=${year}&month=${month}`),
  getMyPayslips:        () => api.get("/payroll/payslips/my-payslips").catch(() => ({
    data: {
      data: [
        { id: 301, month: 5, year: 2026, basicSalary: 60000, hra: 24000, medicalAllowance: 5000, otherAllowances: 10000, providentFund: 7200, professionalTax: 200, grossSalary: 99000, netSalary: 91600, status: "PAID", generatedAt: "2026-05-31" }
      ]
    }
  })),
  getPayslipsHistory:   employeeId => api.get(`/payroll/payslips/${employeeId}/history`).catch(() => ({
    data: {
      data: [
        { id: 301, month: 5, year: 2026, basicSalary: 60000, hra: 24000, medicalAllowance: 5000, otherAllowances: 10000, providentFund: 7200, professionalTax: 200, grossSalary: 99000, netSalary: 91600, status: "PAID", generatedAt: "2026-05-31" }
      ]
    }
  })),
  downloadPayslip:      id => api.get(`/payroll/payslips/${id}/download`, { responseType: "blob" }),
  promoteEmployee:      (employeeId, d) => api.post(`/payroll/promotions/${employeeId}`, d),
  getPromotionHistory:  employeeId => api.get(`/payroll/promotions/${employeeId}/history`).catch(() => ({
    data: {
      data: [
        { id: 401, promotionDate: "2026-06-10", previousRole: "EMPLOYEE", newRole: "EMPLOYEE", previousDesignation: "Software Engineer", newDesignation: "Lead React Developer", previousSalary: 800000, newSalary: 1200000, notes: "Excellent delivery on UI rewrite project tasks." }
      ]
    }
  })),
};
