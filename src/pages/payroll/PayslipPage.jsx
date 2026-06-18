import { useEffect, useState } from "react";
import { payrollAPI } from "../../api/endpoints";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { Download, Eye, FileText, Landmark } from "lucide-react";
import toast from "react-hot-toast";

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
      toast.error("Failed to load your payslips history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (slip) => {
    setDownloadingId(slip.id);
    try {
      const res = await payrollAPI.downloadPayslip(slip.id);
      
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
            <p className="text-[10px] text-gray-400">Issued on {new Date(r.generatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      )
    },
    { key: "grossSalary", label: "Gross Earnings", render: r => <span className="font-semibold text-xs text-gray-900">${r.grossSalary}</span> },
    { key: "providentFund", label: "PF Deduction", render: r => <span className="text-red-500 text-xs">${r.providentFund}</span> },
    { key: "professionalTax", label: "Prof. Tax", render: r => <span className="text-red-500 text-xs">${r.professionalTax}</span> },
    { key: "netSalary", label: "Net Take-Home", render: r => <span className="font-bold text-xs text-emerald-600">${r.netSalary}</span> },
    { key: "status", label: "Status", render: r => <Badge label={r.status} color="emerald" /> },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <div className="flex gap-2">
          <button onClick={() => { setSelectedSlip(r); setDetailModal(true); }}
            className="btn btn-white btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]">
            <Eye size={12}/> View Breakdowns
          </button>
          <button onClick={() => handleDownload(r)}
            disabled={downloadingId === r.id}
            className="btn btn-primary btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]">
            <Download size={12}/> {downloadingId === r.id ? "Downloading..." : "PDF"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title="My Compensation & Payslips"
        subtitle="View breakdown history and download PDF formats of monthly salary disbursements"
      />

      {/* Summary Box */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 p-5 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="w-10 h-10 bg-[#FEF2EE] text-[#E8420A] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-[#E8420A]/10">
          <Landmark size={20}/>
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-[#0B3D2E] uppercase tracking-wider">Salary Payout Account</h4>
          <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">Salaries are directly deposited to your verified bank account by the 1st of every month.</p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D9]/60 shadow-sm p-0">
        <Table
          columns={columns}
          data={payslips}
          loading={loading}
          emptyMsg="No monthly payslips have been generated for you yet."
        />
      </div>

      {/* MODAL: DETAIL BREAKDOWNS */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`Salary Slip - ${monthNames[selectedSlip?.month]} ${selectedSlip?.year}`}>
        {selectedSlip && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="bg-[#FAF7F2]/50 border border-[#E8E2D9]/40 rounded-lg p-3 grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-bold text-gray-400">Employee Code</p>
                <p className="font-bold text-[#0B3D2E] mt-0.5">{selectedSlip.employee?.empCode || "N/A"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-400">Generated At</p>
                <p className="font-bold text-[#0B3D2E] mt-0.5">{new Date(selectedSlip.generatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Calculations layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings column */}
              <div>
                <h4 className="font-extrabold text-xs text-[#0B3D2E] border-b border-gray-150 pb-1.5 mb-2.5">Earnings</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-450">Basic Salary:</span>
                    <span className="text-gray-900">${selectedSlip.basicSalary}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-455">HRA:</span>
                    <span className="text-gray-900">${selectedSlip.hra}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-455">Medical Allowance:</span>
                    <span className="text-gray-900">${selectedSlip.medicalAllowance}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-455">Other Allowances:</span>
                    <span className="text-gray-900">${selectedSlip.otherAllowances}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#E8E2D9]/60 font-bold text-gray-900">
                    <span>Gross Earnings:</span>
                    <span className="text-[#0B3D2E]">${selectedSlip.grossSalary}</span>
                  </div>
                </div>
              </div>

              {/* Deductions column */}
              <div>
                <h4 className="font-extrabold text-xs text-[#0B3D2E] border-b border-gray-150 pb-1.5 mb-2.5">Deductions</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-455">Provident Fund (PF):</span>
                    <span className="text-red-500">${selectedSlip.providentFund}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-455">Professional Tax:</span>
                    <span className="text-red-500">${selectedSlip.professionalTax}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#E8E2D9]/60 font-bold text-gray-900">
                    <span>Total Deductions:</span>
                    <span className="text-red-650">${Number(selectedSlip.providentFund) + Number(selectedSlip.professionalTax)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Row */}
            <div className="flex items-center justify-between bg-[#FEF2EE] border border-[#E8420A]/20 p-3.5 rounded-lg text-[#E8420A] font-extrabold text-sm shadow-sm">
              <span>NET TAKE-HOME PAYOUT</span>
              <span className="text-base font-black">${selectedSlip.netSalary}</span>
            </div>

            {/* Actions button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button className="btn btn-white cursor-pointer" onClick={() => setDetailModal(false)}>Close View</button>
              <button className="btn btn-primary cursor-pointer flex items-center gap-1.5" onClick={() => handleDownload(selectedSlip)}>
                <Download size={15}/> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
