import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  const handleCandidate = () => {
    navigate("/candidate/dashboard");
  };

  const handleRecruiter = () => {
    navigate("/recruiter/verification");
  };

  return (
    <div className="role-page">
      <div className="role-container">

        <div className="role-header">
          <div className="role-logo">
            <span>CO</span>
          </div>

          <h1>
            Welcome to <span>CareerOS</span>
          </h1>

          <p>
            Choose how you want to use CareerOS
          </p>
        </div>

        <div className="role-cards">

          {/* Candidate */}
          <div
            className="role-card candidate-card"
            onClick={handleCandidate}
            role="button"
            tabIndex={0}
            aria-label="Continue as Candidate"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCandidate();
              }
            }}
          >
            <div className="role-icon">
              👨‍💻
            </div>

            <h2>Candidate</h2>

            <p>
              Find your dream job, build your skills,
              and grow your career.
            </p>

            <button type="button">
              Continue as Candidate →
            </button>
          </div>

          {/* Recruiter */}
          <div
            className="role-card recruiter-card"
            onClick={handleRecruiter}
            role="button"
            tabIndex={0}
            aria-label="Continue as Recruiter"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRecruiter();
              }
            }}
          >
            <div className="role-icon">
              🏢
            </div>

            <h2>Recruiter</h2>

            <p>
              Find talented candidates and build
              your perfect team.
            </p>

            <button type="button">
              Continue as Recruiter →
            </button>
          </div>

        </div>

        <div className="role-footer">
          <p>
            You can change your role later from your account settings.
          </p>
        </div>

      </div>
    </div>
  );
}

export default RoleSelection;