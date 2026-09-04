import Overview from "./Overview";
import RecommendedJobs from "./RecommendedJobs";
import { useCandidateData } from "./CandidateDataContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CandidateDashboard() {
  const { profile } = useCandidateData();

  return (
    <>
      <div className="welcome-banner">
        <div>
          <span className="welcome-small">👋 {greeting()}</span>
          <h1>Welcome back, <span>{profile.firstName}!</span></h1>
          <p>Here's what's happening with your career today.</p>
        </div>
        <div className="welcome-decoration">
          <div className="decoration-circle circle-one" />
          <div className="decoration-circle circle-two" />
          <div className="decoration-circle circle-three" />
        </div>
      </div>

      <Overview />
      <RecommendedJobs />
    </>
  );
}
