import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Bell, ChevronDown, Menu, CheckCheck, Trash2,
  FileText, CalendarCheck, Eye, Briefcase, Clock, MessageSquare, User, Settings, LogOut,
} from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";

const TITLES = {
  dashboard: "Dashboard",
  profile: "Profile",
  jobs: "Find Jobs",
  applications: "My Applications",
  interviews: "Interviews",
  resume: "Resume",
  "career-growth": "Career Growth",
  "ai-career": "AI Career",
  messages: "Messages",
  alerts: "Job Alerts",
  settings: "Settings",
};

const NOTIF_ICON = {
  status: FileText, interview: CalendarCheck, view: Eye, job: Briefcase, deadline: Clock, message: MessageSquare,
};

export default function DashboardHeader({ onMenuClick }) {
  const { profile, notifications, stats, markNotificationRead, markAllNotificationsRead, deleteNotification, timeAgo } = useCandidateData();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const segment = location.pathname.split("/")[2] || "dashboard";
  const title = TITLES[segment] || "Dashboard";
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/candidate/jobs${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-button" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div>
          <span className="breadcrumb">Candidate</span>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="header-right">
        <form onSubmit={submitSearch} className="co-header-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search jobs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div style={{ position: "relative" }} ref={notifRef}>
          <button className="header-icon-button" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
            <Bell size={16} />
            {stats.unreadNotifications > 0 && <span className="notification-dot" />}
          </button>

          {notifOpen && (
            <div className="co-notif-dropdown">
              <div className="co-notif-head">
                <strong>Notifications</strong>
                <button onClick={markAllNotificationsRead}>
                  <CheckCheck size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Mark all read
                </button>
              </div>
              {notifications.length === 0 && <div className="co-notif-empty">You're all caught up.</div>}
              {notifications.map((n) => {
                const Icon = NOTIF_ICON[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    className={`co-notif-item ${!n.read ? "unread" : ""}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <span className="co-notif-icon"><Icon size={15} /></span>
                    <div className="co-notif-body">
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <span>{timeAgo(n.date)}</span>
                    </div>
                    <button
                      className="co-notif-delete"
                      onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="header-divider" />

        <div style={{ position: "relative" }} ref={profileRef}>
          <div className="header-profile" onClick={() => setProfileOpen((v) => !v)}>
            <div className="header-avatar">
              {profile.photo ? <img src={profile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : initials}
            </div>
            <div className="header-profile-info">
              <strong>{profile.firstName} {profile.lastName}</strong>
              <span>Candidate</span>
            </div>
            <ChevronDown size={14} className="header-arrow" />
          </div>

          {profileOpen && (
            <div className="co-notif-dropdown" style={{ width: 210, padding: "6px 0" }}>
              <button className="sidebar-item" style={{ width: "100%", padding: "10px 16px" }} onClick={() => { navigate("/candidate/profile"); setProfileOpen(false); }}>
                <span className="sidebar-item-icon"><User size={15} /></span><span>My Profile</span>
              </button>
              <button className="sidebar-item" style={{ width: "100%", padding: "10px 16px" }} onClick={() => { navigate("/candidate/settings"); setProfileOpen(false); }}>
                <span className="sidebar-item-icon"><Settings size={15} /></span><span>Settings</span>
              </button>
              <button className="sidebar-item" style={{ width: "100%", padding: "10px 16px" }} onClick={() => navigate("/auth")}>
                <span className="sidebar-item-icon"><LogOut size={15} /></span><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
