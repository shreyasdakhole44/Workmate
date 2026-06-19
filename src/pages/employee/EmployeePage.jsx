import React, { useState, useEffect } from "react";
import { employeeAPI, authAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Modal from "../../components/ui/Modal";
import SlidePanel from "../../components/ui/SlidePanel";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { Plus, Search, Pencil, Trash2, Eye, Award, X, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { DEPARTMENTS } from "../../utils/constants";

export default function EmployeePage() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  
  // Filter States
  const [search, setSearch] = useState(location.state?.search || "");
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal & SlidePanel States
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // tracking row for inline delete confirmation

  // Two-Step Form State for Creating Employee
  const [currentStep, setCurrentStep] = useState(1); // 1 or 2
  
  const initForm = {
    firstName: "",
    lastName: "",
    department: "",
    designation: "",
    phone: "",
    salary: "",
    joinDate: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    managerId: ""
  };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    loadEmployees();
  }, [page, search, dept]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.search(search, dept, page, 10);
      setEmployees(res.data.data?.content || []);
      setTotal(res.data.data?.totalElements || 0);

      // Load manager listings (summaries)
      const mgrRes = await employeeAPI.getSummaries();
      setManagers(mgrRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load employees directory");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(initForm);
    setCurrentStep(1);
    setModal("create");
  };

  const openEditModal = (emp) => {
    setSelectedEmp(emp);
    setForm({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      department: emp.department || "",
      designation: emp.designation || "",
      phone: emp.phone || "",
      salary: emp.salary || "",
      joinDate: emp.joinDate || "",
      managerId: emp.managerId || "",
      email: emp.email || "",
      role: emp.role || "EMPLOYEE"
    });
    setModal("edit");
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      toast.error("Please fill all fields for Account Setup");
      return;
    }
    // Simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setCurrentStep(2);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.department) {
      toast.error("Please fill all required profile fields");
      return;
    }
    setSaving(true);
    try {
      // Step 1: Register User Account
      const userRes = await authAPI.register({
        email: form.email,
        password: form.password,
        role: form.role
      });
      const userId = userRes.data.data?.userId;

      // Step 2: Create Employee Profile
      await employeeAPI.create({
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        designation: form.designation,
        phone: form.phone,
        joinDate: form.joinDate || new Date().toISOString().split("T")[0],
        salary: Number(form.salary) || 0,
        userId: userId,
        managerId: form.managerId ? Number(form.managerId) : null
      });

      toast.success("Employee created successfully!");
      setModal(null);
      setPage(0);
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create employee profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.department) {
      toast.error("Please fill all required profile fields");
      return;
    }
    setSaving(true);
    try {
      await employeeAPI.update(selectedEmp.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        designation: form.designation,
        phone: form.phone,
        joinDate: form.joinDate,
        salary: Number(form.salary) || 0,
        userId: selectedEmp.userId,
        managerId: form.managerId ? Number(form.managerId) : null
      });
      toast.success("Employee profile updated!");
      setModal(null);
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      toast.success("Employee profile deactivated successfully.");
      setDeletingId(null);
      loadEmployees();
    } catch (e) {
      toast.error("Failed to delete employee profile");
    }
  };

  const handleViewDetails = (emp) => {
    setSelectedEmp(emp);
    setViewPanelOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Avatar & Name",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.fullName} size="sm"/>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 leading-none mb-1">{r.fullName}</p>
            <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "empCode",
      label: "Emp Code",
      render: r => <span className="font-mono text-xs font-semibold text-gray-800">{r.empCode || "—"}</span>
    },
    {
      key: "department",
      label: "Department",
      render: r => <Badge label={r.department} />
    },
    {
      key: "designation",
      label: "Designation",
      render: r => <span className="text-gray-600 font-medium text-xs">{r.designation || "—"}</span>
    },
    {
      key: "joinDate",
      label: "Join Date",
      render: r => <span className="text-gray-500 text-xs">{formatDate(r.joinDate)}</span>
    },
    {
      key: "status",
      label: "Status",
      render: r => <Badge label={r.isActive ? "ACTIVE" : "INACTIVE"} />
    },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <div className="flex items-center gap-1.5">
          {deletingId === r.id ? (
            <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 animate-fadeIn">
              <span className="text-[10px] font-bold text-red-600 uppercase mr-1 select-none">Delete?</span>
              <button 
                onClick={() => handleDelete(r.id)} 
                className="text-[10px] font-bold text-red-700 hover:text-red-900 hover:underline px-1 cursor-pointer"
              >
                Yes
              </button>
              <span className="text-[10px] text-red-300">|</span>
              <button 
                onClick={() => setDeletingId(null)} 
                className="text-[10px] font-bold text-gray-500 hover:text-gray-800 hover:underline px-1 cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => handleViewDetails(r)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                title="View Full Profile"
                aria-label="View employee"
              >
                <Eye size={15} />
              </button>
              <button 
                onClick={() => openEditModal(r)}
                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                title="Edit Details"
                aria-label="Edit employee"
              >
                <Pencil size={15} />
              </button>
              {isAdmin() && r.isActive && (
                <button 
                  onClick={() => setDeletingId(r.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  title="Deactivate Profile"
                  aria-label="Delete employee"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <TopBar
        title="Employees Directory"
        subtitle={`${total} total active personnel profiles`}
        action={isAdmin() && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 cursor-pointer py-2 px-4 rounded-lg font-semibold text-xs shadow-sm">
            <Plus size={15} /> Add Employee
          </button>
        )}
      />

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="input pl-9 w-full text-xs"
            placeholder="Search by name, email, or employee code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select 
          className="input w-full sm:w-48 cursor-pointer text-xs"
          value={dept}
          onChange={e => { setDept(e.target.value); setPage(0); }}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0">
        <Table
          columns={columns}
          data={employees}
          loading={loading}
          emptyMsg="No employees found matching the filters."
        />

        <Pagination 
          page={page} 
          size={10} 
          total={total} 
          onPageChange={setPage} 
        />
      </div>

      {/* TWO-STEP CREATE MODAL */}
      <Modal open={modal === "create"} onClose={() => setModal(null)} title="Register New Employee" size="lg">
        {/* Step Indicator Tracker */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? "bg-brand text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              1
            </div>
            <span className={`text-xs font-semibold ${currentStep === 1 ? "text-gray-900" : "text-gray-400"}`}>
              Account Setup
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-150" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? "bg-brand text-white" : "bg-gray-150 text-gray-500"
            }`}>
              2
            </div>
            <span className={`text-xs font-semibold ${currentStep === 2 ? "text-gray-900" : "text-gray-400"}`}>
              Employee Profile
            </span>
          </div>
        </div>

        {currentStep === 1 ? (
          // STEP 1: LOGIN ACCOUNT SETTINGS
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Login Email *</label>
                <input 
                  type="email" 
                  className="input text-xs" 
                  placeholder="name@company.com"
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Account Password *</label>
                <input 
                  type="password" 
                  className="input text-xs" 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Security Role *</label>
                <select 
                  className="input cursor-pointer text-xs"
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})} 
                  required
                >
                  <option value="EMPLOYEE">Employee (Personal portal view)</option>
                  <option value="HR_MANAGER">HR Manager (Team management view)</option>
                  <option value="ADMIN">Admin (Full administrative credentials)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
              <button type="button" className="btn btn-white text-xs cursor-pointer" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs cursor-pointer">
                Next: Profile Details
              </button>
            </div>
          </form>
        ) : (
          // STEP 2: PROFILE DETAILS
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="John"
                  value={form.firstName} 
                  onChange={e => setForm({...form, firstName: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="Doe"
                  value={form.lastName} 
                  onChange={e => setForm({...form, lastName: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
                <select 
                  className="input cursor-pointer text-xs"
                  value={form.department} 
                  onChange={e => setForm({...form, department: e.target.value})} 
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="Software Engineer"
                  value={form.designation} 
                  onChange={e => setForm({...form, designation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  placeholder="+91 9876543210"
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Annual Salary (INR)</label>
                <input 
                  type="number" 
                  className="input text-xs" 
                  placeholder="850000"
                  value={form.salary} 
                  onChange={e => setForm({...form, salary: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Join Date</label>
                <input 
                  type="date" 
                  className="input text-xs"
                  value={form.joinDate} 
                  onChange={e => setForm({...form, joinDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reporting Manager</label>
                <select 
                  className="input cursor-pointer text-xs"
                  value={form.managerId} 
                  onChange={e => setForm({...form, managerId: e.target.value})}
                >
                  <option value="">Select Reporting Manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.department})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
              <button type="button" className="btn btn-white text-xs cursor-pointer" onClick={() => setCurrentStep(1)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary text-xs cursor-pointer" disabled={saving}>
                {saving ? "Saving..." : "Create Employee"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal open={modal === "edit"} onClose={() => setModal(null)} title="Update Employee Profile" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
              <input 
                type="text" 
                className="input text-xs"
                value={form.firstName} 
                onChange={e => setForm({...form, firstName: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
              <input 
                type="text" 
                className="input text-xs"
                value={form.lastName} 
                onChange={e => setForm({...form, lastName: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
              <select 
                className="input cursor-pointer text-xs"
                value={form.department} 
                onChange={e => setForm({...form, department: e.target.value})} 
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
              <input 
                type="text" 
                className="input text-xs"
                value={form.designation} 
                onChange={e => setForm({...form, designation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <input 
                type="text" 
                className="input text-xs"
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Annual Salary (INR)</label>
              <input 
                type="number" 
                className="input text-xs"
                value={form.salary} 
                onChange={e => setForm({...form, salary: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Join Date</label>
              <input 
                type="date" 
                className="input text-xs"
                value={form.joinDate} 
                onChange={e => setForm({...form, joinDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reporting Manager</label>
              <select 
                className="input cursor-pointer text-xs"
                value={form.managerId} 
                onChange={e => setForm({...form, managerId: e.target.value})}
              >
                <option value="">Select Reporting Manager</option>
                {managers.filter(m => m.id !== selectedEmp?.id).map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
            <button type="button" className="btn btn-white text-xs cursor-pointer" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs cursor-pointer" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS RIGHT SLIDE PANEL */}
      <SlidePanel open={viewPanelOpen} onClose={() => setViewPanelOpen(false)} title="Employee Profile Information">
        {selectedEmp && (
          <div className="space-y-6">
            {/* Upper Profile Box */}
            <div className="flex flex-col items-center text-center p-6 border border-[#E8E2D9]/60 rounded-xl bg-[#FAF7F2]/60 space-y-3">
              <Avatar name={selectedEmp.fullName} size="xl" />
              <div>
                <h4 className="text-base font-extrabold text-[#0B3D2E] leading-none">{selectedEmp.fullName}</h4>
                <p className="text-xs text-gray-400 mt-1.5">{selectedEmp.designation || "No Designation"} · {selectedEmp.department}</p>
              </div>
              <Badge label={selectedEmp.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>

            {/* General details grid */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Details</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Employee Code</p>
                  <p className="font-mono text-gray-900 font-bold">{selectedEmp.empCode || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Email Address</p>
                  <p className="text-gray-900 font-bold truncate" title={selectedEmp.email}>{selectedEmp.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Phone Number</p>
                  <p className="text-gray-900 font-bold">{selectedEmp.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Security Role</p>
                  <p className="text-gray-900 font-bold">{selectedEmp.role || "EMPLOYEE"}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-150" />

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employment Contract</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Annual Compensation</p>
                  <p className="text-[#E8420A] font-extrabold text-sm">{formatCurrency(selectedEmp.salary)}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Join Date</p>
                  <p className="text-gray-900 font-bold">{formatDate(selectedEmp.joinDate)}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Reporting Manager</p>
                  <p className="text-gray-900 font-bold">{selectedEmp.managerName || "—"}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-150 pt-2" />

            {/* Quick Actions in Side Panel */}
            <div className="flex gap-2">
              <button 
                onClick={() => { setViewPanelOpen(false); openEditModal(selectedEmp); }}
                className="btn-primary text-xs py-2 px-4 rounded-lg flex-1 justify-center"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setViewPanelOpen(false)}
                className="btn-secondary text-xs py-2 px-4 rounded-lg flex-1 justify-center"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
