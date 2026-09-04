import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

// eslint-disable-next-line react-refresh/only-export-components
const CandidateDataContext = createContext(null);
// Bumped v1 → v2 so any browser with old John Doe seed data auto-clears.
const STORAGE_KEY = "careerOS_candidate_data_v2";

let idCounter = 1000;
const nextId = () => ++idCounter;

/* =========================================================
   SEED DATA
   ========================================================= */

const seedJobs = [
  {
    id: 1, title: "Frontend Developer", company: "ABC Technologies", companyInitials: "AT",
    location: "Bangalore", locationType: "Hybrid", type: "Full-time", experienceLevel: "Mid",
    department: "Engineering", salaryMin: 8, salaryMax: 12, postedDaysAgo: 1, deadlineDays: 20,
    skills: ["React", "JavaScript", "Node.js", "CSS"], applicants: 64,
    description: "ABC Technologies is looking for a Frontend Developer to build fast, accessible web experiences for our product suite used by thousands of businesses.",
    responsibilities: ["Build and maintain UI features in React", "Collaborate with designers to implement pixel-perfect interfaces", "Optimize applications for performance", "Write clean, tested, reusable code"],
    requirements: ["2-4 years of experience with React", "Strong grasp of JavaScript, HTML & CSS", "Experience with REST APIs", "Good communication skills"],
    benefits: ["Health insurance", "Flexible working hours", "Remote-friendly", "Annual learning budget"],
    companyInfo: "ABC Technologies builds SaaS tools for growing businesses. 200+ employees, HQ in Bangalore.",
  },
  {
    id: 2, title: "UI/UX Designer", company: "Nova Labs", companyInitials: "NL",
    location: "Remote", locationType: "Remote", type: "Full-time", experienceLevel: "Mid",
    department: "Design", salaryMin: 6, salaryMax: 10, postedDaysAgo: 2, deadlineDays: 15,
    skills: ["Figma", "Design Systems", "Prototyping"], applicants: 41,
    description: "Nova Labs is seeking a thoughtful UI/UX Designer to craft delightful, usable experiences across our web and mobile products.",
    responsibilities: ["Design end-to-end user flows and interfaces", "Maintain and evolve our design system", "Run usability tests", "Partner closely with engineering"],
    requirements: ["3+ years of product design experience", "Strong Figma skills", "A portfolio demonstrating UX thinking"],
    benefits: ["Remote-first culture", "Health insurance", "Design tool stipend"],
    companyInfo: "Nova Labs is a fully remote design-led product studio.",
  },
  {
    id: 3, title: "Full Stack Engineer", company: "Bright Path", companyInitials: "BP",
    location: "Pune", locationType: "On-site", type: "Full-time", experienceLevel: "Senior",
    department: "Engineering", salaryMin: 10, salaryMax: 15, postedDaysAgo: 3, deadlineDays: 25,
    skills: ["React", "Node.js", "AWS", "PostgreSQL"], applicants: 88,
    description: "Bright Path needs a Full Stack Engineer to own features end-to-end across our React frontend and Node backend.",
    responsibilities: ["Ship features across the stack", "Design scalable APIs", "Mentor junior engineers", "Participate in on-call rotation"],
    requirements: ["4+ years full stack experience", "Strong Node.js and React skills", "AWS experience preferred"],
    benefits: ["ESOPs", "Health insurance", "Relocation assistance"],
    companyInfo: "Bright Path builds fintech infrastructure for SMEs across India.",
  },
  {
    id: 4, title: "React Native Developer", company: "TechNova", companyInitials: "TN",
    location: "Chennai", locationType: "Hybrid", type: "Full-time", experienceLevel: "Mid",
    department: "Engineering", salaryMin: 9, salaryMax: 13, postedDaysAgo: 5, deadlineDays: 18,
    skills: ["React Native", "TypeScript", "Redux"], applicants: 52,
    description: "TechNova is hiring a React Native Developer to build cross-platform mobile experiences for our fast-growing app.",
    responsibilities: ["Build features in React Native", "Work closely with product and design", "Improve app performance and stability"],
    requirements: ["2+ years React Native experience", "Comfortable with TypeScript", "Published apps a plus"],
    benefits: ["Health insurance", "Hybrid work", "Performance bonus"],
    companyInfo: "TechNova builds consumer mobile apps with over 5M downloads.",
  },
  {
    id: 5, title: "Product Manager", company: "CloudWorks", companyInitials: "CW",
    location: "Bangalore", locationType: "On-site", type: "Full-time", experienceLevel: "Senior",
    department: "Product", salaryMin: 18, salaryMax: 25, postedDaysAgo: 4, deadlineDays: 22,
    skills: ["Product Strategy", "Agile", "Analytics"], applicants: 37,
    description: "CloudWorks is looking for a Product Manager to drive roadmap and strategy for our core platform.",
    responsibilities: ["Own product roadmap", "Work with engineering and design", "Analyze user data to inform decisions"],
    requirements: ["4+ years in product management", "Experience with B2B SaaS", "Strong analytical skills"],
    benefits: ["ESOPs", "Health insurance", "Annual offsite"],
    companyInfo: "CloudWorks provides cloud infrastructure tooling for enterprises.",
  },
  {
    id: 6, title: "UI Developer (Intern)", company: "InnovateLabs", companyInitials: "IL",
    location: "Remote", locationType: "Remote", type: "Internship", experienceLevel: "Entry",
    department: "Engineering", salaryMin: 2, salaryMax: 3, postedDaysAgo: 6, deadlineDays: 10,
    skills: ["HTML", "CSS", "JavaScript"], applicants: 120,
    description: "Kickstart your career as a UI Developer Intern building real product features alongside a senior engineering team.",
    responsibilities: ["Assist in building UI components", "Fix bugs and write tests", "Learn from senior engineers"],
    requirements: ["Basic knowledge of HTML/CSS/JS", "Eagerness to learn", "Currently pursuing or recently completed a degree"],
    benefits: ["Stipend", "Mentorship", "Certificate of completion"],
    companyInfo: "InnovateLabs is an early-stage startup building developer tools.",
  },
  {
    id: 7, title: "Backend Engineer", company: "DigitalCore", companyInitials: "DC",
    location: "Hyderabad", locationType: "Hybrid", type: "Full-time", experienceLevel: "Mid",
    department: "Engineering", salaryMin: 11, salaryMax: 16, postedDaysAgo: 8, deadlineDays: 14,
    skills: ["Node.js", "Python", "PostgreSQL", "Docker"], applicants: 76,
    description: "DigitalCore needs a Backend Engineer to design and scale APIs powering our logistics platform.",
    responsibilities: ["Design and build backend services", "Optimize database performance", "Maintain CI/CD pipelines"],
    requirements: ["3+ years backend experience", "Strong SQL fundamentals", "Experience with containerized deployments"],
    benefits: ["Health insurance", "Hybrid work", "Learning budget"],
    companyInfo: "DigitalCore powers logistics for e-commerce companies across Asia.",
  },
  {
    id: 8, title: "Data Analyst", company: "Quantify", companyInitials: "QF",
    location: "Mumbai", locationType: "On-site", type: "Full-time", experienceLevel: "Entry",
    department: "Data", salaryMin: 6, salaryMax: 9, postedDaysAgo: 10, deadlineDays: 12,
    skills: ["SQL", "Excel", "Python", "Tableau"], applicants: 95,
    description: "Quantify is hiring a Data Analyst to turn raw data into actionable business insights.",
    responsibilities: ["Build dashboards and reports", "Analyze trends across business metrics", "Partner with stakeholders on data requests"],
    requirements: ["Strong SQL skills", "Familiarity with a BI tool", "Detail-oriented"],
    benefits: ["Health insurance", "Performance bonus"],
    companyInfo: "Quantify helps retailers make data-driven decisions.",
  },
  {
    id: 9, title: "DevOps Engineer", company: "Bright Path", companyInitials: "BP",
    location: "Remote", locationType: "Remote", type: "Full-time", experienceLevel: "Senior",
    department: "Engineering", salaryMin: 14, salaryMax: 20, postedDaysAgo: 12, deadlineDays: 9,
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"], applicants: 29,
    description: "Bright Path is looking for a DevOps Engineer to own our cloud infrastructure and deployment pipelines.",
    responsibilities: ["Manage cloud infrastructure on AWS", "Build and maintain CI/CD pipelines", "Improve system reliability and observability"],
    requirements: ["4+ years DevOps/SRE experience", "Strong Kubernetes and Terraform skills"],
    benefits: ["ESOPs", "Remote-first", "Health insurance"],
    companyInfo: "Bright Path builds fintech infrastructure for SMEs across India.",
  },
  {
    id: 10, title: "Junior Frontend Developer", company: "PixelWorks", companyInitials: "PW",
    location: "Bangalore", locationType: "On-site", type: "Full-time", experienceLevel: "Entry",
    department: "Engineering", salaryMin: 5, salaryMax: 7, postedDaysAgo: 14, deadlineDays: 7,
    skills: ["React", "CSS", "Git"], applicants: 143,
    description: "PixelWorks is hiring a Junior Frontend Developer eager to grow their React skills in a supportive team.",
    responsibilities: ["Build UI components with guidance from senior engineers", "Fix bugs and write basic tests", "Participate in code reviews"],
    requirements: ["Understanding of React fundamentals", "Familiarity with Git", "Strong willingness to learn"],
    benefits: ["Mentorship program", "Health insurance"],
    companyInfo: "PixelWorks is a digital product agency working with startups.",
  },
  {
    id: 11, title: "QA Automation Engineer", company: "Nova Labs", companyInitials: "NL",
    location: "Remote", locationType: "Remote", type: "Contract", experienceLevel: "Mid",
    department: "Engineering", salaryMin: 7, salaryMax: 11, postedDaysAgo: 16, deadlineDays: 5,
    skills: ["Selenium", "Cypress", "JavaScript"], applicants: 33,
    description: "Nova Labs needs a QA Automation Engineer to build and maintain our end-to-end test suite.",
    responsibilities: ["Write automated test suites", "Investigate and report bugs", "Work with engineers to improve testability"],
    requirements: ["Experience with Cypress or Selenium", "Comfortable reading JavaScript"],
    benefits: ["Remote-first", "Flexible hours"],
    companyInfo: "Nova Labs is a fully remote design-led product studio.",
  },
  {
    id: 12, title: "Engineering Manager", company: "CloudWorks", companyInitials: "CW",
    location: "Bangalore", locationType: "Hybrid", type: "Full-time", experienceLevel: "Lead",
    department: "Engineering", salaryMin: 28, salaryMax: 38, postedDaysAgo: 18, deadlineDays: 30,
    skills: ["Leadership", "React", "System Design"], applicants: 21,
    description: "CloudWorks is looking for an Engineering Manager to grow and lead a team of frontend engineers.",
    responsibilities: ["Manage and mentor a team of 6-8 engineers", "Own technical direction for the frontend org", "Partner with product and design leadership"],
    requirements: ["6+ years engineering experience, 2+ years managing", "Strong technical background in frontend"],
    benefits: ["ESOPs", "Health insurance", "Leadership coaching"],
    companyInfo: "CloudWorks provides cloud infrastructure tooling for enterprises.",
  },
];

