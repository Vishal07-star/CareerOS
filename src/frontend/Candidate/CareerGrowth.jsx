import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Plus, Trash2, Target, TrendingUp, Award,
  Briefcase, CalendarCheck, FileText, User,
} from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";

/* ── helpers ──────────────────────────────────────────────────── */

const CATEGORY_LABEL = {
  skill:     "Skill",
  project:   "Project",
  interview: "Interview Prep",
  soft:      "Networking",
};

const CATEGORY_COLOR = {
  skill:     "blue",
  project:   "purple",
  interview: "green",
  soft:      "orange",
};

/* Derive a 0-100 readiness score from real profile + activity data */
function computeReadiness({ profileCompletion, applications, resumes, interviews, stats }) {
  let score = 0;
  score += Math.round(profileCompletion * 0.30);                                // 30 pts — profile completeness
  score += Math.min(applications.length * 5, 20);                              // 20 pts — up to 4 apps
  score += resumes.length > 0 ? 15 : 0;                                        // 15 pts — resume uploaded
  score += stats.interviewsScheduled > 0 ? 15 : 0;                            // 15 pts — at least 1 interview
  score += (stats.shortlisted > 0 || stats.offers > 0) ? 10 : 0;              // 10 pts — shortlisted/offer
  score += Math.min((stats.offers + stats.interviewsScheduled) * 5, 10);       // 10 pts — depth of pipeline
  return Math.min(score, 100);
}

/* Build dynamic roadmap steps from real profile/application state */
function buildRoadmap({ profile, resumes, applications, interviews, stats }) {
  return [
    {
      id: "profile",
      label: "Complete Profile",
      sub: profile.headline && profile.bio ? "Completed" : "Add headline & bio",
      done: !!(profile.headline && profile.bio),
    },
    {
      id: "skills",
      label: "Add 3+ Skills",
      sub: profile.skills.length >= 3 ? "Completed" : `${profile.skills.length} / 3 added`,
      done: profile.skills.length >= 3,
    },
    {
      id: "resume",
      label: "Upload Resume",
      sub: resumes.length > 0 ? "Completed" : "No resume yet",
      done: resumes.length > 0,
    },
    {
      id: "apply",
      label: "Apply for Jobs",
      sub: applications.length > 0 ? `${applications.length} application${applications.length > 1 ? "s" : ""} submitted` : "Not started",
      done: applications.length > 0,
      current: applications.length === 0,
    },
    {
      id: "interview",
      label: "Land an Interview",
      sub: interviews.length > 0 ? "Achieved" : "Pending",
      done: interviews.length > 0,
      current: applications.length > 0 && interviews.length === 0,
    },
    {
      id: "offer",
      label: "Receive an Offer",
      sub: stats.offers > 0 ? `${stats.offers} offer${stats.offers > 1 ? "s" : ""} received` : "Pending",
      done: stats.offers > 0,
    },
  ];
}

/* ── Component ────────────────────────────────────────────────── */

