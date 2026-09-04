import { useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard, User, Briefcase, FileText, Calendar,
  FileUser, Sparkles, Bot, MessageSquare, Bell, Settings, LogOut, X, Sparkle,
  Sun, Moon,
} from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/candidate/dashboard" },
  { label: "Profile", icon: User, path: "/candidate/profile" },
  { label: "Find Jobs", icon: Briefcase, path: "/candidate/jobs" },
  { label: "Applications", icon: FileText, path: "/candidate/applications", badgeKey: "applicationsSubmitted" },
  { label: "Interviews", icon: Calendar, path: "/candidate/interviews", badgeKey: "interviewsScheduled" },
  { label: "Resume", icon: FileUser, path: "/candidate/resume" },
  { label: "Career Growth", icon: Sparkles, path: "/candidate/career-growth" },
  { label: "AI Career", icon: Bot, path: "/candidate/ai-career" },
  { label: "Messages", icon: MessageSquare, path: "/candidate/messages", badgeKey: "unreadMessages" },
  { label: "Alerts", icon: Bell, path: "/candidate/alerts" },
];

export default function DashboardSidebar({ isOpen, onClose, theme, onToggleTheme }) {
  const { profile, stats } = useCandidateData();
  const navigate = useNavigate();
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">C</div>
        <div className="sidebar-logo-text">
          <strong>CareerOS</strong>
          <span>Career Management</span>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <button
        className="sidebar-profile"
        style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit" }}
        onClick={() => { navigate("/candidate/profile"); onClose?.(); }}
      >
        <div className="profile-avatar">
          {profile.photo ? <img src={profile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : initials}
        </div>
        <div className="profile-info">
          <strong>{profile.firstName} {profile.lastName}</strong>
          <span>{profile.headline}</span>
        </div>
        <span className="online-dot" />
      </button>

      <div className="sidebar-section">
        <span className="sidebar-label">Main Menu</span>
        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon, path, badgeKey }) => {
            const badgeValue = badgeKey ? stats[badgeKey] : null;
            return (
              <NavLink
                key={label}
                to={path}
                onClick={onClose}
                className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-item-icon"><Icon size={16} /></span>
                <span>{label}</span>
                {!!badgeValue && <span className="sidebar-badge">{badgeValue}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {stats.profileCompletion < 100 && (
          <div className="sidebar-upgrade">
            <span className="upgrade-icon"><Sparkle size={20} /></span>
            <strong>Boost your career</strong>
            <p>Your profile is {stats.profileCompletion}% complete. Finish it for better job matches.</p>
            <button onClick={() => { navigate("/candidate/profile"); onClose?.(); }}>Complete Profile</button>
          </div>
        )}

        <div className="sidebar-section" style={{ paddingTop: 0 }}>
          <nav className="sidebar-nav">
            <NavLink
              to="/candidate/settings"
              onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-item-icon"><Settings size={16} /></span>
              <span>Settings</span>
            </NavLink>
            <button
              type="button"
              className="sidebar-item"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="sidebar-item-icon">
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </span>
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate("/auth")}>
              <span className="sidebar-item-icon"><LogOut size={16} /></span>
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span>CareerOS</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
