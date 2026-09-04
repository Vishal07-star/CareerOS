import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  ArrowRight,
  Star,
  Eye,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import CandidateDrawer from "./CandidateDrawer";

const stages = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

export default function Applications() {
  const {
    candidates,
    updateCandidateStatus,
    rejectCandidate,
    toggleShortlist,
  } = useRecruiterData();
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [job, setJob] = useState("All");
  const [confirmReject, setConfirmReject] = useState(null);
  const [selected, setSelected] = useState(null);

  // Always show latest candidate data in the drawer even after a stage change
  const liveSelected = selected
    ? candidates.find((c) => c.id === selected.id) ?? null
    : null;

  const jobs = [
    "All",
    ...new Set(candidates.map((candidate) => candidate.appliedFor)),
  ];

  const filtered = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = `
        ${candidate.name}
        ${candidate.email}
      `
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesJob =
        job === "All" || candidate.appliedFor === job;

      return matchesSearch && matchesJob;
    });
  }, [candidates, search, job]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Applicant management</p>
          <h1>Applications</h1>
          <p className="page-subtitle">
            Review applications and decide who moves forward.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applicants"
          />
        </div>

        <select
          value={job}
          onChange={(e) => setJob(e.target.value)}
        >
          {jobs.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Rating</th>
                <th>Current Stage</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <div className="person-cell">
                      <div className="candidate-avatar">
                        {candidate.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{candidate.appliedFor}</td>

                  <td>
                    <span className="rating-number">
                      <Star size={14} fill="currentColor" />
                      {candidate.rating || "—"}
                    </span>
                  </td>

                  <td>
                    <select
                      className="inline-select"
                      value={candidate.status}
                      onChange={(e) =>
                        updateCandidateStatus(
                          candidate.id,
                          e.target.value
                        )
                      }
                    >
                      {stages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </td>

                  <td>{candidate.appliedDate}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        title="View profile"
                        aria-label={`View profile for ${candidate.name}`}
                        className="row-action"
                        onClick={() => setSelected(candidate)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title={candidate.shortlisted ? "Remove from shortlist" : "Shortlist"}
                        aria-label={candidate.shortlisted ? `Remove ${candidate.name} from shortlist` : `Shortlist ${candidate.name}`}
                        className={`row-action${candidate.shortlisted ? " row-action-active" : ""}`}
                        onClick={() => {
                          toggleShortlist(candidate.id);
                          showToast(
                            candidate.shortlisted
                              ? `${candidate.name} removed from shortlist.`
                              : `${candidate.name} shortlisted.`,
                            "success"
                          );
                        }}
                      >
                        <Star size={16} fill={candidate.shortlisted ? "currentColor" : "none"} />
                      </button>

                      <button
                        title="Reject"
                        aria-label={`Reject ${candidate.name}`}
                        className="row-action danger-action"
                        onClick={() => setConfirmReject(candidate)}
                      >
                        <X size={16} />
                      </button>

                      <button
                        title="Advance to Screening"
                        aria-label={`Advance ${candidate.name} to Screening stage`}
                        className="row-action"
                        onClick={() => {
                          updateCandidateStatus(candidate.id, "Screening");
                          showToast(`${candidate.name} moved to Screening.`, "success");
                        }}
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              <h3>No applications found</h3>
              <p>Try changing your search or job filter.</p>
            </div>
          )}
        </div>
      </div>

      {confirmReject && (
        <ConfirmDialog
          title="Reject this applicant?"
          message={`${confirmReject.name} will be moved to Rejected. This can be undone later from the Candidates page.`}
          confirmLabel="Reject applicant"
          tone="danger"
          onConfirm={() => {
            rejectCandidate(confirmReject.id);
            showToast(`${confirmReject.name} was rejected.`, "info");
            setConfirmReject(null);
          }}
          onCancel={() => setConfirmReject(null)}
        />
      )}

      {liveSelected && (
        <CandidateDrawer
          candidate={liveSelected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}