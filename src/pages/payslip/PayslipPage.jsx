import React, { useEffect, useState } from "react";
import { payrollAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { Download, Eye, FileText, Landmark } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function PayslipPage() {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  
  // Selected Payslip for detail popup
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await payrollAPI.getMyPayslips();
      setPayslips(res.data.data || []);
    } catch {
      toast.error("Failed to load your payslip records history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (slip) => {
    setDownloadingId(slip.id);
    try {
      const res = await payrollAPI.downloadPayslip(slip.id);
      // Backend response type is blob
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payslip-${slip.year}-${slip.month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Payslip PDF downloaded successfully!");
    } catch {
      toast.error("Failed to download payslip PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const columns = [
    {
      key: "period",
      label: "Payout Period",
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-brand rounded-lg flex items-center justify-center shrink-0">
            <FileText size={15}/>
          </div>
          <div>
            <p className="font-semibold text-gray-950 text-xs leading-none mb-0.5">{monthNames[r.month]} {r.year}</p>
            <p className="text-[10px] text-gray-400">Generated on {formatDate(r.generatedAt)}</p>
          </div>
        </div>
      )
    },
    { key: "grossSalary", label: "Gross Earnings", render: r => <span className="font-semibold text-xs text-gray-900">{formatCurrency(r.grossSalary)}</span> },
    { key: "providentFund", label: "PF Deduction", render: r => <span className="text-red-500 text-xs">{formatCurrency(r.providentFund)}</span> },
    { key: "professionalTax", label: "Prof. Tax", render: r => <span className="text-red-500 text-xs">{formatCurrency(r.professionalTax)}</span> },
    { key: "netSalary", label: "Net Payout", render: r => <span className="font-bold text-xs text-emerald-600">{formatCurrency(r.netSalary)}</span> },
    { key: "status", label: "Status", render: r => <Badge label={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <div className="flex gap-2">
          <button 
            onClick={() => { setSelectedSlip(r); setDetailModal(true); }}
            className="btn btn-white btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]"
          >
            <Eye size={12}/> View Breakdown
          </button>
          <button 
            onClick={() => handleDownload(r)}
            disabled={downloadingId === r.id}
            className="btn btn-primary btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]"
          >
            {downloadingId === r.id ? <Spinner size="sm" color="white" /> : <Download size={12}/>}
            {downloadingId === r.id ? "Downloading" : "PDF"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <TopBar
        title="My Compensation & Payslips"
        subtitle="View breakdown history and download PDF formats of monthly salary disbursements"
      />

      {/* Info Card */}
      <div className="card p-5 flex flex-col sm:flex-row items-center gap-4 bg-white">
        <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center shrink-0">
          <Landmark size={20}/>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Payout Account</h4>
          <p className="text-xs text-gray-700 mt-1 font-semibold">Salaries are directly deposited to your verified bank account by the 1st of every month.</p>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-white">
        <Table
          columns={columns}
          data={payslips}
          loading={loading}
          emptyMsg="No monthly payslips have been generated for you yet."
        />
      </div>

      {/* DETAIL MODAL */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`Salary Slip - ${monthNames[selectedSlip?.month]} ${selectedSlip?.year}`}>
        {selectedSlip && (
          <div className="space-y-5">
            {/* Header metadata */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5 grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-semibold text-gray-400 uppercase tracking-wider text-[9px]">Employee Code</p>
                <p className="font-mono font-semibold text-gray-900 mt-0.5">{selectedSlip.employee?.empCode || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-400 uppercase tracking-wider text-[9px]">Generated At</p>
                <p className="font-semibold text-gray-900 mt-0.5">{new Date(selectedSlip.generatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Calculations layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings column */}
              <div>
                <h4 className="font-bold text-xs text-[#1E2A4A] border-b border-gray-150 pb-1.5 mb-2.5">Earnings</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Basic Salary:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedSlip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HRA:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedSlip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Medical Allowance:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedSlip.medicalAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Other Allowances:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(selectedSlip.otherAllowances)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-100 font-bold">
                    <span>Gross Earnings:</span>
                    <span className="text-brand">{formatCurrency(selectedSlip.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions column */}
              <div>
                <h4 className="font-bold text-xs text-[#1E2A4A] border-b border-gray-150 pb-1.5 mb-2.5">Deductions</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provident Fund (PF):</span>
                    <span className="font-semibold text-red-500">{formatCurrency(selectedSlip.providentFund)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Professional Tax:</span>
                    <span className="font-semibold text-red-500">{formatCurrency(selectedSlip.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-100 font-bold">
                    <span>Total Deductions:</span>
                    <span className="text-red-600">{formatCurrency(Number(selectedSlip.providentFund) + Number(selectedSlip.professionalTax))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net take-home */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3.5 rounded-lg text-brand font-bold text-sm">
              <span>NET TAKE-HOME PAYOUT</span>
              <span className="text-base font-extrabold">{formatCurrency(selectedSlip.netSalary)}</span>
            </div>

            {/* Actions button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button 
                className="btn btn-white cursor-pointer" 
                onClick={() => setDetailModal(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary cursor-pointer flex items-center gap-1.5" 
                onClick={() => handleDownload(selectedSlip)}
              >
                <Download size={15}/> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
