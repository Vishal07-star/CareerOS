import { useState } from "react";
import { Modal, ConfirmDialog } from "./Modal";
import { MapPin, IndianRupee, Clock, Briefcase, Bookmark, Share2, Flag, CheckCircle2 } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { formatSalary, formatPosted } from "./jobUtils";

export default function JobDetailsModal({ job, onClose, onApply }) {
  const { isJobSaved, toggleSaveJob, hasApplied } = useCandidateData();
  const { showToast } = useCandidateToast();
  const [reportOpen, setReportOpen] = useState(false);
  const saved = isJobSaved(job.id);
  const applied = hasApplied(job.id);

  const handleShare = async () => {
    const url = `${window.location.origin}/candidate/jobs?job=${job.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Job link copied to clipboard.", "success");
    } catch {
      showToast("Couldn't copy link.", "error");
    }
  };

  return (
    <>
      <Modal onClose={onClose} width={640}>
        <div className="co-job-detail-head">
          <div className="co-job-detail-logo">{job.companyInitials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 3px" }}>{job.title}</h2>
            <p style={{ margin: 0, color: "var(--co-violet-700)", fontWeight: 700, fontSize: 13.5 }}>{job.company}</p>
          </div>
        </div>

        <div className="co-job-meta" style={{ marginTop: 16 }}>
          <span><MapPin size={12} /> {job.location} · {job.locationType}</span>
          <span><Briefcase size={12} /> {job.type}</span>
          <span><IndianRupee size={12} /> {formatSalary(job)}</span>
          <span><Clock size={12} /> {formatPosted(job.postedDaysAgo)}</span>
          <span>{job.experienceLevel} level</span>
        </div>

        <div className="co-job-detail-actions">
          {applied ? (
            <span className="co-job-applied-pill" style={{ flex: "none", padding: "11px 20px" }}>
              <CheckCircle2 size={15} /> Applied
            </span>
          ) : (
            <button className="primary-button" onClick={() => onApply(job)}>Apply Now</button>
          )}
          <button className={`co-icon-button ${saved ? "active" : ""}`} onClick={() => { toggleSaveJob(job.id); showToast(saved ? "Removed from saved jobs." : "Job saved.", "success"); }} aria-label="Save job">
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
          <button className="co-icon-button" onClick={handleShare} aria-label="Share job">
            <Share2 size={17} />
          </button>
          <button className="co-icon-button" onClick={() => setReportOpen(true)} aria-label="Report job">
            <Flag size={17} />
          </button>
        </div>

        <div className="co-job-detail-section">
          <h4>Job Description</h4>
          <p>{job.description}</p>
        </div>

        <div className="co-job-detail-section">
          <h4>Responsibilities</h4>
          <ul>{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>

        <div className="co-job-detail-section">
          <h4>Requirements</h4>
          <ul>{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>

        <div className="co-job-detail-section">
          <h4>Skills</h4>
          <div className="co-job-skills">{job.skills.map((s) => <span key={s}>{s}</span>)}</div>
        </div>

        <div className="co-job-detail-section">
          <h4>Benefits</h4>
          <ul>{job.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>

        <div className="co-job-detail-section">
          <h4>About {job.company}</h4>
          <p>{job.companyInfo}</p>
        </div>

        <div className="co-job-detail-section" style={{ display: "flex", gap: 24, color: "var(--co-ink-faint)", fontSize: 12 }}>
          <span>Posted {formatPosted(job.postedDaysAgo)}</span>
          <span>Application deadline in {job.deadlineDays} days</span>
          <span>{job.applicants} applicants</span>
        </div>
      </Modal>

      {reportOpen && (
        <ConfirmDialog
          title="Report this job?"
          message="Let us know if this listing looks suspicious, expired, or violates our guidelines. Our team will review it shortly."
          confirmLabel="Report Job"
          tone="danger"
          onCancel={() => setReportOpen(false)}
          onConfirm={() => { setReportOpen(false); showToast("Thanks — this job has been reported.", "info"); }}
        />
      )}
    </>
  );
}
