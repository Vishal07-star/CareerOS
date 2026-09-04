import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./frontend/page/Auth";
import RoleSelection from "./frontend/page/RoleSelection";
import RecruiterVerification from "./frontend/page/RecruiterVerification";
import { useTheme } from "./frontend/hooks/useTheme";

/* =========================
   CANDIDATE
========================= */

import DashboardShell from "./frontend/Candidate/DashboardShell";
import CandidateDashboard from "./frontend/Candidate/CandidateDashboard";
import Profile from "./frontend/Candidate/Profile";
import Applications from "./frontend/Candidate/Applications";
import JobsBoard from "./frontend/Candidate/JobsBoard";
import CandidateInterviews from "./frontend/Candidate/Interviews";
import Resume from "./frontend/Candidate/Resume";
import CareerGrowth from "./frontend/Candidate/CareerGrowth";
import AICareer from "./frontend/Candidate/AICareer";
import Messages from "./frontend/Candidate/Messages";
import Alerts from "./frontend/Candidate/Alerts";
import CandidateSettings from "./frontend/Candidate/Settings";

/* =========================
   RECRUITER
========================= */

import RecruiterDashboardShell from "./frontend/Recruiter/RecruiterDashboardShell";
import RecruiterDashboard from "./frontend/Recruiter/RecruiterDashboard";
import Jobs from "./frontend/Recruiter/Jobs";
import RecruiterInterviews from "./frontend/Recruiter/Interviews";
import Candidates from "./frontend/Recruiter/Candidates";
import RecruiterApplications from "./frontend/Recruiter/Applications";
import CandidatePipeline from "./frontend/Recruiter/CandidatePipeline";
import MessagesPage from "./frontend/Recruiter/Messages";
import Analytics from "./frontend/Recruiter/Analytics";
import Settings from "./frontend/Recruiter/Settings";
import RecruiterProfile from "./frontend/Recruiter/RecruiterProfile";
import CompanyProfile from "./frontend/Recruiter/CompanyProfile";
import HiringAlerts from "./frontend/Recruiter/HiringAlerts";
import AskRecruiterAI from "./frontend/Recruiter/AskRecruiterAI";
import { RecruiterDataProvider } from "./frontend/Recruiter/RecruiterDataContext";

export default function App() {
  // Single, canonical theme instance for the whole app (both dashboards).
  // See src/frontend/hooks/useTheme.js — this replaces the two previously
  // competing implementations (an unused hook keyed on "theme", and an
  // inline copy inside RecruiterDashboardShell keyed on "careeros-theme").
  const [theme, setTheme, toggleTheme] = useTheme();

  return (
    <RecruiterDataProvider>
      <Routes>

        {/* =========================
            PUBLIC
        ========================= */}

        <Route path="/auth" element={<Auth />} />

        <Route
          path="/role-selection"
          element={<RoleSelection />}
        />

        <Route
          path="/recruiter/verification"
          element={<RecruiterVerification />}
        />

        {/* =========================
            RECRUITER
        ========================= */}

        <Route
          path="/recruiter"
          element={
            <RecruiterDashboardShell
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<RecruiterDashboard />}
          />

          {/* Jobs */}
          <Route
            path="jobs"
            element={<Jobs />}
          />

          <Route
            path="jobs/create"
            element={<Jobs createMode />}
          />

          {/* Candidates */}
          <Route
            path="candidates"
            element={<Candidates />}
          />

          {/* Applications */}
          <Route
            path="applications"
            element={<RecruiterApplications />}
          />

          {/* Candidate Pipeline */}
          <Route
            path="candidate-pipeline"
            element={<CandidatePipeline />}
          />

          {/* Interviews */}
          <Route
            path="interviews"
            element={<RecruiterInterviews />}
          />

          <Route
            path="interviews/create"
            element={<RecruiterInterviews createMode />}
          />

          {/* Messages */}
          <Route
            path="messages"
            element={<MessagesPage />}
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={<Analytics />}
          />

          {/* AI Recruiter */}
          <Route
            path="ai-assistant"
            element={<AskRecruiterAI />}
          />

          <Route
            path="ask-recruiter-ai"
            element={<AskRecruiterAI />}
          />

          {/* Alias used by header/quick-action shortcuts across the app */}
          <Route
            path="ai"
            element={<AskRecruiterAI />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

          {/* Profile pages */}
          <Route
            path="profile"
            element={<RecruiterProfile />}
          />

          <Route
            path="company-profile"
            element={<CompanyProfile />}
          />

          <Route
            path="alerts"
            element={<HiringAlerts />}
          />
        </Route>

        {/* =========================
            CANDIDATE
        ========================= */}

        <Route
          path="/candidate"
          element={
            <DashboardShell theme={theme} onToggleTheme={toggleTheme} />
          }
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<CandidateDashboard />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="applications"
            element={<Applications />}
          />

          <Route
            path="jobs"
            element={<JobsBoard />}
          />

          <Route
            path="interviews"
            element={<CandidateInterviews />}
          />

          <Route
            path="resume"
            element={<Resume />}
          />

          <Route
            path="career-growth"
            element={<CareerGrowth />}
          />

          <Route
            path="ai-career"
            element={<AICareer />}
          />

          <Route
            path="messages"
            element={<Messages />}
          />

          <Route
            path="alerts"
            element={<Alerts />}
          />

          <Route
            path="settings"
            element={<CandidateSettings />}
          />
        </Route>

        {/* =========================
            DEFAULT
        ========================= */}

        <Route
          path="/"
          element={<Navigate to="/auth" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/auth" replace />}
        />

      </Routes>
    </RecruiterDataProvider>
  );
}