import React, { useState } from "react";
import { FileText, TrendingUp, Briefcase, Settings, ClipboardCheck, Activity, ChevronLeft, ChevronRight } from "lucide-react";

const AUDIT_LOGS = [
  { id: 1, text: "System-wide automated payslips generation completed successfully.", category: "Payroll", dateGroup: "Today", time: "10:30 AM", type: "payslip" },
  { id: 2, text: "Administrator process promotion: Shreyas Dakhole promoted to Senior Lead React Architect.", category: "Promotions", dateGroup: "Today", time: "09:15 AM", type: "promotion" },
  { id: 3, text: "New job posting published: Junior Backend Engineer (Java).", category: "Recruitment", dateGroup: "Today", time: "08:00 AM", type: "recruitment" },
  { id: 4, text: "Completed database backup sequence.", category: "Payroll", dateGroup: "Today", time: "02:00 AM", type: "config" },
  
  { id: 5, text: "Onboarding checklist assigned to Bob Miller (IT Department).", category: "Onboarding", dateGroup: "Yesterday", time: "04:45 PM", type: "onboarding" },
  { id: 6, text: "Role clearance permission adjustment: Sarah Jenkins promoted to HR Director.", category: "Promotions", dateGroup: "Yesterday", time: "02:30 PM", type: "promotion" },
  { id: 7, text: "Modified salary structure config for employee Rohit Sharma.", category: "Payroll", dateGroup: "Yesterday", time: "11:15 AM", type: "payslip" },
  { id: 8, text: "Candidate Alice Smith stage advanced to 'INTERVIEW_SCHEDULED'.", category: "Recruitment", dateGroup: "Yesterday", time: "09:00 AM", type: "recruitment" },
  
  { id: 9, text: "Weekly attendance compliance audit summary compiled.", category: "Onboarding", dateGroup: "This Week", time: "Wednesday, 05:00 PM", type: "config" },
  { id: 10, text: "New candidate bob.miller@demo.com registered.", category: "Recruitment", dateGroup: "This Week", time: "Wednesday, 03:00 PM", type: "recruitment" },
  { id: 11, text: "SSL Certificate clearance updated.", category: "Onboarding", dateGroup: "This Week", time: "Tuesday, 06:30 PM", type: "config" },
  { id: 12, text: "Processed payslip distributions for May 2026 registry.", category: "Payroll", dateGroup: "This Week", time: "Monday, 10:00 AM", type: "payslip" },
  { id: 13, text: "Onboarding setup completed for Sarah Jenkins.", category: "Onboarding", dateGroup: "This Week", time: "Monday, 09:00 AM", type: "onboarding" },
  { id: 14, text: "Designation promotion logged: John Doe promoted to Software Engineer.", category: "Promotions", dateGroup: "This Week", time: "Last Friday, 04:00 PM", type: "promotion" },
  { id: 15, text: "Closed job posting for Senior Product Lead.", category: "Recruitment", dateGroup: "This Week", time: "Last Friday, 12:00 PM", type: "recruitment" }
];

const categoryIconMap = {
  Payroll: { icon: FileText, bg: "#E6F4EA", color: "#0F766E" },
  Promotions: { icon: TrendingUp, bg: "#F3E8FF", color: "#7C3AED" },
  Recruitment: { icon: Briefcase, bg: "#E8F0FE", color: "#2563EB" },
  Onboarding: { icon: ClipboardCheck, bg: "#E6FFFA", color: "#0D9488" }
};

