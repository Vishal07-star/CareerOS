import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  UserCheck,
  Plus,
  Sparkles,
  ChevronRight,
  Search,
  Bookmark,
  BookmarkCheck,
  Eye,
  UserPlus,
  CalendarPlus,
  BarChart3,
  XCircle,
  RotateCcw,
  Pause,
  Star,
  Activity,
  Briefcase,
  UserX,
} from "lucide-react";

import { useRecruiterData, PIPELINE_STAGES } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import CandidateDrawer from "./CandidateDrawer";
import AddCandidateModal from "./AddCandidateModal";
import ConfirmDialog from "./ConfirmDialog";

const statusClass = {
  Applied: "blue",
  Screening: "yellow",
  Interview: "purple",
  Offer: "green",
  Hired: "green",
  Rejected: "red",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const stageTone = {
  Applied: "blue",
  Screening: "amber",
  Interview: "purple",
  Offer: "teal",
  Hired: "green",
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    jobs,
    candidates,
    interviews,
    activity,
    stats,
    toggleShortlist,
    toggleJobStatus,
    cancelInterview,
    logActivity,
    addNotification,
  } = useRecruiterData();

  const [activeCandidate, setActiveCandidate] = useState(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [stageFilter, setStageFilter] = useState(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const recentCandidates = useMemo(() => {
    let list = [...candidates].sort(
      (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)
    );

    if (stageFilter) {
      list = list.filter((c) => c.status === stageFilter);
    }

    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      list = list.filter((c) =>
        `${c.name} ${c.appliedFor} ${c.skills?.join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [candidates, stageFilter, quickSearch]);

  const shortlisted = useMemo(
    () => candidates.filter((c) => c.shortlisted),
    [candidates]
  );

  const upcoming = useMemo(
    () =>
      interviews
        .filter(
          (item) => item.status === "Scheduled" || item.status === "Pending"
        )
        .slice(0, 5),
    [interviews]
  );

  const pipelineCounts = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => ({
        stage,
        count: candidates.filter((c) => c.status === stage).length,
      })),
    [candidates]
  );

  const maxStageCount = Math.max(...pipelineCounts.map((s) => s.count), 1);

  const topJob = useMemo(() => {
    const active = jobs.filter((j) => j.status === "Active");
    if (active.length === 0) return null;
    return active.reduce((best, job) =>
      job.applicants > (best?.applicants || 0) ? job : best
    , active[0]);
  }, [jobs]);

  const handleToggleShortlist = (candidate) => {
    toggleShortlist(candidate.id);
    showToast(
      candidate.shortlisted
        ? `Removed ${candidate.name} from shortlist.`
        : `${candidate.name} added to shortlist.`,
      "success"
    );
  };

  const handleJobStatusToggle = (job) => {
    toggleJobStatus(job.id);
    const nextStatus = job.status === "Active" ? "Closed" : "Active";
    logActivity(`${job.title} was marked ${nextStatus}.`, "job");
    showToast(`${job.title} is now ${nextStatus}.`, "success");
  };

  const confirmCancelInterview = () => {
    if (!cancelTarget) return;
    cancelInterview(cancelTarget.id);
    addNotification({
      type: "interview",
      title: "Interview cancelled",
      message: `${cancelTarget.candidate}'s interview was cancelled.`,
    });
    showToast(`Cancelled interview with ${cancelTarget.candidate}.`, "info");
    setCancelTarget(null);
  };

  return (
    <div className="page-container">
      <div className="dashboard-hero fade-in-panel">
        <div>
          <div className="dashboard-hero-main">
            <div className="dashboard-hero-avatar">HR</div>
            <div>
              <p className="dashboard-hero-eyebrow">Recruiter workspace · CareerOS</p>
              <h1>{greeting()}, HR Manager 👋</h1>
              <p className="dashboard-hero-subtitle">
                Here is what is happening with your hiring pipeline today.
              </p>
            </div>
          </div>

          <div className="dashboard-hero-summary">
            <span className="dashboard-hero-chip">
              <BriefcaseBusiness size={13} /> {stats.activeJobs} active job{stats.activeJobs === 1 ? "" : "s"}
            </span>
            <span className="dashboard-hero-chip">
              <Users size={13} /> {stats.newApplicants} new applicant{stats.newApplicants === 1 ? "" : "s"}
            </span>
            <span className="dashboard-hero-chip">
              <CalendarDays size={13} /> {stats.upcomingInterviews} interview{stats.upcomingInterviews === 1 ? "" : "s"} upcoming
            </span>
          </div>
        </div>

        <div className="dashboard-hero-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/recruiter/ai")}
          >
            <Sparkles size={17} />
            Ask Recruiter AI
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("/recruiter/jobs/create")}
          >
            <Plus size={17} />
            Post a Job
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <section className="quick-actions-row fade-in-panel">
        <button
          className="quick-action-card"
          onClick={() => navigate("/recruiter/jobs/create")}
        >
          <span className="quick-action-icon blue">
            <Briefcase size={18} />
          </span>
          <div>
            <strong>Post a job</strong>
            <span>Publish a new opening</span>
          </div>
        </button>

        <button
          className="quick-action-card"
          onClick={() => setShowAddCandidate(true)}
        >
          <span className="quick-action-icon purple">
            <UserPlus size={18} />
          </span>
          <div>
            <strong>Add candidate</strong>
            <span>Manually add to talent pool</span>
          </div>
        </button>

        <button
          className="quick-action-card"
          onClick={() => navigate("/recruiter/interviews/create")}
        >
          <span className="quick-action-icon yellow">
            <CalendarPlus size={18} />
          </span>
          <div>
            <strong>Schedule interview</strong>
            <span>Book a new interview slot</span>
          </div>
        </button>

        <button
          className="quick-action-card"
          onClick={() => navigate("/recruiter/analytics")}
        >
          <span className="quick-action-icon green">
            <BarChart3 size={18} />
          </span>
          <div>
            <strong>View analytics</strong>
            <span>Full hiring performance</span>
          </div>
        </button>
      </section>

      <div className="stats-grid fade-in-panel">
        <StatCard
          icon={BriefcaseBusiness}
          tone="blue"
          label="Active Jobs"
          value={stats.activeJobs}
          trend={`${stats.totalJobs} total jobs`}
          onClick={() => navigate("/recruiter/jobs")}
        />

        <StatCard
          icon={Users}
          tone="indigo"
          label="Applicants"
          value={stats.totalApplicants}
          trend={`${stats.newApplicants} new`}
          onClick={() => navigate("/recruiter/applications")}
        />

        <StatCard
          icon={Bookmark}
          tone="purple"
          label="Shortlisted"
          value={stats.shortlisted}
          trend="Ready for review"
          onClick={() => navigate("/recruiter/candidate-pipeline")}
        />

        <StatCard
          icon={CalendarDays}
          tone="amber"
          label="Interviews"
          value={stats.upcomingInterviews}
          trend="Upcoming"
          onClick={() => navigate("/recruiter/interviews")}
        />

        <StatCard
          icon={UserCheck}
          tone="green"
          label="Hired"
          value={stats.hired}
          trend={`${stats.offers} pending offers`}
          onClick={() => navigate("/recruiter/candidates")}
        />

        <StatCard
          icon={UserX}
          tone="red"
          label="Rejected"
          value={stats.rejected}
          trend="This cycle"
          onClick={() => navigate("/recruiter/candidates")}
        />
      </div>

      {/* Quick candidate search */}
      <section className="panel fade-in-panel">
        <div className="panel-header">
          <div>
            <h2>Quick Candidate Search</h2>
            <p>Search your talent pool without leaving the dashboard</p>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("/recruiter/candidates")}
          >
            Open full view <ChevronRight size={15} />
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={quickSearch}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setVisibleCount(5);
              }}
              placeholder="Search by name, role or skill..."
            />
          </div>

          <select
            className="inline-select"
            value={stageFilter || "All"}
            onChange={(e) => {
              setStageFilter(e.target.value === "All" ? null : e.target.value);
              setVisibleCount(5);
            }}
          >
            <option>All</option>
            {PIPELINE_STAGES.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
            <option>Rejected</option>
          </select>
        </div>

        <div className="candidate-list">
          {recentCandidates.slice(0, visibleCount).map((candidate) => (
            <div className="candidate-row" key={candidate.id}>
              <button
                className="candidate-avatar as-button"
                onClick={() => setActiveCandidate(candidate)}
                aria-label={`View ${candidate.name}`}
              >
                {initials(candidate.name)}
              </button>

              <button
                className="candidate-main as-button"
                onClick={() => setActiveCandidate(candidate)}
              >
                <strong>{candidate.name}</strong>
                <span>
                  {candidate.appliedFor} · {candidate.experience || 0}y exp
                </span>
              </button>

              <span className={`status-badge ${statusClass[candidate.status] || "blue"}`}>
                {candidate.status}
              </span>

              <button
                className={`row-action ${candidate.shortlisted ? "row-action-active" : ""}`}
                title={candidate.shortlisted ? "Remove from shortlist" : "Shortlist candidate"}
                onClick={() => handleToggleShortlist(candidate)}
              >
                {candidate.shortlisted ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>

              <button
                className="row-action"
                title="View profile"
                onClick={() => setActiveCandidate(candidate)}
              >
                <Eye size={16} />
              </button>
            </div>
          ))}

          {recentCandidates.length === 0 && (
            <div className="empty-state small">
              <Users size={28} />
              <h3>No matching candidates</h3>
              <p>Try a different search term or filter.</p>
            </div>
          )}
        </div>

        {recentCandidates.length > visibleCount && (
          <button
            className="secondary-button load-more"
            onClick={() => setVisibleCount((v) => v + 5)}
          >
            Load more ({recentCandidates.length - visibleCount} remaining)
          </button>
        )}
      </section>

      <div className="dashboard-grid fade-in-panel">
        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Shortlisted Candidates</h2>
              <p>Your top picks ready for the next step</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/recruiter/candidate-pipeline")}
            >
              Open pipeline <ChevronRight size={15} />
            </button>
          </div>

          <div className="candidate-list">
            {shortlisted.slice(0, 5).map((candidate) => (
              <div className="candidate-row" key={candidate.id}>
                <button
                  className="candidate-avatar as-button"
                  onClick={() => setActiveCandidate(candidate)}
                >
                  {initials(candidate.name)}
                </button>

                <button
                  className="candidate-main as-button"
                  onClick={() => setActiveCandidate(candidate)}
                >
                  <strong>{candidate.name}</strong>
                  <span>{candidate.appliedFor}</span>
                </button>

                <div className="rating small">
                  <Star size={13} fill="currentColor" />
                  {candidate.rating || "—"}
                </div>

                <button
                  className="row-action"
                  title="Remove from shortlist"
                  onClick={() => handleToggleShortlist(candidate)}
                >
                  <BookmarkCheck size={16} />
                </button>
              </div>
            ))}

            {shortlisted.length === 0 && (
              <div className="empty-state small">
                <Bookmark size={28} />
                <h3>No shortlisted candidates yet</h3>
                <p>Shortlist candidates from the search above.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Upcoming Interviews</h2>
              <p>Next scheduled recruiter activities</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/recruiter/interviews")}
            >
              View all <ChevronRight size={15} />
            </button>
          </div>

          <div className="interview-list">
            {upcoming.map((item) => (
              <div className="interview-row" key={item.id}>
                <div className="date-box">
                  <CalendarDays size={17} />
                </div>

                <div className="interview-main">
                  <strong>{item.candidate}</strong>
                  <span>{item.job}</span>
                  <small>
                    {item.date} · {item.time}
                  </small>
                </div>

                <button
                  className="row-action"
                  title="Cancel interview"
                  onClick={() => setCancelTarget(item)}
                >
                  <XCircle size={16} />
                </button>

                <button
                  className="row-action"
                  title="Manage in Interviews"
                  onClick={() => navigate("/recruiter/interviews")}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="empty-state small">
                <CalendarDays size={28} />
                <h3>Nothing scheduled</h3>
                <p>Schedule an interview to see it here.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-grid fade-in-panel">
        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Hiring Pipeline</h2>
              <p>Click a stage to filter candidates above</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/recruiter/candidate-pipeline")}
            >
              Full board <ChevronRight size={15} />
            </button>
          </div>

          <div className="funnel-chart">
            {pipelineCounts.map((item) => (
              <button
                key={item.stage}
                className={`funnel-row as-button ${
                  stageFilter === item.stage ? "funnel-row-active" : ""
                }`}
                onClick={() => {
                  setStageFilter(
                    stageFilter === item.stage ? null : item.stage
                  );
                  setVisibleCount(5);
                }}
              >
                <div className="funnel-label">
                  <span>{item.stage}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="funnel-track">
                  <div
                    className={`funnel-fill tone-${stageTone[item.stage] || "blue"}`}
                    style={{
                      width: `${(item.count / maxStageCount) * 100}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Recruiter Activity</h2>
              <p>What has changed recently</p>
            </div>
          </div>

          <ul className="activity-feed">
            {activity.slice(0, 6).map((item) => (
              <li key={item.id} className="activity-item">
                <span className={`activity-dot activity-${item.type}`}>
                  <Activity size={12} />
                </span>

                <div>
                  <p>{item.text}</p>
                  <small>{timeAgo(item.time)}</small>
                </div>
              </li>
            ))}

            {activity.length === 0 && (
              <div className="empty-state small">
                <Activity size={28} />
                <h3>No recent activity</h3>
                <p>Actions you take will show up here.</p>
              </div>
            )}
          </ul>
        </section>
      </div>

      <section className="panel fade-in-panel">
        <div className="panel-header">
          <div>
            <h2>Active Job Postings</h2>
            <p>How your active jobs are performing</p>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("/recruiter/jobs")}
          >
            Manage jobs <ChevronRight size={15} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Department</th>
                <th>Applicants</th>
                <th>Views</th>
                <th>Conversion</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {jobs
                .filter((job) => job.status === "Active")
                .slice(0, 6)
                .map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.department}</td>
                    <td>{job.applicants}</td>
                    <td>{job.views}</td>
                    <td>
                      {job.views
                        ? `${Math.round((job.applicants / job.views) * 100)}%`
                        : "0%"}
                    </td>
                    <td>
                      <span className="status-badge green">Active</span>
                    </td>
                    <td>
                      <button
                        className="row-action"
                        title="Pause job"
                        onClick={() => handleJobStatusToggle(job)}
                      >
                        <Pause size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {jobs.filter((job) => job.status === "Active").length === 0 && (
            <div className="empty-state small">
              <BriefcaseBusiness size={28} />
              <h3>No active job postings</h3>
              <p>Post a job to start receiving applicants.</p>
            </div>
          )}

          {jobs.some((job) => job.status !== "Active") && (
            <div className="paused-jobs-note">
              <span>
                {jobs.filter((job) => job.status !== "Active").length} job(s)
                paused, closed or in draft.
              </span>
              <button
                className="text-button"
                onClick={() => navigate("/recruiter/jobs")}
              >
                Review <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="ai-insight fade-in-panel">
        <div className="ai-insight-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <strong>AI Recruitment Insight</strong>
          <p>
            {topJob
              ? `${topJob.title} has the highest applicant volume (${topJob.applicants} applicants). Consider prioritizing the strongest candidates for screening this week.`
              : "Post a job to start receiving AI-powered hiring insights."}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/recruiter/ai")}
        >
          Analyze with AI
        </button>
      </div>

      {activeCandidate && (
        <CandidateDrawer
          candidate={
            candidates.find((c) => c.id === activeCandidate.id) ||
            activeCandidate
          }
          onClose={() => setActiveCandidate(null)}
        />
      )}

      {showAddCandidate && (
        <AddCandidateModal onClose={() => setShowAddCandidate(false)} />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this interview?"
          message={`This will cancel the interview with ${cancelTarget.candidate} for ${cancelTarget.job}. You can reschedule later from the Interviews page.`}
          confirmLabel="Cancel interview"
          onConfirm={confirmCancelInterview}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, tone = "blue", onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={onClick ? { cursor: "pointer" } : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="stat-card-top">
        <div className={`stat-icon tone-${tone}`}>
          <Icon size={20} />
        </div>
      </div>

      <strong className="stat-value">{value}</strong>
      <span className="stat-label">{label}</span>
      <small className="stat-trend">{trend}</small>
    </div>
  );
}
