import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  KanbanSquare,
  Users,
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  X,
  LogOut,
  CalendarClock,
  Briefcase,
  UserPlus2,
  CheckCircle2,
} from "lucide-react";

import "./RecruiterDashboard.css";
import { ToastProvider } from "./ToastContext";
import { useRecruiterData } from "./RecruiterDataContext";

const notificationIcon = {
  interview: CalendarClock,
  job: Briefcase,
  candidate: UserPlus2,
  offer: CheckCircle2,
  general: Bell,
};

function notificationTimeAgo(iso) {
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

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/recruiter/dashboard",
  },
  {
    name: "Jobs",
    icon: BriefcaseBusiness,
    path: "/recruiter/jobs",
  },
  {
    name: "Applications",
    icon: Users,
    path: "/recruiter/applications",
  },
  {
    name: "Pipeline",
    icon: KanbanSquare,
    path: "/recruiter/candidate-pipeline",
  },
  {
    name: "Interviews",
    icon: CalendarDays,
    path: "/recruiter/interviews",
  },
  {
    name: "Messages",
    icon: MessageSquare,
    path: "/recruiter/messages",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/recruiter/analytics",
  },
  {
    name: "Recruiter AI",
    icon: Sparkles,
    path: "/recruiter/ai",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/recruiter/settings",
  },
];

function RecruiterDashboardShellInner({ theme, onToggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dark = theme === "dark";
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigate = useNavigate();

  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRecruiterData();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const logout = () => {
    navigate("/auth");
  };

  const openNotification = (notification) => {
    markNotificationRead(notification.id);

    if (notification.type === "interview") {
      navigate("/recruiter/interviews");
    } else if (notification.type === "job") {
      navigate("/recruiter/jobs");
    } else {
      navigate("/recruiter/candidates");
    }

    setNotificationsOpen(false);
  };

  return (
    <div className="recruiter-app">
      <aside className={`recruiter-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Sparkles size={19} />
          </div>

          {sidebarOpen && (
            <div>
              <strong>CareerOS</strong>
              <span>Recruiter</span>
            </div>
          )}

          <button
            className="icon-button sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={19} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                title={!sidebarOpen ? item.name : ""}
                onClick={() => {
                  if (window.innerWidth < 900) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <Icon size={19} />

                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="sidebar-link"
            onClick={onToggleTheme}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
            {sidebarOpen && <span>{dark ? "Light mode" : "Dark mode"}</span>}
          </button>

          <button className="sidebar-link logout" onClick={logout}>
            <LogOut size={19} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="recruiter-main">
        <header className="recruiter-header">
          <button
            className="mobile-menu icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>

          <div className="global-search">
            <Search size={18} />

            <input
              placeholder="Search candidates, jobs, skills..."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(
                    `/recruiter/candidates?search=${encodeURIComponent(
                      event.currentTarget.value
                    )}`
                  );
                }
              }}
            />
          </div>

          <div className="header-actions">
            <div style={{ position: "relative" }}>
              <button
                className="notification-button"
                onClick={() => setNotificationsOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && <span />}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 50,
                    }}
                    onClick={() => setNotificationsOpen(false)}
                  />

                  <div className="notification-panel">
                    <div className="notification-panel-header">
                      <strong>Notifications</strong>

                      {unreadCount > 0 && (
                        <button
                          className="text-button"
                          onClick={markAllNotificationsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 && (
                      <div className="notification-empty">
                        You're all caught up.
                      </div>
                    )}

                    {notifications.map((notification) => {
                      const Icon =
                        notificationIcon[notification.type] || Bell;

                      return (
                        <button
                          key={notification.id}
                          className={`notification-item ${
                            notification.read ? "" : "unread"
                          }`}
                          onClick={() => openNotification(notification)}
                        >
                          {!notification.read && (
                            <span className="notification-dot" />
                          )}

                          <Icon
                            size={16}
                            className="muted-icon"
                            style={{ marginTop: 2 }}
                          />

                          <div>
                            <strong style={{ display: "block", fontSize: 13 }}>
                              {notification.title}
                            </strong>
                            <p>{notification.message}</p>
                            <small>
                              {notificationTimeAgo(notification.time)}
                            </small>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div
              className="profile-chip"
              onClick={() => navigate("/recruiter/settings")}
            >
              <div className="profile-avatar">HR</div>

              <div className="profile-info">
                <strong>HR Manager</strong>
                <small>Recruiter</small>
              </div>
            </div>
          </div>
        </header>

        <section className="recruiter-content">
          <Outlet context={{ theme, onToggleTheme }} />
        </section>
      </main>
    </div>
  );
}

export default function RecruiterDashboardShell({ theme, onToggleTheme }) {
  return (
    <ToastProvider>
      <RecruiterDashboardShellInner theme={theme} onToggleTheme={onToggleTheme} />
    </ToastProvider>
  );
}