export default function SystemActivityLog({ 
  employees = [], 
  leaves = [], 
  jobs = [], 
  payslips = [], 
  promotions = [],
  selectedDept = ""
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const categories = ["All", "Payroll", "Promotions", "Recruitment", "Onboarding"];

  // Helper function to calculate relative date groups
  const getRelativeDateGroup = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      const today = new Date();
      
      // Clear time components for day comparison
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const compDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      
      const diffTime = todayDate - compDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      return "This Week";
    } catch {
      return "Today";
    }
  };

  // Helper function to format time
  const formatLogTime = (dateStr) => {
    if (!dateStr) return "12:00 PM";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "12:00 PM";
    }
  };

  // Compile dynamic logs
  const dynamicLogs = [];

  // 1. Process payslips
  payslips.forEach(p => {
    const emp = employees.find(e => e.id === p.employeeId) || p.employee;
    if (selectedDept && emp?.department !== selectedDept) return;
    const empName = emp?.fullName || "Employee";
    const date = p.generatedAt || p.createdAt || new Date().toISOString();
    dynamicLogs.push({
      id: `payslip-${p.id}`,
      text: `Generated monthly payslip for ${empName} - Period: ${p.month}/${p.year}, Gross: ₹${(p.grossSalary || p.grossEarnings || 0).toLocaleString()}`,
      category: "Payroll",
      dateGroup: getRelativeDateGroup(date),
      time: formatLogTime(date),
      timestamp: new Date(date).getTime()
    });
  });

  // 2. Process promotions
  promotions.forEach(pr => {
    const emp = employees.find(e => e.id === pr.employeeId) || pr.employee;
    if (selectedDept && emp?.department !== selectedDept) return;
    const empName = emp?.fullName || "Employee";
    const date = pr.promotionDate || new Date().toISOString();
    dynamicLogs.push({
      id: `promo-${pr.id}`,
      text: `Promotion logged: ${empName} promoted to ${pr.newDesignation} (Salary: ₹${(pr.newSalary || 0).toLocaleString()})`,
      category: "Promotions",
      dateGroup: getRelativeDateGroup(date),
      time: formatLogTime(date),
      timestamp: new Date(date).getTime()
    });
  });

  // 3. Process jobs
  jobs.forEach(j => {
    if (selectedDept && j.department !== selectedDept) return;
    dynamicLogs.push({
      id: `job-${j.id}`,
      text: `New job posting published: ${j.title} in ${j.department} department (Openings: ${j.openings})`,
      category: "Recruitment",
      dateGroup: "This Week",
      time: "10:00 AM",
      timestamp: Date.now() - 3600000 * 24 // mock 1 day ago
    });
  });

  // 4. Process leaves
  leaves.forEach(l => {
    const emp = employees.find(e => e.id === l.employeeId) || l.employee;
    if (selectedDept && emp?.department !== selectedDept) return;
    const empName = l.employeeName || emp?.fullName || "Employee";
    const date = l.fromDate || new Date().toISOString();
    dynamicLogs.push({
      id: `leave-${l.id}`,
      text: `Pending leave request: ${empName} requested ${l.leaveTypeName || 'Leave'} for ${l.totalDays} day(s)`,
      category: "Onboarding", // Map leaves to Onboarding/HR admin category
      dateGroup: getRelativeDateGroup(date),
      time: "02:00 PM",
      timestamp: new Date(date).getTime()
    });
  });

  // Sort by timestamp desc
  dynamicLogs.sort((a, b) => b.timestamp - a.timestamp);

  // If no dynamic logs are generated, fallback to the hardcoded list
  const activeLogs = dynamicLogs.length > 0 ? dynamicLogs : AUDIT_LOGS;

  // Filter logs by activeCategory chip
  const filteredLogs = activeCategory === "All"
    ? activeLogs
    : activeLogs.filter(log => log.category === activeCategory);

  // Group logs by dateGroup
  const paginatedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize);

  // Get unique date groups in current page to render section headers
  const groupsInPage = Array.from(new Set(paginatedLogs.map(log => log.dateGroup)));

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(0);
  };

  return (
    <div className="space-y-5 text-left">
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none
                ${active 
                  ? "bg-[#0B3D2E] border-[#0B3D2E] text-white shadow-xs" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50 hover:text-gray-900"}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grouped Logs List */}
      <div className="space-y-6">
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs font-medium">
            No audit logs found for this filter category.
          </div>
        ) : (
          groupsInPage.map(group => (
            <div key={group} className="space-y-3">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">
                {group}
              </h5>
              
              <div className="space-y-2">
                {paginatedLogs
                  .filter(log => log.dateGroup === group)
                  .map(log => {
                    const iconConfig = categoryIconMap[log.category] || { icon: Activity, bg: "#F1F5F9", color: "#64748B" };
                    const Icon = iconConfig.icon;
                    return (
                      <div key={log.id} className="flex items-start gap-3 bg-white border border-gray-100/70 p-3 rounded-xl shadow-2xs hover:shadow-xs transition-shadow">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: iconConfig.bg }}
                        >
                          <Icon size={14} style={{ color: iconConfig.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 leading-snug font-medium">
                            {log.text}
                          </p>
                          <p className="text-[10px] text-gray-405 font-bold mt-1 uppercase tracking-wider">
                            {log.time} · {log.category}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {filteredLogs.length > pageSize && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
          <span>Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredLogs.length)} of {filteredLogs.length} audit logs</span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="border border-gray-250 bg-white hover:bg-slate-50 font-semibold py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button 
              disabled={(page + 1) * pageSize >= filteredLogs.length} 
              onClick={() => setPage(p => p + 1)}
              className="border border-gray-250 bg-white hover:bg-slate-50 font-semibold py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
