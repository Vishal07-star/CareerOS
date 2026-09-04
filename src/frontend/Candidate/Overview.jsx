import { useNavigate } from "react-router-dom";
import { FileText, Bookmark, CalendarCheck, Award, Check, Briefcase, User, FileUser, Search, Clock, Video, MapPin, ArrowRight } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";

export default function Overview() {
  const navigate = useNavigate();
  const { stats, profile, applications, interviews, getJob } = useCandidateData();

  const upcomingInterviews = applications
    .filter((a) => a.status === "Interview")
    .map((a) => ({
      application: a,
      job: getJob(a.jobId),
      interview: interviews.find(
        (i) => i.applicationId === a.id && i.status === "Scheduled"
      ),
    }))
    .filter((entry) => entry.job);

  const statCards = [
    { title: "Applications Submitted", value: stats.applicationsSubmitted, change: `${stats.inProgress} in progress`, icon: FileText, color: "purple" },
    { title: "Shortlisted", value: stats.shortlisted, change: `${stats.offers} offers`, icon: Award, color: "blue" },
    { title: "Saved Jobs", value: stats.savedJobs, change: "Ready to apply", icon: Bookmark, color: "orange" },
    { title: "Interviews", value: stats.interviewsScheduled, change: "Upcoming", icon: CalendarCheck, color: "green" },
  ];

  const steps = [
    { label: "Profile Created", sub: "Completed", state: "completed" },
    { label: "Skills Added", sub: profile.skills.length ? "Completed" : "Pending", state: profile.skills.length ? "completed" : "" },
    { label: "Apply for Jobs", sub: stats.applicationsSubmitted > 0 ? "In progress" : "Not started", state: stats.applicationsSubmitted > 0 ? "current" : "" },
    { label: "Get Hired", sub: stats.offers > 0 ? "Offer received" : "Pending", state: stats.offers > 0 ? "current" : "" },
  ];

  const quickActions = [
    { label: "Browse Jobs", icon: Search, action: () => navigate("/candidate/jobs") },
    { label: "Edit Profile", icon: User, action: () => navigate("/candidate/profile") },
    { label: "Update Resume", icon: FileUser, action: () => navigate("/candidate/resume") },
    { label: "View Applications", icon: Briefcase, action: () => navigate("/candidate/applications") },
  ];

  return (
    <section className="overview-section">
      <div className="section-heading">
        <div>
          <h2>Overview</h2>
          <p>Track your career progress at a glance.</p>
        </div>
        <button className="outline-button" onClick={() => navigate("/candidate/career-growth")}>View Analytics</button>
      </div>

      <div className="stats-grid">
        {statCards.map(({ title, value, change, icon: Icon, color }) => (
          <div key={title} className="stat-card">
            <div className="stat-top">
              <span className={`stat-icon ${color}`}><Icon size={18} /></span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-title">{title}</div>
            <span className="stat-change">{change}</span>
          </div>
        ))}
      </div>

      {upcomingInterviews.length > 0 && (
        <div className="career-progress" style={{ marginBottom: 20 }}>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15.5 }}>🎉 You're moving forward</h2>
              <p>
                {upcomingInterviews.length === 1
                  ? "You have been selected for an interview."
                  : `You have been selected for ${upcomingInterviews.length} interviews.`}
              </p>
            </div>
          </div>

          {upcomingInterviews.map(({ application, job, interview }) => (
            <div
              key={application.id}
              className="interview-card"
              style={{ marginBottom: 12 }}
            >
              <div className="interview-icon">📅</div>
              <div className="interview-info">
                <span className="interview-label">SELECTED FOR INTERVIEW</span>
                <h3>{job.title} · {job.company}</h3>
                {interview ? (
                  <p style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} /> {interview.date} at {interview.time}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {interview.type === "Video Call" ? <Video size={12} /> : <MapPin size={12} />}
                      {interview.type || "Interview"}
                    </span>
                    {interview.interviewer && <span>with {interview.interviewer}</span>}
                  </p>
                ) : (
                  <p>Your interview is being scheduled — details will appear here once confirmed.</p>
                )}
              </div>
              <button
                className="interview-button"
                style={{ whiteSpace: "nowrap" }}
                onClick={() =>
                  interview
                    ? navigate(`/candidate/interviews?open=${interview.id}`)
                    : navigate("/candidate/interviews")
                }
              >
                View Interview Details <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="profile-completion-card">
        <div className="profile-completion-left">
          <div
            className="completion-circle"
            style={{ background: `conic-gradient(var(--co-violet-600) 0% ${stats.profileCompletion}%, var(--co-violet-100) ${stats.profileCompletion}% 100%)` }}
          >
            <div className="completion-inner">
              <strong>{stats.profileCompletion}%</strong>
              <span>Complete</span>
            </div>
          </div>
          <div className="completion-text">
            <span className="completion-label">PROFILE STRENGTH</span>
            <h3>{stats.profileCompletion >= 90 ? "Your profile looks great!" : "Your profile is looking good!"}</h3>
            <p>Complete a few more sections to improve your visibility to recruiters.</p>
          </div>
        </div>
        <button className="primary-button" onClick={() => navigate("/candidate/profile")}>Complete Profile</button>
      </div>

      <div className="career-progress">
        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15.5 }}>Quick Actions</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {quickActions.map(({ label, icon: Icon, action }) => (
            <button key={label} className="outline-button" style={{ justifyContent: "center", padding: "16px 12px", flexDirection: "column", gap: 8, display: "flex" }} onClick={action}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="career-progress">
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div>
            <h2 style={{ fontSize: 17 }}>Career Progress</h2>
            <p>Your journey toward your next opportunity.</p>
          </div>
        </div>

        <div className="progress-steps">
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: "contents" }}>
              <div className={`progress-step ${step.state}`}>
                <div className="step-number">
                  {step.state === "completed" ? <Check size={15} /> : i + 1}
                </div>
                <div>
                  <strong>{step.label}</strong>
                  <span>{step.sub}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`progress-line ${step.state === "completed" ? "completed-line" : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
