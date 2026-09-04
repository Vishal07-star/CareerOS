import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  KanbanSquare,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  User,
  Building2,
  BellRing,
} from "lucide-react";

const items = [
  ["Dashboard", "/recruiter/dashboard", LayoutDashboard],
  ["Jobs", "/recruiter/jobs", BriefcaseBusiness],
  ["Applications", "/recruiter/applications", Users],
  ["Pipeline", "/recruiter/candidate-pipeline", KanbanSquare],
  ["Interviews", "/recruiter/interviews", CalendarDays],
  ["Messages", "/recruiter/messages", MessageSquare],
  ["Analytics", "/recruiter/analytics", BarChart3],
  ["Recruiter AI", "/recruiter/ai", Sparkles],
  ["Hiring Alerts", "/recruiter/alerts", BellRing],
  ["My Profile", "/recruiter/profile", User],
  ["Company Profile", "/recruiter/company-profile", Building2],
  ["Settings", "/recruiter/settings", Settings],
];

export default function RecruiterSidebar() {
  return (
    <aside className="recruiter-sidebar open">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Sparkles size={19} />
        </div>

        <div>
          <strong>CareerOS</strong>
          <span>Recruiter</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(([name, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}