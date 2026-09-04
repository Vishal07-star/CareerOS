import React from "react";
import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import "./Overview.css";
import { useRecruiterData } from "./RecruiterDataContext";

export default function Overview() {
  const data = useRecruiterData();

  const jobs = data.jobs || [];
  const candidates = data.candidates || [];
  const interviews = data.interviews || [];

  const activeJobs = jobs.filter(
    (job) => job.status?.toLowerCase() === "active"
  ).length;

  const shortlisted = candidates.filter((candidate) =>
    ["shortlisted", "interview"].includes(
      candidate.status?.toLowerCase()
    )
  ).length;

  const hired = candidates.filter(
    (candidate) => candidate.status?.toLowerCase() === "hired"
  ).length;

  const upcomingInterviews = interviews
    .filter((item) => item.status !== "cancelled")
    .slice(0, 5);

  const topCandidates = [...candidates]
    .sort(
      (a, b) =>
        Number(b.matchScore || b.aiScore || 0) -
        Number(a.matchScore || a.aiScore || 0)
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: BriefcaseBusiness,
      trend: "+12%",
    },
    {
      title: "Total Candidates",
      value: candidates.length,
      icon: Users,
      trend: "+18%",
    },
    {
      title: "Interviews",
      value: interviews.length,
      icon: CalendarDays,
      trend: "+8%",
    },
    {
      title: "Hired",
      value: hired,
      icon: UserCheck,
      trend: "+15%",
    },
  ];

  return (
    <div className="overview-page">
      <div className="overview-welcome">
        <div>
          <h2>Good morning, Recruiter 👋</h2>
          <p>
            Here's what's happening with your recruitment process today.
          </p>
        </div>

        <div className="ai-status">
          <Sparkles size={17} />
          AI Assistant Active
        </div>
      </div>

      <div className="overview-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="overview-stat-card" key={stat.title}>
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={20} />
                </div>

                <span className="stat-trend">
                  <TrendingUp size={13} />
                  {stat.trend}
                </span>
              </div>

              <strong>{stat.value}</strong>
              <span>{stat.title}</span>
            </div>
          );
        })}
      </div>

      <div className="overview-grid">
        <section className="overview-card pipeline-card">
          <div className="card-heading">
            <div>
              <h3>Recruitment Pipeline</h3>
              <p>Candidate progress across hiring stages.</p>
            </div>

            <ArrowUpRight size={18} />
          </div>

          <div className="pipeline-bars">
            <PipelineRow
              label="Applied"
              count={candidates.filter((c) => c.status === "Applied").length}
              total={candidates.length}
            />

            <PipelineRow
              label="Screening"
              count={
                candidates.filter((c) => c.status === "Screening").length
              }
              total={candidates.length}
            />

            <PipelineRow
              label="Shortlisted"
              count={shortlisted}
              total={candidates.length}
            />

            <PipelineRow
              label="Hired"
              count={hired}
              total={candidates.length}
            />
          </div>
        </section>

        <section className="overview-card">
          <div className="card-heading">
            <div>
              <h3>Upcoming Interviews</h3>
              <p>Your next candidate meetings.</p>
            </div>

            <CalendarDays size={18} />
          </div>

          <div className="interview-list">
            {upcomingInterviews.length === 0 ? (
              <EmptyState text="No upcoming interviews." />
            ) : (
              upcomingInterviews.map((interview, index) => (
                <div className="overview-interview" key={interview.id || index}>
                  <div className="interview-date">
                    <CalendarDays size={16} />
                  </div>

                  <div>
                    <strong>
                      {interview.candidateName ||
                        interview.candidate ||
                        "Candidate"}
                    </strong>

                    <span>
                      {interview.type || interview.round || "Interview"}
                    </span>
                  </div>

                  <small>
                    {interview.time || interview.date || "Scheduled"}
                  </small>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="overview-grid bottom">
        <section className="overview-card">
          <div className="card-heading">
            <div>
              <h3>AI Top Candidates</h3>
              <p>Highest matching candidates.</p>
            </div>

            <Sparkles size={18} />
          </div>

          <div className="candidate-ranking">
            {topCandidates.length === 0 ? (
              <EmptyState text="No candidates available." />
            ) : (
              topCandidates.map((candidate, index) => {
                const score = Number(
                  candidate.matchScore || candidate.aiScore || 0
                );

                return (
                  <div className="ranking-row" key={candidate.id || index}>
                    <div className="rank-number">{index + 1}</div>

                    <div className="ranking-avatar">
                      {(candidate.name || "C").charAt(0)}
                    </div>

                    <div className="ranking-info">
                      <strong>
                        {candidate.name || "Unnamed Candidate"}
                      </strong>
                      <span>
                        {candidate.role ||
                          candidate.position ||
                          "Candidate"}
                      </span>
                    </div>

                    <div className="match-score">
                      {score}%
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="overview-card">
          <div className="card-heading">
            <div>
              <h3>Recent Jobs</h3>
              <p>Latest job openings.</p>
            </div>

            <BriefcaseBusiness size={18} />
          </div>

          <div className="recent-jobs">
            {jobs.slice(0, 5).map((job, index) => (
              <div className="recent-job" key={job.id || index}>
                <div>
                  <strong>{job.title || "Untitled Job"}</strong>
                  <span>
                    {job.department || job.location || "Open Position"}
                  </span>
                </div>

                <span
                  className={`job-status ${
                    job.status?.toLowerCase() === "active"
                      ? "active"
                      : ""
                  }`}
                >
                  {job.status || "Active"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PipelineRow({ label, count, total }) {
  const percentage = total
    ? Math.min(100, Math.round((count / total) * 100))
    : 0;

  return (
    <div className="pipeline-row">
      <div className="pipeline-label">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>

      <div className="pipeline-track">
        <div style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-overview">
      <Clock size={18} />
      {text}
    </div>
  );
}