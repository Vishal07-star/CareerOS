import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Star,
  Eye,
  Trash2,
  UserPlus,
} from "lucide-react";

import { useRecruiterData, PIPELINE_STAGES } from "./RecruiterDataContext";
import AddCandidateModal from "./AddCandidateModal";
import CandidateDrawer from "./CandidateDrawer";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";

const statuses = [
  ...PIPELINE_STAGES,
  "Rejected",
];

export default function Candidates() {
  const {
    candidates,
    updateCandidate,
    updateCandidateStatus,
    deleteCandidate,
  } = useRecruiterData();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { showToast } = useToast();

  // Keep drawer in sync: if the underlying candidate updates (stage change, etc.)
  // reflect it immediately rather than showing stale data.
  const liveSelected = selected ? candidates.find((c) => c.id === selected.id) ?? null : null;

  const updateSearch = (value) => {
    setSearch(value);
    setSearchParams(
      (params) => {
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        return params;
      },
      { replace: true }
    );
  };

  const filtered = useMemo(() => {
    return candidates.filter((candidate) => {
      const text = `
        ${candidate.name}
        ${candidate.email}
        ${candidate.appliedFor}
        ${candidate.location}
        ${candidate.skills?.join(" ")}
      `.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        status === "All" || candidate.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, status]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Talent pool</p>
          <h1>Candidates</h1>
          <p className="page-subtitle">
            Search, evaluate and manage your candidates.
          </p>
        </div>

        <button className="primary-button" onClick={() => setShowAdd(true)}>
          <UserPlus size={17} />
          Add Candidate
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search candidates..."
            aria-label="Search candidates"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied For</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Applied</th>
                <th />
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
                    {candidate.experience || 0} years
                  </td>

                  <td>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            updateCandidate(candidate.id, {
                              rating: star,
                            })
                          }
                          className={
                            star <= candidate.rating
                              ? "star active"
                              : "star"
                          }
                        >
                          <Star size={14} fill="currentColor" />
                        </button>
                      ))}
                    </div>
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
                      {statuses.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>

                  <td>{candidate.appliedDate}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="row-action"
                        title="View candidate profile"
                        aria-label={`View profile for ${candidate.name}`}
                        onClick={() => setSelected(candidate)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="row-action danger-action"
                        onClick={() => setConfirmDelete(candidate)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              <UsersEmpty />
              <h3>No candidates found</h3>
              <p>Try changing your search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddCandidateModal onClose={() => setShowAdd(false)} />
      )}

      {liveSelected && (
        <CandidateDrawer
          candidate={liveSelected}
          onClose={() => setSelected(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this candidate?"
          message={`${confirmDelete.name} and their application data will be permanently removed. This can't be undone.`}
          confirmLabel="Delete candidate"
          tone="danger"
          onConfirm={() => {
            deleteCandidate(confirmDelete.id);
            showToast("Candidate deleted.", "success");
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function UsersEmpty() {
  return <UserPlus size={35} />;
}