import React from "react";

export default function Avatar({ name = "?", size = "md" }) {
  if (!name) name = "?";
  
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstLetter = initials[0] || "?";
  
  let colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
  
  if (/[A-F]/.test(firstLetter)) {
    colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
  } else if (/[G-L]/.test(firstLetter)) {
    colorClass = "bg-teal-50 text-teal-700 border border-teal-100";
  } else if (/[M-R]/.test(firstLetter)) {
    colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
  } else if (/[S-Z]/.test(firstLetter)) {
    colorClass = "bg-purple-50 text-purple-700 border border-purple-100";
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-semibold",
    xl: "w-16 h-16 text-lg font-bold"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center shrink-0`}>
      {initials || "?"}
    </div>
  );
}
