import React, { useState, useEffect } from "react";
import { employeeAPI } from "../../../api/endpoints";
import { useAuth } from "../../../context/AuthContext";
import TopBar from "../../../components/layout/TopBar";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import Pagination from "../../../components/ui/Pagination";
import Avatar from "../../../components/ui/Avatar";
import { Plus, Search, Key, Info, ArrowLeftRight, ChevronDown, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import CreateUserModal from "./CreateUserModal";
import ChangeRoleModal from "./ChangeRoleModal";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [changeRoleModal, setChangeRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In this setup, employees are linked to users, and we fetch them using employee API search
      const res = await employeeAPI.search(search, "", page, 10);
      let content = res.data.data?.content || [];
      
      // Client-side filtering by role if filter is selected
      if (roleFilter) {
        content = content.filter(u => u.role === roleFilter);
      }
      
      setUsers(content);
      setTotal(res.data.data?.totalElements || 0);
    } catch {
      toast.error("Failed to load user accounts list");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (employeeId, role) => {
    setSaving(true);
    try {
      // Find the employee being updated
      const targetEmp = users.find(u => u.id === employeeId);
      if (!targetEmp) return;

      // Update employee with new role payload in backend
      await employeeAPI.update(employeeId, {
        firstName: targetEmp.firstName,
        lastName: targetEmp.lastName,
        department: targetEmp.department,
        designation: targetEmp.designation,
        phone: targetEmp.phone,
        joinDate: targetEmp.joinDate,
        salary: targetEmp.salary,
        userId: targetEmp.userId,
        managerId: targetEmp.managerId,
        role: role // updates user role
      });

      toast.success("User role updated successfully!");
      setChangeRoleModal(false);
      loadUsers();
    } catch (e) {
      toast.error("Failed to update user security role");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <span className="bg-red-50 text-red-705 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100 uppercase">ADMIN</span>;
      case "HR_MANAGER":
        return <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 uppercase">HR MANAGER</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase">EMPLOYEE</span>;
    }
  };

  const columns = [
    {
      key: "user",
      label: "Avatar & Login Account",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.fullName || `${r.firstName} ${r.lastName}`} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-950 leading-none mb-1">{r.fullName || `${r.firstName} ${r.lastName}`}</p>
            <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "role",
      label: "Security Level",
      render: r => getRoleBadge(r.role)
    },
    {
      key: "status",
      label: "Account Status",
      render: r => <Badge label={r.isActive ? "ACTIVE" : "INACTIVE"} />
    },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        currentUser?.role === "ADMIN" && r.isActive && (
          <button 
            onClick={() => { setSelectedUser(r); setChangeRoleModal(true); }}
            className="border border-gray-200 bg-white hover:bg-slate-50 text-gray-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-xs"
          >
            <ArrowLeftRight size={13} className="text-gray-400" /> Change Role
          </button>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <TopBar 
        title="User Accounts Management"
        subtitle="Manage user login roles, security clearances, and database access logs"
        action={
          currentUser?.role === "ADMIN" && (
            <button 
              onClick={() => setCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm animate-fadeIn"
            >
              <Plus size={16} /> Create User Account
            </button>
          )
        }
      />

      {/* Clear Scope Distinction Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 flex items-start gap-2.5 shadow-2xs">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed text-left">
          <strong>Account Management Console:</strong> This interface manages login profiles, passwords, and security roles. For employee contract parameters (such as compensation details, phone numbers, or manager hierarchies), please navigate to the <span className="font-semibold underline cursor-pointer" onClick={() => window.location.hash = "/employees"}>Employees Directory</span>.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="h-10 border border-gray-250 rounded-lg pl-9.5 pr-4 py-2 w-full text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none bg-white"
            placeholder="Search accounts by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select 
            className="h-10 border border-gray-250 rounded-lg px-3.5 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none w-full text-xs cursor-pointer bg-white appearance-none"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Security Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-450 pointer-events-none" />
        </div>
      </div>

      {/* Table & Empty States */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0 overflow-hidden">
        {users.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center w-full">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <UserCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-gray-750">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No user accounts found matching the search criteria</p>
          </div>
        ) : (
          <>
            <Table 
              columns={columns}
              data={users}
              loading={loading}
              emptyMsg="No user accounts registered."
            />

            <Pagination 
              page={page} 
              size={10} 
              total={total} 
              onPageChange={setPage} 
            />
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      <CreateUserModal 
        open={createModal}
        onClose={() => setCreateModal(false)}
        onCreated={loadUsers}
      />

      {/* CHANGE ROLE MODAL */}
      <ChangeRoleModal 
        open={changeRoleModal}
        onClose={() => setChangeRoleModal(null)}
        user={selectedUser}
        onConfirm={handleRoleChange}
        saving={saving}
      />
    </div>
  );
}