const seedProfile = {
  firstName: "",
  lastName: "",
  headline: "",
  bio: "",
  email: "",
  phone: "",
  location: "",
  photo: null,
  currentPosition: "",
  currentCompany: "",
  yearsExperience: "",
  links: {
    linkedin: "",
    github: "",
    portfolio: "",
    website: "",
  },
  skills: [],
  experience: [],
  education: [],
};

const seedResumes = [];

const seedApplications = [];

const seedInterviews = [];

const seedNotifications = [];

const seedConversations = [];

const seedAlerts = [];

const seedPreferences = {
  roles: [],
  locations: [],
  remote: "Any",
  expectedSalary: "",
  employmentType: "Full-time",
  experienceLevel: "Mid",
  jobAlerts: true,
  emailNotifications: true,
  interviewNotifications: true,
};

const seedCareerGoals = [
  { id: "system-design",    label: "Learn System Design",    category: "skill",     done: false, doneDate: null },
  { id: "portfolio",        label: "Build Portfolio Project", category: "project",   done: false, doneDate: null },
  { id: "practice-interview", label: "Practice Interviews",  category: "interview", done: false, doneDate: null },
  { id: "cloud-cert",      label: "Get Cloud Certification", category: "skill",     done: false, doneDate: null },
  { id: "networking",      label: "Expand Professional Network", category: "soft", done: false, doneDate: null },
];

