import React from "react";

export default function Spinner({ size = "md", color = "brand" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4"
  };

  const colorClasses = {
    brand: "border-brand/20 border-t-brand",
    white: "border-white/25 border-t-white",
    gray: "border-gray-250 border-t-gray-500"
  };

  const sz = sizeClasses[size] || sizeClasses.md;
  const col = colorClasses[color] || colorClasses.brand;

  return (
    <div className={`rounded-full animate-spin ${sz} ${col} inline-block`} />
  );
}
