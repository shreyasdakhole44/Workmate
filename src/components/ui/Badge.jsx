import React from "react";
import { STATUS_COLORS } from "../../utils/constants";

export default function Badge({ label, color }) {
  const normalizedLabel = label?.toUpperCase() || "";
  
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    gray: "bg-gray-50 text-gray-650 border border-gray-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
    teal: "bg-teal-50 text-teal-700 border border-teal-100",
    orange: "bg-orange-50 text-orange-700 border border-orange-100",
  };

  const getStatusClass = (lbl) => {
    switch (lbl) {
      case "PRESENT":
      case "PAID":
      case "APPROVED":
      case "COMPLETED":
      case "ACTIVE":
      case "SELECTED":
        return colorMap.emerald;
      case "PENDING":
      case "IN PROGRESS":
      case "IN_PROGRESS":
      case "GENERATED":
        return colorMap.amber;
      case "ABSENT":
      case "REJECTED":
      case "FAILED":
      case "INACTIVE":
        return colorMap.red;
      case "SCHEDULED":
      case "SOCIAL":
      case "INFO":
      case "SHORTLISTED":
      case "WELLNESS":
      case "FINANCE":
        return colorMap.blue;
      case "ALERT":
      case "APPLIED":
        return colorMap.orange;
      default:
        return STATUS_COLORS[lbl] || colorMap.gray;
    }
  };

  const badgeClass = color
    ? (colorMap[color] || colorMap.gray)
    : getStatusClass(normalizedLabel);

  const displayLabel = label ? label.replace(/_/g, " ") : "";

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
      {displayLabel}
    </span>
  );
}
