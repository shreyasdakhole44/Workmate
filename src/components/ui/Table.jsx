import React from "react";

export default function Table({ columns, data = [], loading, emptyMsg = "No data found", zebra = false }) {
  if (loading) {
    return (
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-16 text-gray-400 font-medium bg-white"
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr 
                key={row.id || i} 
                className={`hover:bg-gray-50 transition-colors ${
                  zebra && i % 2 === 1 ? "bg-gray-50/30" : "bg-white"
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
