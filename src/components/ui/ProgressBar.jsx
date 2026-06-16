import React, { useEffect, useState } from "react";

export default function ProgressBar({ percentage = 0, color = "brand", height = "h-2" }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Add micro-delay to trigger initial mount animation
    const timeout = setTimeout(() => {
      setWidth(Math.min(Math.max(percentage, 0), 100));
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  const colors = {
    brand: "bg-brand",
    blue: "bg-blue-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  const colorClass = colors[color] || colors.brand;

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height} shrink-0`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
