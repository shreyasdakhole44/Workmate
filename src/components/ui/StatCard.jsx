import React, { useEffect, useState } from "react";

export default function StatCard({ label, value, sub, icon: Icon, accent = "blue" }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue("—");
      return;
    }

    const strVal = String(value);
    const match = strVal.match(/^(\d+)(.*)$/); // Matches leading digits, e.g. "12" in "12 (80%)"
    
    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const targetNum = parseInt(match[1], 10);
    const suffix = match[2];
    
    if (targetNum === 0) {
      setDisplayValue(strVal);
      return;
    }

    const duration = 600; // milliseconds
    const startTime = performance.now();

    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quad ease-out
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * targetNum);
      
      setDisplayValue(`${currentCount}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(strVal); // Ensure exact final text
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  const accents = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-50/70 border-blue-100/50",
    },
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-50/70 border-emerald-100/50",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-50/70 border-amber-100/50",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-50/70 border-red-100/50",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-50/70 border-purple-100/50",
    },
    teal: {
      text: "text-teal-600",
      bg: "bg-teal-50/70 border-teal-100/50",
    },
  };

  const activeAccent = accents[accent] || accents.blue;

  return (
    <div className="card p-5 flex items-start justify-between bg-white border border-gray-100 rounded-xl shadow-card transition-all duration-300 hover:shadow-md">
      <div className="space-y-1">
        <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-[24px] font-bold text-gray-900 leading-none">{displayValue}</p>
        {sub && <p className="text-[11px] font-medium text-gray-400">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${activeAccent.bg}`}>
          <Icon size={18} className={activeAccent.text} />
        </div>
      )}
    </div>
  );
}
