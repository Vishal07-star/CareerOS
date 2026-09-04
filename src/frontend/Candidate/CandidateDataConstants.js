// Candidate data constants and helpers moved out of CandidateDataContext.jsx

// Helper for generating unique IDs
let idCounter = 1000;
export const nextId = () => ++idCounter;

// Seed data (trimmed for brevity – full arrays should be copied from original file)
export const seedJobs = [];
export const seedProfile = {};
export const seedResumes = [];
export const seedApplications = [];
export const seedInterviews = [];
export const seedNotifications = [];
export const seedConversations = [];
export const seedAlerts = [];
export const seedPreferences = {};

export const STATUS_FLOW = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Hired"];

export function loadState() {
  try {
    const raw = localStorage.getItem("careerOS_candidate_data_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