export default function CareerGrowth() {
  const navigate = useNavigate();
  const { showToast } = useCandidateToast();

  const {
    profile, resumes, applications, interviews, stats,
    profileCompletion, careerGoals, toggleCareerGoal, addCareerGoal, removeCareerGoal,
  } = useCandidateData();

  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("skill");
  const [showAddGoal, setShowAddGoal] = useState(false);

  const readiness = useMemo(
    () => computeReadiness({ profileCompletion, applications, resumes, interviews, stats }),
    [profileCompletion, applications, resumes, interviews, stats]
  );

  const roadmap = useMemo(
    () => buildRoadmap({ profile, resumes, applications, interviews, stats }),
    [profile, resumes, applications, interviews, stats]
  );

  const doneGoals = careerGoals.filter((g) => g.done).length;
  const totalGoals = careerGoals.length;

  const handleToggleGoal = (goal) => {
    toggleCareerGoal(goal.id);
    if (!goal.done) {
      showToast(`"${goal.label}" marked as complete! 🎉`, "success");
    }
  };

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    addCareerGoal(newGoalText.trim(), newGoalCategory);
    showToast(`Goal added: "${newGoalText.trim()}"`, "success");
    setNewGoalText("");
    setShowAddGoal(false);
  };

  const handleRemoveGoal = (goal) => {
    removeCareerGoal(goal.id);
    showToast(`Goal removed.`, "info");
  };

  return (
    <div className="career-growth-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="career-growth-header">
        <div>
          <span className="page-eyebrow">CAREER DEVELOPMENT</span>
          <h2>Career Growth</h2>
          <p>Your personalized plan to reach your next career goal.</p>
        </div>
      </div>

      {/* ── Career Readiness ────────────────────────────────────── */}
      <div className="career-growth-card target-career-card">
        <div className="target-career-content">
          <div>
            <span className="card-label">Career Readiness</span>
            <h3>{profile.currentPosition || "Professional"}</h3>
            <p>
              {readiness >= 80
                ? "You're highly job-ready. Keep applying and stay active."
                : readiness >= 50
                ? "Good progress. Complete your profile and apply to more roles."
                : "Keep building — upload a resume and start applying."}
            </p>
          </div>

          <div className="readiness-score">
            <div
              className="score-number"
              style={{
                color: readiness >= 75 ? "#16a34a" : readiness >= 50 ? "#d97706" : "#dc2626",
              }}
            >
              {readiness}%
            </div>
            <span>Readiness Score</span>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${readiness}%`,
              background:
                readiness >= 75
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : readiness >= 50
                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                  : "linear-gradient(90deg, #f87171, #dc2626)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* ── Live stat strip ─────────────────────────────────────── */}
      <div className="cg-stats-strip">
        {[
          { icon: Briefcase,      label: "Applications", value: stats.applicationsSubmitted },
          { icon: CalendarCheck,  label: "Interviews",   value: stats.interviewsScheduled },
          { icon: Award,          label: "Offers",       value: stats.offers },
          { icon: FileText,       label: "Resume",       value: resumes.length > 0 ? "Uploaded" : "Missing" },
          { icon: User,           label: "Profile",      value: `${profileCompletion}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="cg-stat">
            <Icon size={16} />
            <span className="cg-stat-value">{value}</span>
            <span className="cg-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Roadmap + Goals ─────────────────────────────────────── */}
      <div className="career-growth-grid">

        {/* Career Roadmap — driven by real state */}
        <div className="career-growth-card">
          <div className="card-header">
            <div>
              <h3>Your Career Roadmap</h3>
              <p>Steps toward your next role — auto-updated from your activity.</p>
            </div>
          </div>

          <div className="roadmap">
            {roadmap.map((step, i) => (
              <div key={step.id}>
                <div
                  className={`roadmap-item ${step.done ? "completed" : ""} ${
                    step.current ? "active" : ""
                  }`}
                >
                  <div className="roadmap-icon">
                    {step.done ? <Check size={13} /> : i + 1}
                  </div>
                  <div>
                    <strong>{step.label}</strong>
                    <span
                      className={
                        step.done
                          ? "priority"
                          : step.current
                          ? "priority high"
                          : undefined
                      }
                    >
                      {step.sub}
                    </span>
                  </div>
                </div>
                {i < roadmap.length - 1 && <div className="roadmap-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* Career Goals — persisted in context */}
        <div className="career-growth-card">
          <div className="card-header">
            <div>
              <h3>Career Goals</h3>
              <p>
                {doneGoals} of {totalGoals} completed
              </p>
            </div>
            <button
              className="outline-button"
              onClick={() => setShowAddGoal((v) => !v)}
            >
              <Plus size={14} /> Add Goal
            </button>
          </div>

          {showAddGoal && (
            <div className="cg-add-goal-form">
              <input
                autoFocus
                placeholder="e.g. Learn TypeScript..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
              />
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
              >
                {Object.entries(CATEGORY_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button className="primary-button" onClick={handleAddGoal}>
                Save
              </button>
              <button className="secondary-button" onClick={() => setShowAddGoal(false)}>
                Cancel
              </button>
            </div>
          )}

          <div className="action-list">
            {careerGoals.map((goal) => (
              <div key={goal.id} className={`action-item ${goal.done ? "action-done" : ""}`}>
                <button
                  className={`goal-check ${goal.done ? "goal-check--done" : ""}`}
                  onClick={() => handleToggleGoal(goal)}
                  aria-label={goal.done ? "Mark incomplete" : "Mark complete"}
                  title={goal.done ? "Mark incomplete" : "Mark complete"}
                >
                  {goal.done && <Check size={11} />}
                </button>

                <div className="action-content">
                  <strong style={{ textDecoration: goal.done ? "line-through" : "none" }}>
                    {goal.label}
                  </strong>
                  <span>
                    <span className={`cg-category-chip ${CATEGORY_COLOR[goal.category] || "blue"}`}>
                      {CATEGORY_LABEL[goal.category] || goal.category}
                    </span>
                    {goal.doneDate && (
                      <span style={{ marginLeft: 6, opacity: 0.55, fontSize: 12 }}>
                        Done {new Date(goal.doneDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </span>
                </div>

                <button
                  className="icon-button danger"
                  onClick={() => handleRemoveGoal(goal)}
                  aria-label={`Remove goal: ${goal.label}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {careerGoals.length === 0 && (
              <p className="muted-text" style={{ textAlign: "center", padding: "20px 0" }}>
                No goals yet. Add one above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Career Progress strip (live stats) ──────────────────── */}
      <div className="career-growth-card progress-card">
        <div className="card-header">
          <div>
            <h3>Career Progress</h3>
            <p>Live metrics from your profile and job activity.</p>
          </div>
          <div className="growth-indicator">
            <TrendingUp size={15} />
            {readiness}%
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat">
            <span>Readiness Score</span>
            <strong>{readiness}%</strong>
          </div>
          <div className="progress-stat">
            <span>Applications</span>
            <strong>{stats.applicationsSubmitted}</strong>
          </div>
          <div className="progress-stat">
            <span>Interviews</span>
            <strong>{stats.interviewsScheduled}</strong>
          </div>
          <div className="progress-stat">
            <span>Goals Done</span>
            <strong>{doneGoals} / {totalGoals}</strong>
          </div>
          <div className="progress-stat">
            <span>Shortlisted</span>
            <strong>{stats.shortlisted}</strong>
          </div>
          <div className="progress-stat">
            <span>Profile</span>
            <strong>{profileCompletion}%</strong>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="career-growth-card">
        <div className="card-header">
          <div>
            <h3>Quick Actions</h3>
            <p>Jump to the areas that will move your career forward.</p>
          </div>
        </div>
        <div className="quick-actions-grid">
          {[
            { label: "Browse Jobs",       icon: Briefcase,     to: "/candidate/jobs" },
            { label: "Update Resume",     icon: FileText,      to: "/candidate/resume" },
            { label: "Edit Profile",      icon: User,          to: "/candidate/profile" },
            { label: "View Interviews",   icon: CalendarCheck, to: "/candidate/interviews" },
          ].map(({ label, icon: Icon, to }) => (
            <button
              key={label}
              className="quick-action-card"
              onClick={() => navigate(to)}
            >
              <span className="qa-icon"><Icon size={18} /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}