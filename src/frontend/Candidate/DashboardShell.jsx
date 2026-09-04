import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { CandidateDataProvider } from "./CandidateDataContext";
import { CandidateToastProvider } from "./CandidateToastContext";
import PlatformBridge from "./PlatformBridge";
import "./CandidateDashboard.css";
import "./CandidatePortal.css";

export default function DashboardShell({ theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CandidateDataProvider>
      <CandidateToastProvider>
        <PlatformBridge />
        <div className="dashboard-layout">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />

          {sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}

          <main className="dashboard-main">
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <div className="dashboard-content">
              <div className="dashboard-page-content">
                <Outlet context={{ theme, onToggleTheme }} />
              </div>
            </div>
          </main>
        </div>
      </CandidateToastProvider>
    </CandidateDataProvider>
  );
}
