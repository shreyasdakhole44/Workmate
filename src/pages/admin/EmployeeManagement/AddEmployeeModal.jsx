import React from "react";
import Modal from "../../../components/ui/Modal";
import { DEPARTMENTS } from "../../../utils/constants";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function AddEmployeeModal({
  open,
  onClose,
  form,
  setForm,
  managers,
  saving,
  onSubmit,
  currentStep,
  setCurrentStep
}) {
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      toast.error("Please fill all fields for Account Setup");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setCurrentStep(2);
  };

  return (
    <Modal open={open} onClose={onClose} title="Register New Employee" size="lg">
      {/* Visual Step Wizard Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-900">Account</span>
        </div>
        <div className={`flex-1 h-0.5 transition-all duration-300 ${currentStep === 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 ${
            currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
          }`}>2</div>
          <span className={`text-sm font-medium transition-colors ${currentStep === 2 ? "text-gray-900" : "text-gray-400"}`}>Profile</span>
        </div>
      </div>

      {currentStep === 1 ? (
        // STEP 1: LOGIN ACCOUNT SETTINGS
        <form onSubmit={handleNextStep} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Login Email *</label>
              <input 
                type="email" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
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
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Security Role *</label>
              <div className="relative">
                <select 
                  className="h-11 border border-gray-200 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})} 
                  required
                >
                  <option value="EMPLOYEE">Employee (Personal portal view)</option>
                  <option value="HR_MANAGER">HR Manager (Team management view)</option>
                  <option value="ADMIN">Admin (Full administrative credentials)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
            <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer">
              Continue
            </button>
          </div>
        </form>
      ) : (
        // STEP 2: PROFILE DETAILS
        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
              <input 
                type="text" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
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
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                placeholder="Doe"
                value={form.lastName} 
                onChange={e => setForm({...form, lastName: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
              <div className="relative">
                <select 
                  className="h-11 border border-gray-200 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
                  value={form.department} 
                  onChange={e => setForm({...form, department: e.target.value})} 
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Designation</label>
              <input 
                type="text" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                placeholder="Software Engineer"
                value={form.designation} 
                onChange={e => setForm({...form, designation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <input 
                type="text" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                placeholder="+91 9876543210"
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Annual Salary (INR)</label>
              <input 
                type="number" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs" 
                placeholder="850000"
                value={form.salary} 
                onChange={e => setForm({...form, salary: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Join Date</label>
              <input 
                type="date" 
                className="h-11 border border-gray-200 rounded-lg px-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer"
                value={form.joinDate} 
                onChange={e => setForm({...form, joinDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reporting Manager</label>
              <div className="relative">
                <select 
                  className="h-11 border border-gray-250 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
                  value={form.managerId} 
                  onChange={e => setForm({...form, managerId: e.target.value})}
                >
                  <option value="">Select Reporting Manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.department})</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
            <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer" onClick={() => setCurrentStep(1)}>
              Back
            </button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 text-xs rounded-lg transition-colors cursor-pointer" disabled={saving}>
              {saving ? "Saving..." : "Create Employee"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
