export const DEPARTMENTS = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Design",
  "Legal"
];

export const LEAVE_TYPES = [
  { id: 1, name: "Casual Leave", maxDays: 12 },
  { id: 2, name: "Sick Leave", maxDays: 10 },
  { id: 3, name: "Earned Leave", maxDays: 15 }
];

export const STATUS_COLORS = {
  PRESENT: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  ABSENT: "bg-red-50 text-red-700 border border-red-100",
  HALF_DAY: "bg-amber-50 text-amber-700 border border-amber-100",
  WFH: "bg-blue-50 text-blue-700 border border-blue-100",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  REJECTED: "bg-red-50 text-red-700 border border-red-100",
  CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  INACTIVE: "bg-red-50 text-red-700 border border-red-100",
  APPLIED: "bg-gray-100 text-gray-600 border border-gray-200",
  SHORTLISTED: "bg-blue-50 text-blue-700 border border-blue-100",
  SELECTED: "bg-emerald-50 text-emerald-700 border border-emerald-100"
};
