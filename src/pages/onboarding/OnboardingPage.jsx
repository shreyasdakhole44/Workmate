import { useEffect, useState } from "react";
import { onboardingAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { CheckCircle2, Circle, Clock, CheckSquare, Users, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({ totalTasks: 0, completedTasks: 0, progressPercent: 0 });

  // HR Specific States
  const [allProgress, setAllProgress] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empTasksModal, setEmpTasksModal] = useState(false);
  const [empTasks, setEmpTasks] = useState([]);

  useEffect(() => {
    if (isEmployee) {
      loadEmployeeView();
    } else {
      loadHRView();
    }
  }, [isEmployee]);

  const loadEmployeeView = async () => {
    setLoading(true);
    try {
      const taskRes = await onboardingAPI.getMyTasks();
      setTasks(taskRes.data.data || []);
      
      const progRes = await onboardingAPI.getMyProgress();
      setProgress(progRes.data.data || { totalTasks: 0, completedTasks: 0, progressPercent: 0 });
    } catch {
      toast.error("Failed to load onboarding checklist");
    } finally {
      setLoading(false);
    }
  };

  const loadHRView = async () => {
    setLoading(true);
    try {
      const res = await onboardingAPI.getAllProgress();
      setAllProgress(res.data.data || []);
    } catch {
      toast.error("Failed to load onboarding directory");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await onboardingAPI.updateStatus(task.id, newStatus);
      toast.success(newStatus === "COMPLETED" ? "Task completed!" : "Task marked as pending");
      loadEmployeeView();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleViewEmployeeTasks = async (emp) => {
    setSelectedEmp(emp);
    setLoading(true);
    try {
      const res = await onboardingAPI.getTasks(emp.employeeId);
      setEmpTasks(res.data.data || []);
      setEmpTasksModal(true);
    } catch {
      toast.error("Failed to load checklists for employee");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeTaskByHR = async (task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await onboardingAPI.updateStatus(task.id, newStatus);
      toast.success("Task updated");
      // Reload tasks for selected employee
      const res = await onboardingAPI.getTasks(selectedEmp.employeeId);
      setEmpTasks(res.data.data || []);
      // Refresh HR list in background
      const progressRes = await onboardingAPI.getAllProgress();
      setAllProgress(progressRes.data.data || []);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // HR Table columns
  const hrColumns = [
    {
      key: "employeeName",
      label: "Employee",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm"/>
          <div>
            <p className="font-semibold text-gray-950 leading-none mb-0.5">{r.employeeName}</p>
            <p className="text-[11px] text-gray-400">{r.empCode} · {r.department}</p>
          </div>
        </div>
      )
    },
    {
      key: "progressPercent",
      label: "Progress Completion",
      render: r => (
        <div className="w-60">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-gray-500">{r.completedTasks}/{r.totalTasks} Tasks</span>
            <span className="text-brand">{r.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#E8420A] h-full transition-all duration-500 rounded-full" style={{ width: `${r.progressPercent}%`, minWidth: "4px" }} />
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status Badge",
      render: r => {
        if (r.progressPercent === 100) {
          return <Badge label="COMPLETED" />;
        } else if (r.progressPercent === 0) {
          return <Badge label="NOT STARTED" color="gray" />;
        } else {
          return <Badge label="IN PROGRESS" />;
        }
      }
    },
    {
      key: "actions",
      label: "Audit",
      render: r => (
        <button onClick={() => handleViewEmployeeTasks(r)}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
          <ClipboardCheck size={14} className="text-gray-400" /> Review Checklist
        </button>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title={isEmployee ? "My Onboarding Checklist" : "Onboarding Audit Hub"}
        subtitle={isEmployee ? "Complete your setup tasks to get fully settled into your new role" : "Audit progress meters and checklists for all active new hires"}
        isSharedView={true}
      />

      {isEmployee ? (
        // EMPLOYEE PERSONAL CHECKLIST VIEW
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#FEF2EE] rounded-2xl flex items-center justify-center text-[#E8420A] font-extrabold text-lg shadow-sm border border-[#E8420A]/10">
                {progress.progressPercent}%
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-[#0B3D2E] text-base">Onboarding Completion</h3>
                <p className="text-xs text-gray-400 mt-0.5">Finished {progress.completedTasks} of {progress.totalTasks} total tasks</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/40">
                <div className="bg-gradient-to-r from-[#0B3D2E] to-[#E8420A] h-full transition-all duration-500" style={{ width: `${progress.progressPercent}%`, minWidth: "4px" }} />
              </div>
            </div>
          </div>

          {/* Checklist Tasks */}
          <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-6 shadow-sm">
            <h3 className="font-extrabold text-[#0B3D2E] text-sm mb-4 uppercase tracking-wider">Required Action Items</h3>
            
            {loading ? (
              <div className="text-center py-6 text-xs text-gray-400">Loading checklist items...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No onboarding tasks registered.</div>
            ) : (
              <div className="divide-y divide-[#E8E2D9]/30">
                {tasks.map(task => {
                  const done = task.status === "COMPLETED";
                  return (
                    <div key={task.id} className="py-4 flex items-start gap-4 transition-colors hover:bg-[#FAF7F2]/40 px-2 rounded-lg">
                      <button onClick={() => toggleTask(task)} className="mt-0.5 cursor-pointer shrink-0 text-gray-300 hover:text-[#E8420A] transition-colors">
                        {done ? (
                          <CheckCircle2 className="text-emerald-600" size={20}/>
                        ) : (
                          <Circle size={20}/>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs transition-all ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-450 mt-1 leading-relaxed">{task.description}</p>
                        {task.completedAt && (
                          <p className="text-[9px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                            <Clock size={10}/> Completed at {new Date(task.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        // HR DIRECTORY BOARD VIEW
        <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={16} className="text-gray-400"/>
            <span className="text-xs font-extrabold text-[#0B3D2E] uppercase tracking-widest">Active New Hires</span>
          </div>

          <Table
            columns={hrColumns}
            data={allProgress}
            loading={loading}
            emptyMsg="No employees currently found."
          />
        </div>
      )}

      {/* MODAL: HR VIEW/EDIT SPECIFIC EMPLOYEE CHECKLIST */}
      <Modal open={empTasksModal} onClose={() => setEmpTasksModal(false)} title={`${selectedEmp?.employeeName} Onboarding Tasks`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#FAF7F2]/50 p-3 rounded-lg border border-[#E8E2D9]/60 text-xs shadow-xs">
            <span className="font-bold text-gray-500">Progress Completion:</span>
            <span className="font-extrabold text-[#E8420A]">{selectedEmp?.progressPercent}% ({selectedEmp?.completedTasks}/{selectedEmp?.totalTasks} Tasks)</span>
          </div>

          <div className="divide-y divide-[#E8E2D9]/30 max-h-96 overflow-y-auto pr-1">
            {empTasks.map(task => {
              const done = task.status === "COMPLETED";
              return (
                <div key={task.id} className="py-3.5 flex items-start gap-3.5">
                  <button onClick={() => toggleEmployeeTaskByHR(task)} className="mt-0.5 cursor-pointer shrink-0 text-gray-300 hover:text-[#E8420A]">
                    {done ? (
                      <CheckCircle2 className="text-emerald-600" size={18}/>
                    ) : (
                      <Circle size={18}/>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`font-bold text-xs ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-gray-450 mt-0.5 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-150">
            <button className="btn btn-white cursor-pointer" onClick={() => setEmpTasksModal(false)}>Close Review</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
