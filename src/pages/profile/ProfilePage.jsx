import React, { useEffect, useState } from "react";
import { employeeAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { Mail, Phone, Calendar, Shield, CreditCard, User, Landmark, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function ProfilePage() {
  const { user } = useAuth();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    if (user?.userId) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getByUser(user.userId);
      const data = res.data.data;
      setEmp(data);
      if (data) {
        setEditForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || ""
        });
      }
    } catch {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.firstName || !editForm.lastName) {
      toast.error("First and Last name are required");
      return;
    }
    setSaving(true);
    try {
      // Re-use current employee fields, but overwrite name & phone
      await employeeAPI.update(emp.id, {
        ...emp,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone
      });
      toast.success("Profile details updated successfully!");
      setEditModalOpen(false);
      loadProfile();
    } catch {
      toast.error("Failed to save profile modifications");
    } finally {
      setSaving(false);
    }
  };

  const infoBox = (Icon, label, value, colorClass = "text-gray-700") => (
    <div className="flex items-center gap-3.5 p-4 bg-slate-50/50 border border-gray-100 rounded-xl">
      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xs font-semibold mt-0.5 truncate ${colorClass}`}>{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <TopBar 
        title="My Profile" 
        subtitle="Manage your personal information and view your employment registry details" 
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !emp ? (
        <div className="card p-10 text-center text-gray-400">
          Profile data not initialized.
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Navy Gradient Header Box */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E2A4A] via-[#111827] to-[#1E2A4A] text-white p-6 md:p-8 shadow-md">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                <Avatar name={emp.fullName} size="xl" />
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white tracking-tight">{emp.fullName}</h2>
                    <Badge label={user?.role} />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{emp.designation || "No Designation Assigned"}</p>
                  <p className="text-xs text-slate-400 font-mono">Employee ID: {emp.empCode || "—"}</p>
                </div>
              </div>

              {/* Edit Trigger Button */}
              <button
                onClick={() => setEditModalOpen(true)}
                className="btn bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Pencil size={13} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION: CONTACT INFORMATION */}
            <div className="card p-6 bg-white space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoBox(Mail, "Corporate Email Address", emp.email || user?.email)}
                {infoBox(Phone, "Mobile Phone Number", emp.phone)}
              </div>
            </div>

            {/* SECTION: EMPLOYMENT DETAILS */}
            <div className="card p-6 bg-white space-y-4">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoBox(Calendar, "Joining Date", formatDate(emp.joinDate))}
                {infoBox(Landmark, "Business Department", emp.department)}
                {infoBox(User, "Reporting Manager", emp.managerName || "Executive Level")}
                {user?.role === "ADMIN" || user?.role === "HR_MANAGER" ? (
                  infoBox(CreditCard, "Salary Compensation", formatCurrency(emp.salary), "text-blue-600 font-bold")
                ) : (
                  infoBox(Shield, "System Permissions Access", "Restricted / Standard Role Access")
                )}
              </div>
            </div>
          </div>

          {emp.managerName && (
            <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-xs">
              <h4 className="font-bold text-gray-700 mb-1">Corporate Hierarchy Hierarchy</h4>
              <p className="text-gray-500 leading-relaxed">
                You report directly to <span className="font-semibold text-gray-950">{emp.managerName}</span>. Any leave requests, timesheets logging, and performance reviews will be routed through this manager for review approvals.
              </p>
            </div>
          )}

        </div>
      )}

      {/* EDIT MODAL */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Personal Contact Details" size="sm">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
              <input
                type="text"
                className="input text-xs"
                value={editForm.firstName}
                onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
              <input
                type="text"
                className="input text-xs"
                value={editForm.lastName}
                onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Phone</label>
              <input
                type="text"
                className="input text-xs"
                placeholder="+91 9876543210"
                value={editForm.phone}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-[11px] text-gray-500">
              Note: Corporate metadata such as Employee Code, Joining Date, Department, and Salary can only be adjusted by HR Administrators.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              className="btn btn-white text-xs cursor-pointer"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs cursor-pointer flex items-center justify-center min-w-24"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" color="white" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
