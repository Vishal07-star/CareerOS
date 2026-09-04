import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Mail,
  Star,
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

import {
  useRecruiterData,
  PIPELINE_STAGES,
} from "./RecruiterDataContext";
import CandidateDrawer from "./CandidateDrawer";

const stageColors = {
  Applied:   "blue",
  Screening: "yellow",
  Interview: "purple",
  Offer:     "green",
  Hired:     "green",
  Rejected:  "red",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CandidatePipeline() {
  const { candidates, updateCandidateStatus, jobs } = useRecruiterData();

  /* ── Drawer state ──────────────────────────────────────────── */
  const [drawerCandidate, setDrawerCandidate] = useState(null);

  /* ── Filter state ─────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("All");

  /* ── Derived ─────────────────────────────────────────────── */
  const jobTitles = useMemo(
    () => ["All", ...new Set(candidates.map((c) => c.appliedFor).filter(Boolean))],
    [candidates]
  );

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return candidates.filter((c) => {
      if (c.status === "Rejected") return false; // hide rejected from pipeline board
      if (jobFilter !== "All" && c.appliedFor !== jobFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.appliedFor?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [candidates, jobFilter, searchQuery]);

  const moveCandidate = (candidate, direction) => {
    const currentIndex = PIPELINE_STAGES.indexOf(candidate.status);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < PIPELINE_STAGES.length) {
      updateCandidateStatus(candidate.id, PIPELINE_STAGES[nextIndex]);

      // Reflect change in drawer if it's open for this candidate
      if (drawerCandidate?.id === candidate.id) {
        setDrawerCandidate((cur) =>
          cur ? { ...cur, status: PIPELINE_STAGES[nextIndex] } : null
        );
      }
    }
  };

  const hasFilters = searchQuery !== "" || jobFilter !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setJobFilter("All");
  };

  /* Keep drawer candidate in sync when underlying data changes */
  const liveDrawerCandidate = drawerCandidate
    ? candidates.find((c) => c.id === drawerCandidate.id) ?? null
    : null;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">Hiring workflow</p>
            <h1>Candidate Pipeline</h1>
            <p className="page-subtitle">
              Move candidates through every stage of your hiring process.
            </p>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────── */}
        <div className="filter-bar">
          <div className="search-box">
            <Search size={14} />
            <input
              type="search"
              placeholder="Search candidates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search candidates"
            />
          </div>

          <span className="muted-text" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <SlidersHorizontal size={13} /> Filter:
          </span>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            aria-label="Filter by job"
          >
            {jobTitles.map((title) => (
              <option key={title}>{title}</option>
            ))}
          </select>

          {hasFilters && (
            <button className="text-button" onClick={clearFilters} type="button">
              Clear
            </button>
          )}

          <span className="muted-text" style={{ marginLeft: "auto" }}>
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Kanban board ───────────────────────────────────── */}
        <div className="pipeline-board">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter(
              (c) => c.status === stage
            );

            return (
              <section className="pipeline-column" key={stage}>
                <div className="pipeline-column-header">
                  <div>
                    <strong>{stage}</strong>
                    <span className={`pipeline-count tone-${stageColors[stage] || "blue"}`}>
                      {stageCandidates.length}
                    </span>
                  </div>
                  <ChevronDown size={16} />
                </div>

                <div className="pipeline-cards">
                  {stageCandidates.map((candidate) => (
                    <article
                      className="pipeline-card"
                      key={candidate.id}
                      onClick={() => setDrawerCandidate(candidate)}
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open profile for ${candidate.name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDrawerCandidate(candidate);
                        }
                      }}
                    >
                      <div className="pipeline-person">
                        <div className="candidate-avatar">
                          {initials(candidate.name)}
                        </div>

                        <div>
                          <strong>{candidate.name}</strong>
                          <span>{candidate.appliedFor}</span>
                        </div>
                      </div>

                      {/* Star rating */}
                      {candidate.rating > 0 && (
                        <div className="pipeline-rating">
                          <Star size={12} fill="currentColor" />
                          {candidate.rating}
                        </div>
                      )}

                      {/* Skill chips */}
                      {candidate.skills?.length > 0 && (
                        <div className="pipeline-skills">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      )}

                      {/* Footer actions */}
                      <div
                        className="pipeline-card-footer"
                        onClick={(e) => e.stopPropagation()} // prevent card click when using action buttons
                      >
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <a
                            className="row-action"
                            title="Email candidate"
                            aria-label={`Email ${candidate.name}`}
                            href={`mailto:${candidate.email}`}
                          >
                            <Mail size={14} />
                          </a>

                          <button
                            className="row-action"
                            title="Open profile"
                            aria-label={`Open profile for ${candidate.name}`}
                            onClick={() => setDrawerCandidate(candidate)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        <div className="pipeline-move">
                          <button
                            disabled={PIPELINE_STAGES.indexOf(candidate.status) === 0}
                            onClick={() => moveCandidate(candidate, -1)}
                            title="Move back"
                            aria-label={`Move ${candidate.name} back`}
                          >
                            <ArrowLeft size={13} />
                          </button>

                          <button
                            disabled={
                              PIPELINE_STAGES.indexOf(candidate.status) ===
                              PIPELINE_STAGES.length - 1
                            }
                            onClick={() => moveCandidate(candidate, 1)}
                            title="Move forward"
                            aria-label={`Move ${candidate.name} forward`}
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {stageCandidates.length === 0 && (
                    <div className="pipeline-empty">
                      {hasFilters ? "No matches" : "No candidates"}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── CandidateDrawer ────────────────────────────────────── */}
      {liveDrawerCandidate && (
        <CandidateDrawer
          candidate={liveDrawerCandidate}
          onClose={() => setDrawerCandidate(null)}
        />
      )}
    </>
  );
}