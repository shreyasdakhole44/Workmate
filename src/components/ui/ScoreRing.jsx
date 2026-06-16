import React, { useEffect, useState } from "react";

export default function ScoreRing({ score = 0, max = 10, size = 80 }) {
  const normalizedScore = Number(score) || 0;
  const percentage = (normalizedScore / max) * 100;
  
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (percentage / 100) * circumference;
    const timeout = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage, circumference]);

  let strokeColor = "stroke-brand";
  if (percentage < 60) {
    strokeColor = "stroke-red-500";
  } else if (percentage < 80) {
    strokeColor = "stroke-amber-500";
  } else {
    strokeColor = "stroke-emerald-500";
  }

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 100 100">
        {/* Track */}
        <circle
          className="stroke-gray-100"
          strokeWidth="7"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Fill progress */}
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      {/* Label in center */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold text-gray-900 leading-none">{normalizedScore}</span>
        <span className="text-[8px] font-bold text-gray-400 mt-0.5">/{max}</span>
      </div>
    </div>
  );
}
