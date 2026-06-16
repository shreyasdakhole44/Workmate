import React from "react";
import { STATUS_COLORS } from "../../utils/constants";

export default function Badge({ label, color }) {
  const normalizedLabel = label?.toUpperCase() || "";
  
  // Custom overriding color classes if requested
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
    teal: "bg-teal-50 text-teal-700 border border-teal-100",
  };

  const badgeClass = color
    ? (colorMap[color] || colorMap.gray)
    : (STATUS_COLORS[normalizedLabel] || "bg-gray-100 text-gray-600 border border-gray-200");

  const displayLabel = label ? label.replace(/_/g, " ") : "";

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
      {displayLabel}
    </span>
  );
}
