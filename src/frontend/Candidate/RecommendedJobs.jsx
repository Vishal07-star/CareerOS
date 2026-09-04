import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, IndianRupee, Bookmark } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import JobDetailsModal from "./JobDetailsModal";
import ApplyModal from "./ApplyModal";
import { computeMatch, formatSalary } from "./jobUtils";

export default function RecommendedJobs() {
  const { jobs, profile, isJobSaved, toggleSaveJob, hasApplied } = useCandidateData();
  const { showToast } = useCandidateToast();
  const navigate = useNavigate();
  const [activeJob, setActiveJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);

  const topJobs = useMemo(
    () => [...jobs].sort((a, b) => computeMatch(b, profile) - computeMatch(a, profile)).slice(0, 3),
    [jobs, profile]
  );

  return (
    <section className="jobs-section">
      <div className="section-heading">
        <div>
          <h2>Recommended Jobs</h2>
          <p>Matched to your profile and skills.</p>
        </div>
        <button className="outline-button" onClick={() => navigate("/candidate/jobs")}>View All Jobs</button>
      </div>

      <div className="jobs-grid">
        {topJobs.map((job) => {
          const saved = isJobSaved(job.id);
          const applied = hasApplied(job.id);
          return (
            <div key={job.id} className="job-card" onClick={() => setActiveJob(job)} style={{ cursor: "pointer" }}>
              <div className="job-card-top">
                <div className="company-logo">{job.companyInitials}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="job-match">{computeMatch(job, profile)}% Match</span>
                  <button
                    className={`co-job-save ${saved ? "saved" : ""}`}
                    style={{ width: 28, height: 28 }}
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); showToast(saved ? "Removed from saved jobs." : "Job saved.", "success"); }}
                  >
                    <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <h3>{job.title}</h3>
              <p className="company-name">{job.company}</p>

              <div className="job-details">
                {job.skills.slice(0, 3).map((s) => <span key={s}>{s}</span>)}
              </div>

              <div className="job-bottom">
                <strong><IndianRupee size={13} style={{ verticalAlign: -2 }} />{formatSalary(job)}</strong>
                <span><MapPin size={12} style={{ verticalAlign: -1 }} /> {job.location}</span>
              </div>

              {applied ? (
                <span className="co-job-applied-pill">Applied ✓</span>
              ) : (
                <button className="apply-button" onClick={(e) => { e.stopPropagation(); setApplyJob(job); }}>Apply Now</button>
              )}
            </div>
          );
        })}
      </div>

      {activeJob && (
        <JobDetailsModal job={activeJob} onClose={() => setActiveJob(null)} onApply={(job) => { setActiveJob(null); setApplyJob(job); }} />
      )}
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </section>
  );
}
