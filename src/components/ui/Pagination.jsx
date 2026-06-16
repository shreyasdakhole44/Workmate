import React from "react";

export default function Pagination({ page, size = 10, total, onPageChange }) {
  const totalPages = Math.ceil(total / size);
  if (totalPages <= 1) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, total);

  // Simple page numbers generator
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white rounded-b-xl shrink-0">
      <span className="font-medium text-gray-500">
        Showing <span className="font-semibold text-gray-900">{start}</span>-
        <span className="font-semibold text-gray-900">{end}</span> of{" "}
        <span className="font-semibold text-gray-900">{total}</span> records
      </span>
      
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors mr-1"
        >
          Previous
        </button>
        
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              p === page
                ? "bg-brand text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p + 1}
          </button>
        ))}
        
        <button
          type="button"
          disabled={(page + 1) * size >= total}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ml-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
