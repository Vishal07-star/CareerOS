import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Pause,
  Play,
  Eye,
  Share2,
  Ban,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import JobWizard from "./JobWizard";
import "./Jobs.css";

const STATUS_TONE = {
  Active: "green",
  Draft: "yellow",
  Paused: "yellow",
  Closed: "red",
  Expired: "red",
};

export default function Jobs({ createMode = false }) {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    duplicateJob,
    setJobStatus,
  } = useRecruiterData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [department, setDepartment] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [remote, setRemote] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [showFilters, setShowFilters] = useState(false);

  const [showWizard, setShowWizard] = useState(createMode);
  const [editing, setEditing] = useState(null);
  const [previewJob, setPreviewJob] = useState(null);
  const [menu, setMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!menu) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menu]);

  const departments = useMemo(
    () => ["All", ...new Set(jobs.map((j) => j.department).filter(Boolean))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let list = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" || job.status === status;
      const matchesDepartment =
        department === "All" || job.department === department;
      const matchesType =
        employmentType === "All" || job.type === employmentType;
      const matchesRemote =
        remote === "All" || (job.remote || "On-site") === remote;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment &&
        matchesType &&
        matchesRemote
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "Newest") return b.id - a.id;
      if (sort === "Oldest") return a.id - b.id;
      if (sort === "Most applicants")
        return (b.applicants || 0) - (a.applicants || 0);
      if (sort === "Fewest applicants")
        return (a.applicants || 0) - (b.applicants || 0);
      if (sort === "Deadline")
        return (a.deadline || "9999").localeCompare(b.deadline || "9999");
      return 0;
    });

    return list;
  }, [jobs, search, status, department, employmentType, remote, sort]);

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setDepartment("All");
    setEmploymentType("All");
    setRemote("All");
    setSort("Newest");
  };

  const hasActiveFilters =
    search || status !== "All" || department !== "All" ||
    employmentType !== "All" || remote !== "All";

  const openCreate = () => {
    setEditing(null);
    setShowWizard(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setShowWizard(true);
    setMenu(null);
  };

  const saveJob = (data) => {
    if (editing) {
      updateJob(editing.id, data);
      showToast("Job updated.", "success");
    } else {
      addJob(data);
      showToast(
        data.status === "Active" ? "Job published." : "Job saved as draft.",
        "success"
      );
    }

    setEditing(null);
    setShowWizard(false);
  };

  const handleStatusChange = (job, next) => {
    setJobStatus(job.id, next);
    setMenu(null);

    const labels = {
      Active:
        job.status === "Paused" || job.status === "Closed"
          ? "Job reopened."
          : "Job published.",
      Draft: "Job unpublished.",
      Paused: "Job paused.",
      Closed: "Job closed.",
    };

    showToast(labels[next] || `Job marked ${next.toLowerCase()}.`, "success");
  };

  const handleShare = (job) => {
    const link = `${window.location.origin}/candidate/jobs?job=${job.id}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }

    showToast("Job link copied to clipboard.", "info");
    setMenu(null);
  };

  const handleDuplicate = (job) => {
    duplicateJob(job.id);
    showToast("Job duplicated as a new draft.", "success");
    setMenu(null);
  };

  const confirmDeleteJob = () => {
    if (!confirmDelete) return;
    deleteJob(confirmDelete.id);
    showToast("Job deleted.", "success");
    setConfirmDelete(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Recruitment</p>
          <h1>Jobs</h1>
          <p className="page-subtitle">
            Create, manage and monitor your job postings.
          </p>
        </div>

        <button className="primary-button" onClick={openCreate}>
          <Plus size={17} />
          Create Job
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by title or department..."
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Paused</option>
          <option>Closed</option>
          <option>Expired</option>
        </select>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filter-bar filter-bar-secondary">
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option>All</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>

          <select value={remote} onChange={(e) => setRemote(e.target.value)}>
            <option value="All">All work styles</option>
            <option>On-site</option>
            <option>Hybrid</option>
            <option>Remote</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Most applicants</option>
            <option>Fewest applicants</option>
            <option>Deadline</option>
          </select>

          {hasActiveFilters && (
            <button type="button" className="text-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <p className="muted-text result-count">
        {filteredJobs.length} job{filteredJobs.length === 1 ? "" : "s"} found
      </p>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs match your filters</h3>
          <p>Try adjusting your search or filters, or create a new job.</p>
          {hasActiveFilters && (
            <button className="secondary-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-header">
                <div className="job-company-icon">{job.title.slice(0, 1)}</div>

                <button
                  className="icon-button"
                  onClick={() => setMenu(menu === job.id ? null : job.id)}
                  aria-label="Job actions"
                >
                  <MoreVertical size={18} />
                </button>

                {menu === job.id && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                      onClick={() => setMenu(null)}
                    />
                    <div className="action-menu">
                    <button onClick={() => setPreviewJob(job)}>
                      <Eye size={15} /> Preview
                    </button>

                    <button onClick={() => openEdit(job)}>
                      <Pencil size={15} /> Edit
                    </button>

                    <button onClick={() => handleDuplicate(job)}>
                      <Copy size={15} /> Duplicate
                    </button>

                    <button onClick={() => handleShare(job)}>
                      <Share2 size={15} /> Share
                    </button>

                    {job.status !== "Active" && job.status !== "Closed" && (
                      <button onClick={() => handleStatusChange(job, "Active")}>
                        <Play size={15} /> Publish
                      </button>
                    )}

                    {job.status === "Active" && (
                      <>
                        <button onClick={() => handleStatusChange(job, "Draft")}>
                          <RotateCcw size={15} /> Unpublish
                        </button>
                        <button onClick={() => handleStatusChange(job, "Paused")}>
                          <Pause size={15} /> Pause
                        </button>
                      </>
                    )}

                    {job.status === "Paused" && (
                      <button onClick={() => handleStatusChange(job, "Active")}>
                        <Play size={15} /> Resume
                      </button>
                    )}

                    {(job.status === "Active" || job.status === "Paused") && (
                      <button onClick={() => handleStatusChange(job, "Closed")}>
                        <Ban size={15} /> Close job
                      </button>
                    )}

                    {(job.status === "Closed" || job.status === "Expired") && (
                      <button onClick={() => handleStatusChange(job, "Active")}>
                        <RotateCcw size={15} /> Reopen
                      </button>
                    )}

                    <button
                      className="danger"
                      onClick={() => {
                        setConfirmDelete(job);
                        setMenu(null);
                      }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                    </div>
                  </>
                )}
              </div>

              <h2>{job.title}</h2>

              <div className="job-meta">
                <span>{job.department}</span>
                <span>{job.location}</span>
                <span>{job.type}</span>
                {job.remote && <span>{job.remote}</span>}
              </div>

              <p className="job-description">
                {job.description || "No job description has been added yet."}
              </p>

              <div className="job-stats">
                <div>
                  <strong>{job.applicants}</strong>
                  <span>Applicants</span>
                </div>

                <div>
                  <strong>{job.shortlistedCount || 0}</strong>
                  <span>Shortlisted</span>
                </div>

                <div>
                  <strong>{job.hiredCount || 0}</strong>
                  <span>Hired</span>
                </div>
              </div>

              <div className="job-footer">
                <span className={`status-badge ${STATUS_TONE[job.status] || "yellow"}`}>
                  {job.status}
                </span>

                <span className="muted-text">{job.posted}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {showWizard && (
        <JobWizard
          job={editing}
          onClose={() => {
            setShowWizard(false);
            setEditing(null);
          }}
          onSave={saveJob}
        />
      )}

      {previewJob && (
        <JobWizard
          job={previewJob}
          initialStep={5}
          onClose={() => setPreviewJob(null)}
          onSave={(data) => {
            updateJob(previewJob.id, data);
            showToast("Job updated.", "success");
            setPreviewJob(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this job?"
          message={`"${confirmDelete.title}" and its applicant data will be permanently removed. This can't be undone.`}
          confirmLabel="Delete job"
          tone="danger"
          onConfirm={confirmDeleteJob}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
