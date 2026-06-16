import React from "react";

export default function Table({ columns, data = [], loading, emptyMsg = "No data found" }) {
  if (loading) {
    return (
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/75 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-50 animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4">
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
          <tr className="bg-slate-50/75 border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
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
              <tr key={row.id || i} className="hover:bg-slate-50/50 transition-colors bg-white">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
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
