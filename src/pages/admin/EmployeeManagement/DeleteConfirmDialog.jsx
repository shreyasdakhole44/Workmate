import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmDialog({ employee, onConfirm, onCancel }) {
  if (!employee) return null;

  return (
    <div className="bg-white rounded-xl border border-red-100 p-5 shadow-lg text-left max-w-md mx-auto">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            Deactivate {employee.fullName || employee.name}?
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            This will soft-delete the employee record. Their login will be 
            disabled but historical data (attendance, leave, payslips) is 
            preserved for compliance.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
        <button 
          onClick={onCancel}
          className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-750 text-white font-semibold px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
        >
          Deactivate Employee
        </button>
      </div>
    </div>
  );
}
