import { useEffect, useState } from "react";
import { recruitmentAPI, employeeAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { Briefcase, UserPlus, CalendarDays, ClipboardCheck, Plus, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function RecruitmentPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "candidates" | "interviews"
  const [loading, setLoading] = useState(true);

  // Data States
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]); // for interviewers
  
  // Selected Job for Candidate view
  const [selectedJobId, setSelectedJobId] = useState("");

  // Modals
  const [jobModal, setJobModal] = useState(false);
  const [candidateModal, setCandidateModal] = useState(false);
  const [interviewModal, setInterviewModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);

  // Form States
  const [jobForm, setJobForm] = useState({ title: "", department: "", description: "", requirements: "", openings: 1, deadline: "" });
  const [candidateForm, setCandidateForm] = useState({ jobPostingId: "", name: "", email: "", phone: "", resumeUrl: "", experienceYears: 0, notes: "" });
  const [interviewForm, setInterviewForm] = useState({ candidateId: "", interviewerId: "", scheduledAt: "", mode: "ONLINE", meetingLink: "" });
  const [feedbackForm, setFeedbackForm] = useState({ interviewId: "", feedback: "", rating: 5, result: "PASSED" });

  const [submitting, setSubmitting] = useState(false);

  // Selected details for status updates
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: "SHORTLISTED", notes: "" });

  useEffect(() => {
    loadJobs();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadCandidates(selectedJobId);
    } else {
      setCandidates([]);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await recruitmentAPI.getActiveJobs();
      const jobList = res.data.data || [];
      setJobs(jobList);
      if (jobList.length > 0 && !selectedJobId) {
        setSelectedJobId(jobList[0].id);
      }
    } catch {
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId) => {
    setLoading(true);
    try {
      const res = await recruitmentAPI.getCandidates(jobId);
      setCandidates(res.data.data || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getSummaries();
      setEmployees(res.data.data || []);
    } catch {
      console.error("Failed to load employee summaries");
    }
  };

  // Submit Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recruitmentAPI.createJob(jobForm);
      toast.success("Job posting created successfully!");
      setJobModal(false);
      setJobForm({ title: "", department: "", description: "", requirements: "", openings: 1, deadline: "" });
      loadJobs();
    } catch {
      toast.error("Failed to create job posting");
    } finally {
      setSubmitting(false);
    }
  };

  // Close Job
  const handleCloseJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job posting?")) return;
    try {
      await recruitmentAPI.closeJob(jobId);
      toast.success("Job posting closed successfully.");
      loadJobs();
    } catch {
      toast.error("Failed to close job posting");
    }
  };

  // Submit Candidate
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formPayload = {
        ...candidateForm,
        jobPostingId: Number(candidateForm.jobPostingId || selectedJobId)
      };
      await recruitmentAPI.addCandidate(formPayload);
      toast.success("Candidate application registered successfully!");
      setCandidateModal(false);
      setCandidateForm({ jobPostingId: "", name: "", email: "", phone: "", resumeUrl: "", experienceYears: 0, notes: "" });
      if (selectedJobId) loadCandidates(selectedJobId);
      loadJobs(); // update counts
    } catch {
      toast.error("Failed to register candidate");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Status Update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recruitmentAPI.updateCandidateStatus(selectedCandidate.id, statusForm.status, statusForm.notes);
      toast.success("Candidate status updated!");
      setStatusModal(false);
      if (selectedJobId) loadCandidates(selectedJobId);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Schedule Interview
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...interviewForm,
        candidateId: Number(interviewForm.candidateId),
        interviewerId: interviewForm.interviewerId ? Number(interviewForm.interviewerId) : null
      };
      await recruitmentAPI.scheduleInterview(payload);
      toast.success("Interview scheduled successfully!");
      setInterviewModal(false);
      setInterviewForm({ candidateId: "", interviewerId: "", scheduledAt: "", mode: "ONLINE", meetingLink: "" });
      if (selectedJobId) loadCandidates(selectedJobId);
    } catch {
      toast.error("Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recruitmentAPI.submitFeedback(
        feedbackForm.interviewId,
        feedbackForm.feedback,
        Number(feedbackForm.rating),
        feedbackForm.result
      );
      toast.success("Interview feedback submitted successfully!");
      setFeedbackModal(false);
      setFeedbackForm({ interviewId: "", feedback: "", rating: 5, result: "PASSED" });
      if (selectedJobId) loadCandidates(selectedJobId);
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  // Define table columns
  const jobColumns = [
    { key: "title", label: "Job Title", render: r => <span className="font-semibold text-gray-950">{r.title}</span> },
    { key: "department", label: "Department" },
    { key: "openings", label: "Openings", render: r => <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r.openings} Open</span> },
    { key: "deadline", label: "Deadline" },
    { key: "candidateCount", label: "Applications", render: r => <span className="text-xs font-medium text-gray-500">{r.candidateCount || 0} applied</span> },
    { key: "isActive", label: "Status", render: r => <Badge label={r.isActive ? "ACTIVE" : "CLOSED"} color={r.isActive ? "emerald" : "gray"} /> },
    {
      key: "actions",
      label: "Actions",
      render: r => r.isActive ? (
        <button onClick={() => handleCloseJob(r.id)} className="btn btn-danger btn-xs cursor-pointer py-1 px-2">
          Close Job
        </button>
      ) : <span className="text-xs text-gray-400">Closed</span>
    }
  ];

  const candidateColumns = [
    {
      key: "name",
      label: "Candidate",
      render: r => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm"/>
          <div>
            <p className="font-medium text-gray-950 leading-none mb-0.5">{r.name}</p>
            <p className="text-[11px] text-gray-400">{r.email} · {r.phone}</p>
          </div>
        </div>
      )
    },
    { key: "experienceYears", label: "Experience", render: r => <span className="font-semibold text-brand text-xs">{r.experienceYears} Years</span> },
    { key: "status", label: "Stage", render: r => <Badge label={r.status}/> },
    {
      key: "resumeUrl",
      label: "Resume",
      render: r => r.resumeUrl ? (
        <a href={r.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline font-medium">
          View Resume
        </a>
      ) : <span className="text-gray-400 text-xs">None</span>
    },
    {
      key: "actions",
      label: "Actions",
      render: r => (
        <div className="flex gap-2">
          <button onClick={() => { setSelectedCandidate(r); setStatusForm({ status: r.status, notes: r.notes || "" }); setStatusModal(true); }}
            className="btn btn-white btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]">
            Stage
          </button>
          
          {r.status !== "SELECTED" && r.status !== "REJECTED" && (
            <button onClick={() => { setInterviewForm(f => ({ ...f, candidateId: r.id })); setInterviewModal(true); }}
              className="btn btn-primary btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]">
              <CalendarDays size={12}/> Interview
            </button>
          )}

          {r.status === "INTERVIEW_SCHEDULED" && (
            <button onClick={() => { setFeedbackForm(f => ({ ...f, interviewId: r.id })); setFeedbackModal(true); }} // assuming we map candidate status or find interview. In this MVP, we let them submit by candidateId or look up
              className="btn btn-success btn-xs cursor-pointer py-1 px-2.5 flex items-center gap-1 text-[11px]">
              Feedback
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <TopBar
        title="Recruitment & Pipeline Tracker"
        subtitle="Manage job openings, review candidate resumes, and coordinate interviews"
        isSharedView={true}
        action={
          <div className="flex gap-2">
            <button onClick={() => setJobModal(true)} className="btn btn-primary flex items-center gap-1.5 cursor-pointer">
              <Plus size={16}/> New Job Opening
            </button>
            <button onClick={() => setCandidateModal(true)} className="btn btn-white flex items-center gap-1.5 cursor-pointer">
              <UserPlus size={16}/> Register Candidate
            </button>
          </div>
        }
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-lg shadow-sm px-4">
        {[
          { id: "jobs", label: "Active Jobs", icon: Briefcase },
          { id: "candidates", label: "Candidate Pipelines", icon: ClipboardCheck },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider cursor-pointer border-b-2 transition-all duration-200
                ${active ? "border-[#E8420A] text-[#E8420A] font-bold" : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"}`}>
              <Icon size={14}/>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT */}

      {activeTab === "jobs" && (
        <div className="card">
          {jobs.length === 0 && !loading ? (
            <div className="p-5">
              <EmptyState
                icon={Briefcase}
                title="No active job openings yet"
                desc="Post your first job to start building your candidate pipeline."
                action={
                  <button onClick={() => setJobModal(true)} className="btn btn-primary flex items-center gap-1.5 cursor-pointer">
                    <Plus size={16}/> New Job Opening
                  </button>
                }
              />
            </div>
          ) : (
            <Table
              columns={jobColumns}
              data={jobs}
              loading={loading}
              emptyMsg="No active job vacancies registered."
            />
          )}
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="space-y-6">
          {/* Job Filter selector */}
          <div className="card p-5 flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Job Vacancy:</label>
            <select className="input max-w-xs cursor-pointer text-xs"
              value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
              <option value="">Select a vacancy...</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
              ))}
            </select>
          </div>

          <div className="card">
            {candidates.length === 0 && !loading ? (
              <div className="p-5">
                <EmptyState
                  icon={ClipboardCheck}
                  title="No candidates registered yet"
                  desc="Select a job opening above or register a new candidate to start tracking your recruitment funnel."
                  action={
                    <button onClick={() => setCandidateModal(true)} className="btn btn-primary flex items-center gap-1.5 cursor-pointer">
                      <UserPlus size={16}/> Register Candidate
                    </button>
                  }
                />
              </div>
            ) : (
              <Table
                columns={candidateColumns}
                data={candidates}
                loading={loading}
                emptyMsg="Select a job opening to view applicants or no candidates have applied yet."
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE JOB */}
      <Modal open={jobModal} onClose={() => setJobModal(false)} title="Create New Job Posting">
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title *</label>
              <input type="text" className="input" placeholder="e.g. Senior Java Developer"
                value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
              <select className="input cursor-pointer"
                value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} required>
                <option value="">Select Department</option>
                {["IT", "HR", "Finance", "Marketing", "Sales", "Support"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea className="input h-20" placeholder="Summary of duties and skills..."
              value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Requirements (Comma-separated)</label>
            <input type="text" className="input" placeholder="e.g. Java 17, Spring Boot, MySQL, REST APIs"
              value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Openings</label>
              <input type="number" min="1" className="input"
                value={jobForm.openings} onChange={e => setJobForm({...jobForm, openings: Number(e.target.value)})}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Application Deadline</label>
              <input type="date" className="input cursor-pointer"
                value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})}/>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={() => setJobModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Creating..." : "Post Job Opening"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTER CANDIDATE */}
      <Modal open={candidateModal} onClose={() => setCandidateModal(false)} title="Register Job Candidate">
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Applying For Job Vacancy *</label>
            <select className="input cursor-pointer"
              value={candidateForm.jobPostingId || selectedJobId} 
              onChange={e => setCandidateForm({...candidateForm, jobPostingId: e.target.value})} required>
              <option value="">Select Job Position</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
              <input type="text" className="input" placeholder="e.g. John Doe"
                value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} required/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
              <input type="email" className="input" placeholder="john@example.com"
                value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} required/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <input type="text" className="input" placeholder="+1234567890"
                value={candidateForm.phone} onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Years of Experience</label>
              <input type="number" min="0" step="0.5" className="input"
                value={candidateForm.experienceYears} onChange={e => setCandidateForm({...candidateForm, experienceYears: Number(e.target.value)})}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Resume Link (URL)</label>
            <input type="url" className="input" placeholder="https://drive.google.com/..."
              value={candidateForm.resumeUrl} onChange={e => setCandidateForm({...candidateForm, resumeUrl: e.target.value})}/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Candidate Notes</label>
            <textarea className="input h-16" placeholder="Skills, source, recruiter remarks..."
              value={candidateForm.notes} onChange={e => setCandidateForm({...candidateForm, notes: e.target.value})}/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={() => setCandidateModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Registering..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE PIPELINE STAGE */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Candidate Recruitment Stage">
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <p className="text-sm text-gray-600">
            Move <span className="font-semibold text-gray-900">{selectedCandidate?.name}</span> to a new state in the recruitment funnel.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Recruitment Funnel Stage *</label>
            <select className="input cursor-pointer"
              value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})} required>
              {["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED", "ON_HOLD"].map(st => (
                <option key={st} value={st}>{st.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks / Feedback Notes</label>
            <textarea className="input h-20" placeholder="Log details about candidate progress..."
              value={statusForm.notes} onChange={e => setStatusForm({...statusForm, notes: e.target.value})}/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={() => setStatusModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Updating..." : "Update Pipeline State"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SCHEDULE INTERVIEW */}
      <Modal open={interviewModal} onClose={() => setInterviewModal(false)} title="Schedule Candidate Interview">
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Interviewer (Internal Employee)</label>
            <select className="input cursor-pointer"
              value={interviewForm.interviewerId} onChange={e => setInterviewForm({...interviewForm, interviewerId: e.target.value})}>
              <option value="">Assign Interviewer</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.designation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date & Time *</label>
              <input type="datetime-local" className="input cursor-pointer"
                value={interviewForm.scheduledAt} onChange={e => setInterviewForm({...interviewForm, scheduledAt: e.target.value})} required/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Interview Mode *</label>
              <select className="input cursor-pointer"
                value={interviewForm.mode} onChange={e => setInterviewForm({...interviewForm, mode: e.target.value})} required>
                <option value="ONLINE">Online Video</option>
                <option value="OFFLINE">In-Person Office</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Link (Google Meet/Teams)</label>
            <input type="url" className="input" placeholder="https://meet.google.com/..."
              value={interviewForm.meetingLink} onChange={e => setInterviewForm({...interviewForm, meetingLink: e.target.value})}/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={() => setInterviewModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SUBMIT INTERVIEW FEEDBACK */}
      <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)} title="Record Interview Results & Feedback">
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Interviewer Verdict *</label>
              <select className="input cursor-pointer"
                value={feedbackForm.result} onChange={e => setFeedbackForm({...feedbackForm, result: e.target.value})} required>
                <option value="PASSED">PASSED (Promote to Selected)</option>
                <option value="FAILED">FAILED (Reject Candidate)</option>
                <option value="ON_HOLD">ON_HOLD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Interviewer Rating (1-5 Stars) *</label>
              <input type="number" min="1" max="5" className="input"
                value={feedbackForm.rating} onChange={e => setFeedbackForm({...feedbackForm, rating: Number(e.target.value)})} required/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback / Interview Notes *</label>
            <textarea className="input h-24" placeholder="Detail the technical skills, coding challenge review, and communication strengths..."
              value={feedbackForm.feedback} onChange={e => setFeedbackForm({...feedbackForm, feedback: e.target.value})} required/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" className="btn btn-white cursor-pointer" onClick={() => setFeedbackModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? "Recording..." : "Record Evaluation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
