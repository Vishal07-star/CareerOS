import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  BriefcaseBusiness,
  Clock,
  Percent,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";

const STAGE_TONE = {
  Applied: "blue",
  Screening: "amber",
  Interview: "purple",
  Offer: "teal",
  Hired: "green",
};

const STATUS_TONE = {
  Active: "green",
  Draft: "yellow",
  Paused: "yellow",
  Closed: "red",
  Expired: "red",
};

const DATE_RANGES = {
  "All time": null,
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 90 days": 90,
};

export default function Analytics() {
  const { jobs, candidates, interviews, stats } = useRecruiterData();

  const [range, setRange] = useState("All time");
  const [department, setDepartment] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");
  const [now] = useState(() => Date.now());

  const departments = useMemo(
    () => ["All", ...new Set(jobs.map((j) => j.department).filter(Boolean))],
    [jobs]
  );

  const filteredCandidates = useMemo(() => {
    const days = DATE_RANGES[range];
    const cutoff = days ? now - days * 86400000 : null;

    return candidates.filter((candidate) => {
      const matchesDepartment =
        department === "All" || candidate.department === department;
      const matchesJob =
        jobFilter === "All" || candidate.appliedFor === jobFilter;
      const matchesDate =
        !cutoff || new Date(candidate.appliedDate).getTime() >= cutoff;

      return matchesDepartment && matchesJob && matchesDate;
    });
  }, [candidates, department, jobFilter, range, now]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) => department === "All" || job.department === department
      ),
    [jobs, department]
  );

  const stageData = ["Applied", "Screening", "Interview", "Offer", "Hired"].map(
    (stage) => ({
      stage,
      count: filteredCandidates.filter((c) => c.status === stage).length,
    })
  );

  const maxStage = Math.max(...stageData.map((item) => item.count), 1);

  const departmentData = filteredJobs.reduce((acc, job) => {
    acc[job.department] = (acc[job.department] || 0) + Number(job.applicants || 0);
    return acc;
  }, {});
  const maxDepartment = Math.max(...Object.values(departmentData), 1);

  const totalConsidered = filteredCandidates.length || 1;
  const hiredCount = filteredCandidates.filter((c) => c.status === "Hired").length;
  const offerOrHired = filteredCandidates.filter(
    (c) => c.status === "Offer" || c.status === "Hired"
  ).length;
  const interviewedOrLater = filteredCandidates.filter((c) =>
    ["Interview", "Offer", "Hired"].includes(c.status)
  ).length;

  const conversionRate = Math.round((hiredCount / totalConsidered) * 100);
  const interviewConversion = Math.round(
    (interviewedOrLater / totalConsidered) * 100
  );
  const offerAcceptanceRate = offerOrHired
    ? Math.round((hiredCount / offerOrHired) * 100)
    : 0;

  const avgTimeToHire = useMemo(() => {
    const hired = filteredCandidates.filter((c) => c.status === "Hired");
    if (hired.length === 0) return null;

    const totalDays = hired.reduce((sum, c) => {
      const applied = new Date(c.appliedDate).getTime();
      const days = Math.max(1, Math.round((now - applied) / 86400000));
      return sum + days;
    }, 0);

    return Math.round(totalDays / hired.length);
  }, [filteredCandidates, now]);

  const clearFilters = () => {
    setRange("All time");
    setDepartment("All");
    setJobFilter("All");
  };

  const hasActiveFilters =
    range !== "All time" || department !== "All" || jobFilter !== "All";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Recruitment intelligence</p>
          <h1>Analytics</h1>
          <p className="page-subtitle">
            Understand your hiring funnel and recruitment performance.
          </p>
        </div>
      </div>

      <div className="filter-bar analytics-filter-bar">
        <span
          className="muted-text"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <SlidersHorizontal size={14} /> Filters:
        </span>

        <select value={range} onChange={(e) => setRange(e.target.value)}>
          {Object.keys(DATE_RANGES).map((label) => (
            <option key={label}>{label}</option>
          ))}
        </select>

        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="All">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id}>{job.title}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" className="text-button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div className="stats-grid fade-in-panel">
        <Metric
          icon={Users}
          tone="indigo"
          label="Applicants"
          value={filteredCandidates.length}
          detail={`${stats.totalApplicants} total across all filters`}
        />

        <Metric
          icon={BriefcaseBusiness}
          tone="blue"
          label="Active Jobs"
          value={filteredJobs.filter((j) => j.status === "Active").length}
          detail={`${filteredJobs.length} jobs in view`}
        />

        <Metric
          icon={Percent}
          tone="purple"
          label="Conversion Rate"
          value={`${conversionRate}%`}
          detail="Applicants → hired"
        />

        <Metric
          icon={UserCheck}
          tone="green"
          label="Offer Acceptance"
          value={offerOrHired ? `${offerAcceptanceRate}%` : "—"}
          detail="Offers → hired"
        />

        <Metric
          icon={TrendingUp}
          tone="amber"
          label="Interview Rate"
          value={`${interviewConversion}%`}
          detail="Applicants reaching interview+"
        />

        <Metric
          icon={Clock}
          tone="red"
          label="Avg. Time to Hire"
          value={avgTimeToHire !== null ? `${avgTimeToHire}d` : "—"}
          detail={`${interviews.length} interviews total`}
        />
      </div>

      <div className="analytics-grid">
        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Hiring Funnel</h2>
              <p>Candidate distribution by stage</p>
            </div>
          </div>

          <div className="funnel-chart">
            {stageData.map((item) => (
              <div className="funnel-row" key={item.stage}>
                <div className="funnel-label">
                  <span>{item.stage}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="funnel-track">
                  <div
                    className={`funnel-fill tone-${STAGE_TONE[item.stage]}`}
                    style={{
                      width: `${Math.max(
                        (item.count / maxStage) * 100,
                        item.count ? 8 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="empty-state small">
                <h3>No candidates match these filters</h3>
                <p>Try a different date range, department or job.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel fade-in-panel">
          <div className="panel-header">
            <div>
              <h2>Applicants by Department</h2>
              <p>Where candidate volume is highest</p>
            </div>
          </div>

          <div className="department-list">
            {Object.entries(departmentData).map(([dept, count]) => (
              <div className="department-row" key={dept}>
                <div>
                  <strong>{dept}</strong>
                  <span>{count} applicants</span>
                </div>

                <div className="department-progress">
                  <div
                    style={{
                      width: `${Math.max((count / maxDepartment) * 100, count ? 4 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {Object.keys(departmentData).length === 0 && (
              <div className="empty-state small">
                <h3>No jobs in view</h3>
                <p>Adjust the department filter to see data.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="panel fade-in-panel">
        <div className="panel-header">
          <div>
            <h2>Job Performance</h2>
            <p>Applicant-to-view conversion for every job</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Views</th>
                <th>Applicants</th>
                <th>Conversion</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => {
                const conversion = job.views
                  ? Math.round((job.applicants / job.views) * 100)
                  : 0;

                return (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.views}</td>
                    <td>{job.applicants}</td>
                    <td>{conversion}%</td>
                    <td>
                      <span className={`status-badge ${STATUS_TONE[job.status] || "blue"}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredJobs.length === 0 && (
            <div className="empty-state small">
              <h3>No jobs match this department</h3>
              <p>Clear filters to see all job performance.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone = "blue" }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon tone-${tone}`}>
          <Icon size={19} />
        </div>
      </div>

      <strong className="stat-value">{value}</strong>
      <span className="stat-label">{label}</span>
      <small className="stat-trend">{detail}</small>
    </div>
  );
}