const STATUS_FLOW = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Hired"];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

function timeAgo(iso) {
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

export function CandidateDataProvider({ children }) {
  const persisted = loadState();

  const [jobs] = useState(seedJobs);
  const [syncedJobs, setSyncedJobs] = useState([]);
  const allJobs = useMemo(() => [...syncedJobs, ...jobs], [syncedJobs, jobs]);
  const [savedJobIds, setSavedJobIds] = useState(persisted?.savedJobIds || [1, 3, 9]);
  const [applications, setApplications] = useState(persisted?.applications || seedApplications);
  const [interviews, setInterviews] = useState(persisted?.interviews || seedInterviews);
  const [profile, setProfile] = useState(persisted?.profile || seedProfile);
  const [resumes, setResumes] = useState(persisted?.resumes || seedResumes);
  const [notifications, setNotifications] = useState(persisted?.notifications || seedNotifications);
  const [conversations, setConversations] = useState(persisted?.conversations || seedConversations);
  const [alerts, setAlerts] = useState(persisted?.alerts || seedAlerts);
  const [preferences, setPreferences] = useState(persisted?.preferences || seedPreferences);
  const [careerGoals, setCareerGoals] = useState(persisted?.careerGoals || seedCareerGoals);

  useEffect(() => {
    try {
      // Strip base64 dataUrl blobs before serializing: they can be 1-3 MB each
      // and will quickly exceed the ~5 MB localStorage quota. The dataUrl is
      // retained in React state for the current session (preview/download still
      // works) but is not persisted across reloads to prevent QuotaExceededError.
      const resumesWithoutBlobs = resumes.map(({ dataUrl: _dataUrl, ...rest }) => rest);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          savedJobIds, applications, interviews, profile,
          resumes: resumesWithoutBlobs,
          notifications, conversations, alerts, preferences, careerGoals,
        })
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        // Storage quota exceeded — this is a known risk when resumes/blobs are large.
        // Data has NOT been lost from the current session (state is still in memory).
        console.warn("[CareerOS] localStorage quota exceeded — candidate state could not be persisted. Consider clearing old data.");
      }
      // All other errors (SecurityError in sandboxed iframes, etc.) are silently ignored.
    }
  }, [savedJobIds, applications, interviews, profile, resumes, notifications, conversations, alerts, preferences, careerGoals]);

  const jobsById = useMemo(() => Object.fromEntries(allJobs.map((j) => [j.id, j])), [allJobs]);
  const getJob = useCallback((id) => jobsById[id], [jobsById]);

  /* ---------- saved jobs ---------- */
  const isJobSaved = useCallback((jobId) => savedJobIds.includes(jobId), [savedJobIds]);
  const toggleSaveJob = useCallback((jobId) => {
    setSavedJobIds((cur) => (cur.includes(jobId) ? cur.filter((id) => id !== jobId) : [...cur, jobId]));
  }, []);

  /* ---------- applications ---------- */
  const hasApplied = useCallback(
    (jobId) => applications.some((a) => a.jobId === jobId && a.status !== "Withdrawn"),
    [applications]
  );

  const submitApplication = useCallback((jobId, formSnapshot) => {
    const now = new Date().toISOString();
    const application = {
      id: nextId(),
      jobId,
      appliedDate: now.slice(0, 10),
      lastUpdated: now.slice(0, 10),
      status: "Applied",
      formSnapshot,
      history: [{ status: "Applied", date: now, note: "Application submitted." }],
    };
    setApplications((cur) => [application, ...cur]);

    const job = jobsById[jobId];
    setNotifications((cur) => [
      { id: nextId(), type: "status", title: "Application submitted", message: `You applied to ${job?.title} at ${job?.company}.`, date: now, read: false },
      ...cur,
    ]);
    return application;
  }, [jobsById]);

  const withdrawApplication = useCallback((applicationId) => {
    const now = new Date().toISOString();
    setApplications((cur) =>
      cur.map((a) =>
        a.id === applicationId
          ? { ...a, status: "Withdrawn", lastUpdated: now.slice(0, 10), history: [...a.history, { status: "Withdrawn", date: now, note: "You withdrew this application." }] }
          : a
      )
    );
  }, []);

  const advanceApplicationStatus = useCallback((applicationId) => {
    const now = new Date().toISOString();
    setApplications((cur) =>
      cur.map((a) => {
        if (a.id !== applicationId) return a;
        const idx = STATUS_FLOW.indexOf(a.status);
        const nextStatus = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
        if (nextStatus === a.status) return a;
        return { ...a, status: nextStatus, lastUpdated: now.slice(0, 10), history: [...a.history, { status: nextStatus, date: now, note: `Status updated to ${nextStatus}.` }] };
      })
    );
  }, []);

  /* ---------- interviews ---------- */
  const rescheduleInterview = useCallback((interviewId, date, time) => {
    setInterviews((cur) =>
      cur.map((i) =>
        i.id === interviewId
          ? { ...i, date, time, status: "Scheduled", rescheduleRequest: { date, time, requestedAt: new Date().toISOString() } }
          : i
      )
    );
  }, []);

  // Called by PlatformBridge after delivering the reschedule request to the recruiter
  const clearRescheduleRequest = useCallback((interviewId) => {
    setInterviews((cur) =>
      cur.map((i) =>
        i.id === interviewId ? { ...i, rescheduleRequest: null } : i
      )
    );
  }, []);

  const cancelInterview = useCallback((interviewId) => {
    setInterviews((cur) => cur.map((i) => (i.id === interviewId ? { ...i, status: "Cancelled" } : i)));
  }, []);

  const scheduleInterviewForApplication = useCallback((applicationId, jobId, interviewer, date, time, type, location) => {
    setInterviews((cur) => [
      ...cur,
      { id: nextId(), applicationId, jobId, interviewer, date, time, type, location, status: "Scheduled" },
    ]);
  }, []);

  /* ---------- notifications ---------- */
  const markNotificationRead = useCallback((id) => {
    setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
  }, []);
  const deleteNotification = useCallback((id) => {
    setNotifications((cur) => cur.filter((n) => n.id !== id));
  }, []);

  /* ---------- messages ---------- */
  const sendMessage = useCallback((conversationId, text) => {
    const now = new Date().toISOString();
    setConversations((cur) =>
      cur.map((c) =>
        c.id === conversationId ? { ...c, thread: [...c.thread, { id: nextId(), from: "me", text, timestamp: now }] } : c
      )
    );
  }, []);

  /* ---------- profile ---------- */
  const updateProfile = useCallback((partial) => {
    setProfile((cur) => ({ ...cur, ...partial }));
  }, []);
  const updateLinks = useCallback((partial) => {
    setProfile((cur) => ({ ...cur, links: { ...cur.links, ...partial } }));
  }, []);
  const addSkill = useCallback((skill) => {
    setProfile((cur) => (cur.skills.includes(skill) ? cur : { ...cur, skills: [...cur.skills, skill] }));
  }, []);
  const removeSkill = useCallback((skill) => {
    setProfile((cur) => ({ ...cur, skills: cur.skills.filter((s) => s !== skill) }));
  }, []);
  const addExperience = useCallback((exp) => {
    setProfile((cur) => ({ ...cur, experience: [{ id: nextId(), ...exp }, ...cur.experience] }));
  }, []);
  const updateExperience = useCallback((id, partial) => {
    setProfile((cur) => ({ ...cur, experience: cur.experience.map((e) => (e.id === id ? { ...e, ...partial } : e)) }));
  }, []);
  const deleteExperience = useCallback((id) => {
    setProfile((cur) => ({ ...cur, experience: cur.experience.filter((e) => e.id !== id) }));
  }, []);
  const addEducation = useCallback((edu) => {
    setProfile((cur) => ({ ...cur, education: [{ id: nextId(), ...edu }, ...cur.education] }));
  }, []);
  const updateEducation = useCallback((id, partial) => {
    setProfile((cur) => ({ ...cur, education: cur.education.map((e) => (e.id === id ? { ...e, ...partial } : e)) }));
  }, []);
  const deleteEducation = useCallback((id) => {
    setProfile((cur) => ({ ...cur, education: cur.education.filter((e) => e.id !== id) }));
  }, []);

  const profileCompletion = useMemo(() => {
    const checks = [
      !!profile.photo,
      !!profile.bio && profile.bio.length > 10,
      !!profile.headline,
      !!profile.phone,
      !!profile.location,
      profile.skills.length >= 3,
      profile.experience.length > 0,
      profile.education.length > 0,
      !!profile.links.linkedin,
      resumes.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [profile, resumes]);

  /* ---------- resumes ---------- */
  const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

  const uploadResume = useCallback((file) => {
    if (file.size > MAX_RESUME_BYTES) {
      // Reject before FileReader runs — avoids bloating memory and storage.
      return Promise.reject(
        new Error(`File "${file.name}" is ${Math.round(file.size / 1024)} KB, which exceeds the 5 MB limit.`)
      );
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const record = {
          id: nextId(),
          name: file.name,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          type: (file.name.split(".").pop() || "FILE").toUpperCase(),
          uploadedDate: new Date().toISOString().slice(0, 10),
          isPrimary: false,
          dataUrl: reader.result,
        };
        setResumes((cur) => {
          const updated = [...cur, record];
          if (!cur.some((r) => r.isPrimary)) {
            return updated.map((r) => (r.id === record.id ? { ...r, isPrimary: true } : r));
          }
          return updated;
        });
        resolve(record);
      };
      reader.readAsDataURL(file);
    });
  }, []);
  const deleteResume = useCallback((id) => {
    setResumes((cur) => {
      const filtered = cur.filter((r) => r.id !== id);
      if (filtered.length && !filtered.some((r) => r.isPrimary)) filtered[0] = { ...filtered[0], isPrimary: true };
      return filtered;
    });
  }, []);

  // Replaces the blob (dataUrl) on an existing record in-place — used when re-uploading
  // a session-only resume. Preserves the record's id, isPrimary, and metadata so
  // the list doesn't grow a duplicate.
  const replaceResume = useCallback((id, file) => {
    if (file.size > MAX_RESUME_BYTES) {
      return Promise.reject(
        new Error(`File "${file.name}" is ${Math.round(file.size / 1024)} KB, which exceeds the 5 MB limit.`)
      );
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        setResumes((cur) => {
          const updated = cur.map((r) =>
            r.id === id
              ? {
                  ...r,
                  name: file.name,
                  size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                  type: (file.name.split(".").pop() || "FILE").toUpperCase(),
                  uploadedDate: new Date().toISOString().slice(0, 10),
                  dataUrl: reader.result,
                }
              : r
          );
          resolve(updated.find((r) => r.id === id));
          return updated;
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }, [MAX_RESUME_BYTES]);

  const setPrimaryResume = useCallback((id) => {
    setResumes((cur) => cur.map((r) => ({ ...r, isPrimary: r.id === id })));
  }, []);

  /* ---------- alerts ---------- */
  const addAlert = useCallback((alert) => {
    setAlerts((cur) => [{ id: nextId(), enabled: true, ...alert }, ...cur]);
  }, []);
  const updateAlert = useCallback((id, partial) => {
    setAlerts((cur) => cur.map((a) => (a.id === id ? { ...a, ...partial } : a)));
  }, []);
  const deleteAlert = useCallback((id) => {
    setAlerts((cur) => cur.filter((a) => a.id !== id));
  }, []);
  const toggleAlert = useCallback((id) => {
    setAlerts((cur) => cur.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, []);

  /* ---------- preferences ---------- */
  const updatePreferences = useCallback((partial) => {
    setPreferences((cur) => ({ ...cur, ...partial }));
  }, []);

  /* ---------- career goals ---------- */
  const toggleCareerGoal = useCallback((id) => {
    const now = new Date().toISOString();
    setCareerGoals((cur) =>
      cur.map((g) =>
        g.id === id
          ? { ...g, done: !g.done, doneDate: !g.done ? now : null }
          : g
      )
    );
  }, []);

  const addCareerGoal = useCallback((label, category = "skill") => {
    setCareerGoals((cur) => [
      ...cur,
      { id: `goal-${Date.now()}`, label, category, done: false, doneDate: null },
    ]);
  }, []);

  const removeCareerGoal = useCallback((id) => {
    setCareerGoals((cur) => cur.filter((g) => g.id !== id));
  }, []);

  /* ---------- derived stats ---------- */
  const stats = useMemo(() => {
    const active = applications.filter((a) => a.status !== "Withdrawn" && a.status !== "Rejected");
    return {
      applicationsSubmitted: applications.length,
      inProgress: active.filter((a) => !["Offer", "Hired"].includes(a.status)).length,
      interviewsScheduled: interviews.filter((i) => i.status === "Scheduled").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      offers: applications.filter((a) => a.status === "Offer" || a.status === "Hired").length,
      savedJobs: savedJobIds.length,
      profileCompletion,
      unreadNotifications: notifications.filter((n) => !n.read).length,
      unreadMessages: conversations.filter((c) => c.thread.length && c.thread[c.thread.length - 1].from === "them").length,
    };
  }, [applications, interviews, savedJobIds, profileCompletion, notifications, conversations]);

  /* ---------- platform bridge (recruiter <-> candidate live sync) ---------- */
  const syncJobsFromRecruiter = useCallback((mappedJobs) => {
    setSyncedJobs(mappedJobs);
  }, []);

  const receiveApplicationSync = (applicationId, status, note) => {
    const now = new Date().toISOString();
    const app = applications.find((a) => a.id === applicationId);
    if (!app || app.status === status) return;
    const job = jobsById[app.jobId];

    setApplications((cur) =>
      cur.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status,
              lastUpdated: now.slice(0, 10),
              history: [
                ...a.history,
                { status, date: now, note: note || `Status updated to ${status}.` },
              ],
            }
          : a
      )
    );

    setNotifications((cur) => [
      {
        id: nextId(),
        type: "status",
        title: "Application status changed",
        message: `Your application for ${job?.title || "this role"} moved to ${status}.`,
        date: now,
        read: false,
      },
      ...cur,
    ]);
  };

  const receiveInterviewSync = (applicationId, jobId, recruiterInterview) => {
    const now = new Date().toISOString();
    const job = jobsById[jobId];
    const existing = interviews.find(
      (i) => i.sourceRecruiterInterviewId === recruiterInterview.id
    );

    if (existing) {
      const changed =
        existing.date !== recruiterInterview.date ||
        existing.time !== recruiterInterview.time ||
        existing.status !==
          (recruiterInterview.status === "Cancelled" ? "Cancelled" : "Scheduled");

      if (!changed) return;

      setInterviews((cur) =>
        cur.map((i) =>
          i.sourceRecruiterInterviewId === recruiterInterview.id
            ? {
                ...i,
                date: recruiterInterview.date,
                time: recruiterInterview.time,
                type: recruiterInterview.type || i.type,
                location:
                  recruiterInterview.meetingLink || recruiterInterview.location || i.location,
                status:
                  recruiterInterview.status === "Cancelled" ? "Cancelled" : "Scheduled",
              }
            : i
        )
      );

      setNotifications((cur) => [
        {
          id: nextId(),
          type: "interview",
          title:
            recruiterInterview.status === "Cancelled"
              ? "Interview cancelled"
              : "Interview updated",
          message: `Your interview for ${job?.title || "this role"} was ${
            recruiterInterview.status === "Cancelled" ? "cancelled" : "rescheduled"
          }.`,
          date: now,
          read: false,
        },
        ...cur,
      ]);
      return;
    }

    setInterviews((cur) => [
      ...cur,
      {
        id: nextId(),
        applicationId,
        jobId,
        interviewer: recruiterInterview.interviewer,
        date: recruiterInterview.date,
        time: recruiterInterview.time,
        type: recruiterInterview.type,
        location: recruiterInterview.meetingLink || recruiterInterview.location || "",
        status: "Scheduled",
        sourceRecruiterInterviewId: recruiterInterview.id,
      },
    ]);

    setNotifications((cur) => [
      {
        id: nextId(),
        type: "interview",
        title: "Interview scheduled",
        message: `Interview scheduled for ${job?.title || "your application"} on ${
          recruiterInterview.date
        } at ${recruiterInterview.time}.`,
        date: now,
        read: false,
      },
      ...cur,
    ]);
  };

  const receiveMessagesSync = ({
    sourceConversationId,
    company,
    recruiterName,
    initials,
    incomingMessages,
  }) => {
    if (!incomingMessages.length) return;
    const now = new Date().toISOString();
    let delivered = false;

    setConversations((cur) => {
      const existing = cur.find((c) => c.sourceConversationId === sourceConversationId);

      if (existing) {
        const deliveredCount = existing.deliveredCount || 0;
        const fresh = incomingMessages.slice(deliveredCount);
        if (fresh.length === 0) return cur;
        delivered = true;

        return cur.map((c) =>
          c.sourceConversationId === sourceConversationId
            ? {
                ...c,
                thread: [
                  ...c.thread,
                  ...fresh.map((m) => ({ id: nextId(), from: "them", text: m.text, timestamp: now })),
                ],
                deliveredCount: incomingMessages.length,
              }
            : c
        );
      }

      delivered = true;
      return [
        {
          id: nextId(),
          company,
          recruiterName,
          initials,
          sourceConversationId,
          deliveredCount: incomingMessages.length,
          deliveredToRecruiterCount: 0,
          thread: incomingMessages.map((m) => ({
            id: nextId(),
            from: "them",
            text: m.text,
            timestamp: now,
          })),
        },
        ...cur,
      ];
    });

    if (delivered) {
      setNotifications((cur) => [
        {
          id: nextId(),
          type: "message",
          title: "New message from recruiter",
          message: `${recruiterName} sent you a message.`,
          date: now,
          read: false,
        },
        ...cur,
      ]);
    }
  };

  const markMessagesDeliveredToRecruiter = (conversationId, count) => {
    setConversations((cur) =>
      cur.map((c) =>
        c.id === conversationId ? { ...c, deliveredToRecruiterCount: count } : c
      )
    );
  };

  const value = useMemo(
    () => ({
      jobs: allJobs, getJob,
      syncJobsFromRecruiter, receiveApplicationSync, receiveInterviewSync,
      receiveMessagesSync, markMessagesDeliveredToRecruiter,
      savedJobIds, isJobSaved, toggleSaveJob,
      applications, hasApplied, submitApplication, withdrawApplication, advanceApplicationStatus,
      interviews, rescheduleInterview, cancelInterview, scheduleInterviewForApplication, clearRescheduleRequest,
      notifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
      conversations, sendMessage,
      profile, updateProfile, updateLinks, addSkill, removeSkill,
      addExperience, updateExperience, deleteExperience,
      addEducation, updateEducation, deleteEducation, profileCompletion,
      resumes, uploadResume, deleteResume, replaceResume, setPrimaryResume,
      alerts, addAlert, updateAlert, deleteAlert, toggleAlert,
      preferences, updatePreferences,
      careerGoals, toggleCareerGoal, addCareerGoal, removeCareerGoal,
      stats, timeAgo, STATUS_FLOW,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allJobs, savedJobIds, applications, interviews, notifications,
      conversations, profile, profileCompletion, resumes, alerts,
      preferences, careerGoals, stats,
    ]
  );

  return <CandidateDataContext.Provider value={value}>{children}</CandidateDataContext.Provider>;
}

export function useCandidateData() {
  const ctx = useContext(CandidateDataContext);
  if (!ctx) throw new Error("useCandidateData must be used inside CandidateDataProvider");
  return ctx;
}
