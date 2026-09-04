import { useState } from "react";
import { Modal, ConfirmDialog } from "./Modal";
import { Check, X as XIcon, MapPin, IndianRupee } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { formatSalary } from "./jobUtils";

const FLOW = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Hired"];

export default function ApplicationDetailModal({ application, onClose }) {
  const { getJob, withdrawApplication, interviews } = useCandidateData();
  const { showToast } = useCandidateToast();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const job = getJob(application.jobId);
  if (!job) return null;

  const isFinal = application.status === "Rejected" || application.status === "Withdrawn";
  const currentIdx = FLOW.indexOf(application.status);
  const relatedInterview = interviews.find((i) => i.applicationId === application.id);

  return (
    <>
      <Modal
        title={job.title}
        subtitle={`${job.company} · Applied ${application.appliedDate}`}
        onClose={onClose}
        width={600}
        footer={
          !isFinal && application.status !== "Hired" ? (
            <>
              <button className="co-danger-button" onClick={() => setConfirmWithdraw(true)}>Withdraw Application</button>
              <button className="primary-button" onClick={onClose}>Close</button>
            </>
          ) : (
            <button className="primary-button" onClick={onClose}>Close</button>
          )
        }
      >
        <div className="co-job-meta" style={{ marginBottom: 20 }}>
          <span><MapPin size={12} /> {job.location}</span>
          <span><IndianRupee size={12} /> {formatSalary(job)}</span>
          <span>{job.type}</span>
        </div>

        {relatedInterview && (
          <div className="interview-card" style={{ marginBottom: 20 }}>
            <div className="interview-icon">📅</div>
            <div className="interview-info">
              <span className="interview-label">{relatedInterview.status === "Scheduled" ? "UPCOMING INTERVIEW" : "INTERVIEW"}</span>
              <h3>{relatedInterview.type}</h3>
              <p>{relatedInterview.date} at {relatedInterview.time} with {relatedInterview.interviewer}</p>
              {relatedInterview.location && (
                <p>{relatedInterview.type === "Video Call" ? "Meeting link: " : "Location: "}{relatedInterview.location}</p>
              )}
            </div>
          </div>
        )}

        <h4 style={{ fontSize: 13, margin: "0 0 14px", color: "var(--co-ink)" }}>Application Timeline</h4>
        <div className="co-timeline">
          {application.history.map((h, i) => {
            const isLast = i === application.history.length - 1;
            const done = !isFinal || i < application.history.length - 1;
            const finalClass = isLast && application.status === "Rejected" ? "co-timeline-final-rejected" : isLast && application.status === "Withdrawn" ? "co-timeline-final-withdrawn" : "";
            return (
              <div key={h.date} className={`co-timeline-item ${done ? "done" : "current"} ${finalClass}`}>
                <div className="co-timeline-marker">
                  <div className="co-timeline-dot">
                    {application.status === "Rejected" && isLast ? <XIcon size={13} /> : <Check size={13} />}
                  </div>
                  {!isLast && <div className="co-timeline-line" />}
                </div>
                <div className="co-timeline-content">
                  <strong>{h.status}</strong>
                  <p>{h.note}</p>
                  <span>{new Date(h.date).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
              </div>
            );
          })}
          {!isFinal && currentIdx < FLOW.length - 1 && (
            <div className="co-timeline-item">
              <div className="co-timeline-marker"><div className="co-timeline-dot">{currentIdx + 2}</div></div>
              <div className="co-timeline-content">
                <strong>{FLOW[currentIdx + 1]}</strong>
                <p>Pending</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {confirmWithdraw && (
        <ConfirmDialog
          title="Withdraw this application?"
          message={`You're about to withdraw your application for ${job.title} at ${job.company}. This can't be undone.`}
          confirmLabel="Withdraw"
          tone="danger"
          onCancel={() => setConfirmWithdraw(false)}
          onConfirm={() => {
            withdrawApplication(application.id);
            setConfirmWithdraw(false);
            showToast("Application withdrawn.", "info");
            onClose();
          }}
        />
      )}
    </>
  );
}
