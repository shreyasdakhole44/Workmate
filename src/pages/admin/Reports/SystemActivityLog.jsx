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

export default function SystemActivityLog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const categories = ["All", "Payroll", "Promotions", "Recruitment", "Onboarding"];

  // Filter logs
  const filteredLogs = activeCategory === "All"
    ? AUDIT_LOGS
    : AUDIT_LOGS.filter(log => log.category === activeCategory);

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
