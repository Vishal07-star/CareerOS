import React from "react";
import {
  Bell,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecruiterHeader() {
  const navigate = useNavigate();

  return (
    <header className="recruiter-header">
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
        <button
          className="secondary-button"
          onClick={() => navigate("/recruiter/ai")}
        >
          <Sparkles size={15} />
          AI
        </button>

        <button className="notification-button">
          <Bell size={19} />
          <span />
        </button>

        <div
          className="profile-avatar"
          onClick={() => navigate("/recruiter/settings")}
        >
          HR
        </div>
      </div>
    </header>
  );
}