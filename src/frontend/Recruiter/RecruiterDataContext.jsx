import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadState as loadRecruiterState, saveState as saveRecruiterState } from "./recruiterStorage";

const RecruiterDataContext = createContext(null);

export const PIPELINE_STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
];

const seedJobs = [
  {
    id: 1,
    title: "Senior Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    applicants: 42,
    views: 328,
    status: "Active",
    posted: "2 days ago",
    daysLeft: 12,
    daysAgo: 2,
    description:
      "We are looking for a Senior Product Designer to lead product experiences and design systems.",
    salary: "$110k - $145k",
    skills: ["Figma", "UX", "Design Systems"],
  },
  {
    id: 2,
    title: "Frontend Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    applicants: 67,
    views: 512,
    status: "Active",
    posted: "4 days ago",
    daysLeft: 18,
    daysAgo: 4,
    description:
      "Build modern, scalable frontend experiences using React and TypeScript.",
    salary: "$120k - $160k",
    skills: ["React", "JavaScript", "TypeScript"],
  },
  {
    id: 3,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    applicants: 31,
    views: 246,
    status: "Active",
    posted: "1 week ago",
    daysLeft: 21,
    daysAgo: 7,
    description:
      "Own marketing campaigns, growth initiatives and brand strategy.",
    salary: "$90k - $120k",
    skills: ["Marketing", "SEO", "Analytics"],
  },
  {
    id: 4,
    title: "UX Researcher",
    department: "Design",
    location: "Boston, MA",
    type: "Full-time",
    applicants: 28,
    views: 189,
    status: "Active",
    posted: "2 weeks ago",
    daysLeft: 5,
    daysAgo: 14,
    description:
      "Conduct qualitative and quantitative research to improve customer experiences.",
    salary: "$95k - $130k",
    skills: ["Research", "UX", "Analytics"],
  },
  {
    id: 5,
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    applicants: 54,
    views: 401,
    status: "Active",
    posted: "3 weeks ago",
    daysLeft: 24,
    daysAgo: 21,
    description:
      "Develop reliable APIs and backend services for our growing platform.",
    salary: "$125k - $165k",
    skills: ["Node.js", "Python", "PostgreSQL"],
  },
  {
    id: 6,
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "Full-time",
    applicants: 38,
    views: 276,
    status: "Closed",
    posted: "1 month ago",
    daysLeft: 0,
    daysAgo: 30,
    description: "Lead product strategy and roadmap execution.",
    salary: "$130k - $170k",
    skills: ["Product", "Strategy", "Agile"],
  },
  {
    id: 7,
    title: "Graphic Designer",
    department: "Design",
    location: "Remote",
    type: "Contract",
    applicants: 19,
    views: 142,
    status: "Closed",
    posted: "2 months ago",
    daysLeft: 0,
    daysAgo: 60,
    description: "Create marketing and brand assets.",
    salary: "$45 - $65/hr",
    skills: ["Illustrator", "Photoshop", "Branding"],
  },
  {
    id: 8,
    title: "Sales Development Representative",
    department: "Sales",
    location: "Remote",
    type: "Full-time",
    applicants: 0,
    views: 12,
    status: "Draft",
    posted: "Not published",
    daysLeft: 0,
    daysAgo: 1,
    description: "",
    salary: "",
    skills: [],
  },
];

const seedCandidates = [
  {
    id: 1,
    name: "Lewis Cunningham",
    email: "lewis.cunningham@email.com",
    phone: "+1 (415) 555-0132",
    location: "San Francisco, CA",
    appliedFor: "Senior Product Designer",
    department: "Design",
    appliedDate: "2026-08-27",
    status: "Interview",
    rating: 4,
    skills: ["Figma", "UX", "Design Systems"],
    experience: 6,
    shortlisted: true,
    notes:
      "Strong portfolio, 6 years experience in B2B SaaS design systems.",
  },
  {
    id: 2,
    name: "Danny Nelson",
    email: "danny.nelson@email.com",
    phone: "+1 (212) 555-0198",
    location: "New York, NY",
    appliedFor: "Frontend Engineer",
    department: "Engineering",
    appliedDate: "2026-08-25",
    status: "Screening",
    rating: 3,
    skills: ["React", "JavaScript", "TypeScript"],
    experience: 4,
    notes: "Solid React background, completed take-home assessment.",
  },
  {
    id: 3,
    name: "Jennifer Patterson",
    email: "jennifer.patterson@email.com",
    phone: "+1 (312) 555-0176",
    location: "Chicago, IL",
    appliedFor: "Marketing Manager",
    department: "Marketing",
    appliedDate: "2026-08-24",
    status: "Applied",
    rating: 0,
    skills: ["Marketing", "SEO"],
    experience: 3,
    notes: "",
  },
  {
    id: 4,
    name: "Timothy Watson",
    email: "timothy.watson@email.com",
    phone: "+1 (628) 555-0110",
    location: "Remote",
    appliedFor: "Senior Product Designer",
    department: "Design",
    appliedDate: "2026-08-20",
    status: "Offer",
    rating: 5,
    skills: ["Figma", "UX", "Research"],
    experience: 8,
    shortlisted: true,
    notes: "Exceptional final interview. Offer sent, awaiting response.",
  },
  {
    id: 5,
    name: "Kimberly Rutledge",
    email: "kimberly.rutledge@email.com",
    phone: "+1 (737) 555-0142",
    location: "Austin, TX",
    appliedFor: "Backend Engineer",
    department: "Engineering",
    appliedDate: "2026-08-19",
    status: "Screening",
    rating: 3,
    skills: ["Node.js", "Python", "PostgreSQL"],
    experience: 5,
    notes: "Good systems design fundamentals.",
  },
  {
    id: 6,
    name: "Marcus Ellery",
    email: "marcus.ellery@email.com",
    phone: "+1 (503) 555-0165",
    location: "Portland, OR",
    appliedFor: "UX Researcher",
    department: "Design",
    appliedDate: "2026-08-18",
    status: "Rejected",
    rating: 2,
    skills: ["UX Research"],
    experience: 3,
    notes: "Limited quantitative research experience.",
  },
  {
    id: 7,
    name: "Priya Anand",
    email: "priya.anand@email.com",
    phone: "+1 (650) 555-0187",
    location: "San Jose, CA",
    appliedFor: "Frontend Engineer",
    department: "Engineering",
    appliedDate: "2026-08-16",
    status: "Hired",
    rating: 5,
    skills: ["React", "TypeScript", "CSS"],
    experience: 6,
    shortlisted: true,
    notes: "Offer accepted. Start date pending.",
  },
  {
    id: 8,
    name: "Oliver Bennett",
    email: "oliver.bennett@email.com",
    phone: "+1 (206) 555-0121",
    location: "Seattle, WA",
    appliedFor: "Backend Engineer",
    department: "Engineering",
    appliedDate: "2026-08-14",
    status: "Applied",
    rating: 0,
    skills: ["Python", "Node.js"],
    experience: 2,
    notes: "",
  },
  {
    id: 9,
    name: "Grace Kim",
    email: "grace.kim@email.com",
    phone: "+1 (415) 555-0199",
    location: "Remote",
    appliedFor: "Marketing Manager",
    department: "Marketing",
    appliedDate: "2026-08-12",
    status: "Interview",
    rating: 4,
    skills: ["Marketing", "SEO", "Analytics"],
    experience: 5,
    shortlisted: true,
    notes: "Great campaign case study.",
  },
  {
    id: 10,
    name: "Ahmed Farouk",
    email: "ahmed.farouk@email.com",
    phone: "+1 (713) 555-0154",
    location: "Houston, TX",
    appliedFor: "UX Researcher",
    department: "Design",
    appliedDate: "2026-08-10",
    status: "Screening",
    rating: 3,
    skills: ["Research", "Analytics"],
    experience: 4,
    notes: "",
  },
  {
    id: 11,
    name: "Natalie Brooks",
    email: "natalie.brooks@email.com",
    phone: "+1 (617) 555-0143",
    location: "Boston, MA",
    appliedFor: "Senior Product Designer",
    department: "Design",
    appliedDate: "2026-08-08",
    status: "Rejected",
    rating: 2,
    skills: ["Figma", "UI"],
    experience: 3,
    notes: "Not enough enterprise UX experience.",
  },
  {
    id: 12,
    name: "Samuel Osei",
    email: "samuel.osei@email.com",
    phone: "+1 (312) 555-0188",
    location: "Chicago, IL",
    appliedFor: "Frontend Engineer",
    department: "Engineering",
    appliedDate: "2026-08-05",
    status: "Applied",
    rating: 0,
    skills: ["React", "JavaScript"],
    experience: 3,
    notes: "",
  },
];

const seedInterviews = [
  {
    id: 1,
    candidate: "Alex Smith",
    email: "alex.smith@email.com",
    job: "Frontend Engineer",
    department: "Engineering",
    date: "2026-08-29",
    time: "10:00",
    duration: "45 min",
    interviewer: "John Doe",
    type: "Technical Interview",
    status: "Scheduled",
    meetingLink: "https://meet.careeros.io/frontend-01",
    notes: "",
  },
  {
    id: 2,
    candidate: "Maya Johnson",
    email: "maya.johnson@email.com",
    job: "Product Designer",
    department: "Design",
    date: "2026-08-29",
    time: "11:30",
    duration: "30 min",
    interviewer: "Sarah Wilson",
    type: "Portfolio Review",
    status: "Scheduled",
    meetingLink: "https://meet.careeros.io/design-02",
    notes: "",
  },
  {
    id: 3,
    candidate: "Ryan Kim",
    email: "ryan.kim@email.com",
    job: "Frontend Engineer",
    department: "Engineering",
    date: "2026-08-29",
    time: "14:00",
    duration: "45 min",
    interviewer: "John Doe",
    type: "Technical Interview",
    status: "Scheduled",
    meetingLink: "",
    notes: "",
  },
  {
    id: 4,
    candidate: "Emma Miller",
    email: "emma.miller@email.com",
    job: "Marketing Manager",
    department: "Marketing",
    date: "2026-08-30",
    time: "09:30",
    duration: "30 min",
    interviewer: "Lisa Brown",
    type: "Hiring Manager",
    status: "Scheduled",
    meetingLink: "https://meet.careeros.io/marketing-04",
    notes: "",
  },
  {
    id: 5,
    candidate: "Daniel Wilson",
    email: "daniel.wilson@email.com",
    job: "UX Researcher",
    department: "Design",
    date: "2026-08-30",
    time: "13:00",
    duration: "45 min",
    interviewer: "Sarah Wilson",
    type: "Final Interview",
    status: "Pending",
    meetingLink: "",
    notes: "Awaiting candidate confirmation.",
  },
];

const seedMessages = [
  {
    id: 1,
    candidate: "Lewis Cunningham",
    email: "lewis.cunningham@email.com",
    avatar: "LC",
    lastMessage: "Thank you! I am available tomorrow.",
    time: "10:42 AM",
    unread: true,
    messages: [
      {
        from: "recruiter",
        text: "Hi Lewis, are you available for an interview tomorrow?",
        time: "10:35 AM",
      },
      {
        from: "candidate",
        text: "Thank you! I am available tomorrow.",
        time: "10:42 AM",
      },
    ],
  },
  {
    id: 2,
    candidate: "Danny Nelson",
    email: "danny.nelson@email.com",
    avatar: "DN",
    lastMessage: "I have completed the assessment.",
    time: "Yesterday",
    unread: false,
    messages: [
      {
        from: "candidate",
        text: "I have completed the assessment.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 3,
    candidate: "Priya Anand",
    email: "priya.anand@email.com",
    avatar: "PA",
    lastMessage: "Looking forward to joining the team.",
    time: "Mon",
    unread: false,
    messages: [
      {
        from: "recruiter",
        text: "Congratulations on accepting the offer!",
        time: "Mon",
      },
      {
        from: "candidate",
        text: "Looking forward to joining the team.",
        time: "Mon",
      },
    ],
  },
];

const seedNotifications = [
  {
    id: 1,
    type: "interview",
    title: "Interview scheduled",
    message: "Technical interview with Alex Smith is confirmed for tomorrow at 10:00.",
    time: "2026-08-30T09:10:00",
    read: false,
  },
  {
    id: 2,
    type: "candidate",
    title: "New applicant",
    message: "Samuel Osei applied for Frontend Engineer.",
    time: "2026-08-29T16:40:00",
    read: false,
  },
  {
    id: 3,
    type: "offer",
    title: "Offer accepted",
    message: "Priya Anand accepted the offer for Frontend Engineer.",
    time: "2026-08-27T11:05:00",
    read: false,
  },
  {
    id: 4,
    type: "job",
    title: "Job posted",
    message: "Senior Product Designer is now live and accepting applicants.",
    time: "2026-08-25T08:30:00",
    read: true,
  },
];

const seedActivity = [
  {
    id: 1,
    type: "offer",
    text: "Priya Anand accepted the offer for Frontend Engineer.",
    time: "2026-08-27T11:05:00",
  },
  {
    id: 2,
    type: "interview",
    text: "Interview scheduled with Alex Smith for Frontend Engineer.",
    time: "2026-08-28T14:20:00",
  },
  {
    id: 3,
    type: "candidate",
    text: "Lewis Cunningham moved to Interview stage.",
    time: "2026-08-27T10:00:00",
  },
  {
    id: 4,
    type: "job",
    text: "Senior Product Designer job posting published.",
    time: "2026-08-25T08:30:00",
  },
  {
    id: 5,
    type: "candidate",
    text: "Marcus Ellery was rejected for UX Researcher.",
    time: "2026-08-19T09:15:00",
  },
];

const defaultSettings = {
  companyName: "CareerOS",
  recruiterName: "HR Manager",
  recruiterEmail: "hr@careeros.com",
  emailNotifications: true,
  interviewReminders: true,
  applicationAlerts: true,
  weeklyReports: true,

  // Recruiter profile
  recruiterJobTitle: "Talent Acquisition Manager",
  recruiterPhone: "+1 (415) 555-0100",
  recruiterLocation: "San Francisco, CA",
  recruiterBio:
    "Passionate about connecting great people with great teams. 6+ years in tech recruiting.",
  recruiterLinkedin: "linkedin.com/in/hr-manager",
  recruiterPhoto: null,

  // Company profile
  companyIndustry: "Technology",
  companySize: "51-200 employees",
  companyWebsite: "www.careeros.com",
  companyLocation: "San Francisco, CA",
  companyDescription:
    "CareerOS builds hiring tools that help fast-growing teams find and hire great talent faster.",
  companyLinkedin: "linkedin.com/company/careeros",
  companyLogo: null,
  companyBenefits: [
    "Health insurance",
    "Remote-friendly",
    "Flexible PTO",
    "Annual learning budget",
  ],
};

function withShortlistDefaults(candidates) {
  return candidates.map((candidate) => {
    const migratedNotes = candidate.notes
      ? [
          {
            id: 1,
            author: "HR Manager",
            date: candidate.appliedDate
              ? `${candidate.appliedDate}T09:00:00`
              : new Date().toISOString(),
            content: candidate.notes,
          },
        ]
      : [];

    return {
      shortlisted: false,
      ...candidate,
      notesList: candidate.notesList || migratedNotes,
    };
  });
}

const seedHiringAlerts = [
  {
    id: 1,
    type: "New candidates",
    job: "All jobs",
    threshold: null,
    enabled: true,
  },
  {
    id: 2,
    type: "Applications exceed",
    job: "Frontend Engineer",
    threshold: 50,
    enabled: true,
  },
  {
    id: 3,
    type: "Job deadline approaching",
    job: "UX Researcher",
    threshold: 3,
    enabled: false,
  },
];

// loadState is now handled by recruiterStorage with compression

export function RecruiterDataProvider({ children }) {
  const [state, setState] = useState(loadRecruiterState);

  useEffect(() => {
    saveRecruiterState(state);
  }, [state]);

  const addJob = (job) => {
    const id = Date.now();

    setState((s) => ({
      ...s,
      jobs: [
        {
          id,
          applicants: 0,
          views: 0,
          shortlistedCount: 0,
          interviewCount: 0,
          hiredCount: 0,
          status: "Draft",
          posted: "Not published",
          daysLeft: 0,
          remote: "On-site",
          experienceLevel: "Mid",
          salaryMin: "",
          salaryMax: "",
          currency: "USD",
          salaryPeriod: "Year",
          benefits: [],
          responsibilities: "",
          requirements: "",
          preferredQualifications: "",
          deadline: "",
          resumeRequired: true,
          coverLetterRequired: false,
          portfolioRequired: false,
          screeningQuestions: [],
          ...job,
        },
        ...s.jobs,
      ],
    }));

    return id;
  };

  const updateJob = (id, changes) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((job) =>
        job.id === id ? { ...job, ...changes } : job
      ),
    }));
  };

  const setJobStatus = (id, status) => {
    setState((s) => {
      let title = "";

      const jobs = s.jobs.map((job) => {
        if (job.id !== id) return job;
        title = job.title;

        const next = { ...job, status };

        if (status === "Active") {
          next.posted = job.posted === "Not published" ? "Today" : job.posted;
          next.daysLeft = job.daysLeft || 30;
        }

        if (status === "Closed" || status === "Expired" || status === "Paused") {
          next.daysLeft = status === "Paused" ? job.daysLeft : 0;
        }

        return next;
      });

      const activity = [
        {
          id: Date.now() + Math.random(),
          type: "job",
          text: `"${title}" was marked ${status.toLowerCase()}.`,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50);

      return { ...s, jobs, activity };
    });
  };

  const deleteJob = (id) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.filter((job) => job.id !== id),
    }));
  };

  const duplicateJob = (id) => {
    setState((s) => {
      const job = s.jobs.find((item) => item.id === id);
      if (!job) return s;

      const copy = {
        ...job,
        id: Date.now(),
        title: `${job.title} Copy`,
        status: "Draft",
        applicants: 0,
        views: 0,
        posted: "Not published",
      };

      return {
        ...s,
        jobs: [copy, ...s.jobs],
      };
    });
  };

  const toggleJobStatus = (id) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((job) => {
        if (job.id !== id) return job;

        if (job.status === "Active") {
          return {
            ...job,
            status: "Closed",
            daysLeft: 0,
          };
        }

        return {
          ...job,
          status: "Active",
          posted: job.posted === "Not published" ? "Today" : job.posted,
          daysLeft: job.daysLeft || 30,
        };
      }),
    }));
  };

  const addCandidate = (candidate) => {
    setState((s) => ({
      ...s,
      candidates: [
        {
          id: Date.now(),
          appliedDate: new Date().toISOString().slice(0, 10),
          status: "Applied",
          rating: 0,
          skills: [],
          notes: "",
          notesList: [],
          ...candidate,
        },
        ...s.candidates,
      ],
    }));
  };

  const incrementJobApplicants = (jobId) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((job) =>
        job.id === jobId
          ? { ...job, applicants: Number(job.applicants || 0) + 1 }
          : job
      ),
    }));
  };

  const updateCandidate = (id, changes) => {
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, ...changes } : candidate
      ),
    }));
  };

  const updateCandidateStatus = (id, status) => {
    updateCandidate(id, { status });
  };

  const addCandidateNote = (candidateId, content) => {
    if (!content.trim()) return;

    setState((s) => ({
      ...s,
      candidates: s.candidates.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              notesList: [
                {
                  id: Date.now() + Math.random(),
                  author: s.settings.recruiterName,
                  date: new Date().toISOString(),
                  content: content.trim(),
                },
                ...(candidate.notesList || []),
              ],
            }
          : candidate
      ),
    }));
  };

  const updateCandidateNote = (candidateId, noteId, content) => {
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              notesList: (candidate.notesList || []).map((note) =>
                note.id === noteId
                  ? { ...note, content, editedDate: new Date().toISOString() }
                  : note
              ),
            }
          : candidate
      ),
    }));
  };

  const deleteCandidateNote = (candidateId, noteId) => {
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              notesList: (candidate.notesList || []).filter(
                (note) => note.id !== noteId
              ),
            }
          : candidate
      ),
    }));
  };

  const deleteCandidate = (id) => {
    setState((s) => ({
      ...s,
      candidates: s.candidates.filter((candidate) => candidate.id !== id),
    }));
  };

  const addInterview = (interview) => {
    setState((s) => ({
      ...s,
      interviews: [
        {
          id: Date.now(),
          status: "Scheduled",
          ...interview,
        },
        ...s.interviews,
      ],
    }));
  };

  const updateInterview = (id, changes) => {
    setState((s) => ({
      ...s,
      interviews: s.interviews.map((interview) =>
        interview.id === id
          ? { ...interview, ...changes }
          : interview
      ),
    }));
  };

  const deleteInterview = (id) => {
    setState((s) => ({
      ...s,
      interviews: s.interviews.filter((interview) => interview.id !== id),
    }));
  };

  const scheduleInterviewForCandidate = (candidateName, interview) => {
    setState((s) => {
      const candidates = s.candidates.map((candidate) => {
        if (candidate.name !== candidateName) return candidate;

        const current = PIPELINE_STAGES.indexOf(candidate.status);
        const interviewStage = PIPELINE_STAGES.indexOf("Interview");

        if (current >= interviewStage) return candidate;

        return {
          ...candidate,
          status: "Interview",
        };
      });

      return {
        ...s,
        candidates,
        interviews: [
          {
            id: Date.now(),
            status: "Scheduled",
            ...interview,
          },
          ...s.interviews,
        ],
      };
    });
  };

  const sendMessage = (conversationId, text) => {
    if (!text.trim()) return;

    setState((s) => ({
      ...s,
      messages: s.messages.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;

        const message = {
          from: "recruiter",
          text: text.trim(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return {
          ...conversation,
          lastMessage: text.trim(),
          time: "Just now",
          unread: false,
          messages: [...conversation.messages, message],
        };
      }),
    }));
  };

  const markMessageRead = (id) => {
    setState((s) => ({
      ...s,
      messages: s.messages.map((message) =>
        message.id === id ? { ...message, unread: false } : message
      ),
    }));
  };

  const receiveCandidateMessage = (candidateName, email, text, sourceConversationId) => {
    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setState((s) => {
      // Primary match: by sourceConversationId (stable across email changes)
      const byId = sourceConversationId
        ? s.messages.find((c) => c.sourceConversationId === sourceConversationId)
        : null;
      // Fallback: by email (legacy support, e.g. conversations created before this fix)
      const existing = byId ?? s.messages.find((c) => c.email === email);

      if (existing) {
        return {
          ...s,
          messages: s.messages.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  // Backfill sourceConversationId if it was absent (legacy record)
                  ...(sourceConversationId && !c.sourceConversationId
                    ? { sourceConversationId }
                    : {}),
                  lastMessage: text,
                  time: "Just now",
                  unread: true,
                  messages: [...c.messages, { from: "candidate", text, time: label }],
                }
              : c
          ),
        };
      }

      const initials = candidateName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        ...s,
        messages: [
          {
            id: Date.now() + Math.random(),
            sourceConversationId: sourceConversationId ?? null,
            candidate: candidateName,
            email,
            avatar: initials,
            lastMessage: text,
            time: "Just now",
            unread: true,
            messages: [{ from: "candidate", text, time: label }],
          },
          ...s.messages,
        ],
      };
    });
  };

  const updateSettings = (changes) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        ...changes,
      },
    }));
  };

  const addHiringAlert = (alert) => {
    setState((s) => ({
      ...s,
      hiringAlerts: [
        { id: Date.now() + Math.random(), enabled: true, ...alert },
        ...(s.hiringAlerts || []),
      ],
    }));
  };

  const updateHiringAlert = (id, changes) => {
    setState((s) => ({
      ...s,
      hiringAlerts: (s.hiringAlerts || []).map((alert) =>
        alert.id === id ? { ...alert, ...changes } : alert
      ),
    }));
  };

  const deleteHiringAlert = (id) => {
    setState((s) => ({
      ...s,
      hiringAlerts: (s.hiringAlerts || []).filter((alert) => alert.id !== id),
    }));
  };

  const toggleHiringAlert = (id) => {
    setState((s) => ({
      ...s,
      hiringAlerts: (s.hiringAlerts || []).map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      ),
    }));
  };

  const resetRecruiterData = () => {
    const fresh = {
      jobs: seedJobs,
      candidates: withShortlistDefaults(seedCandidates),
      interviews: seedInterviews,
      messages: seedMessages,
      notifications: seedNotifications,
      activity: seedActivity,
      hiringAlerts: seedHiringAlerts,
      settings: defaultSettings,
    };

    setState(fresh);
  };

  const logActivity = (text, type = "general") => {
    setState((s) => ({
      ...s,
      activity: [
        {
          id: Date.now() + Math.random(),
          type,
          text,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50),
    }));
  };

  const addNotification = (notification) => {
    setState((s) => ({
      ...s,
      notifications: [
        {
          id: Date.now() + Math.random(),
          read: false,
          time: new Date().toISOString(),
          type: "general",
          ...notification,
        },
        ...(s.notifications || []),
      ].slice(0, 30),
    }));
  };

  const markNotificationRead = (id) => {
    setState((s) => ({
      ...s,
      notifications: (s.notifications || []).map((item) =>
        item.id === id ? { ...item, read: true } : item
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((s) => ({
      ...s,
      notifications: (s.notifications || []).map((item) => ({
        ...item,
        read: true,
      })),
    }));
  };

  const clearNotifications = () => {
    setState((s) => ({
      ...s,
      notifications: [],
    }));
  };

  const toggleShortlist = (id) => {
    setState((s) => {
      let nowShortlisted = false;
      let candidateName = "";

      const candidates = s.candidates.map((candidate) => {
        if (candidate.id !== id) return candidate;

        nowShortlisted = !candidate.shortlisted;
        candidateName = candidate.name;

        return { ...candidate, shortlisted: nowShortlisted };
      });

      const activity = [
        {
          id: Date.now() + Math.random(),
          type: "candidate",
          text: nowShortlisted
            ? `${candidateName} was shortlisted.`
            : `${candidateName} was removed from the shortlist.`,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50);

      const notifications = nowShortlisted
        ? [
            {
              id: Date.now() + Math.random() + 1,
              type: "candidate",
              title: "Candidate shortlisted",
              message: `${candidateName} was added to your shortlist.`,
              time: new Date().toISOString(),
              read: false,
            },
            ...(s.notifications || []),
          ].slice(0, 30)
        : s.notifications;

      return { ...s, candidates, activity, notifications };
    });
  };

  const rejectCandidate = (id) => {
    setState((s) => {
      let candidateName = "";

      const candidates = s.candidates.map((candidate) => {
        if (candidate.id !== id) return candidate;
        candidateName = candidate.name;
        return { ...candidate, status: "Rejected", shortlisted: false };
      });

      const activity = [
        {
          id: Date.now() + Math.random(),
          type: "candidate",
          text: `${candidateName} was rejected.`,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50);

      return { ...s, candidates, activity };
    });
  };

  const cancelInterview = (id) => {
    setState((s) => {
      let label = "";

      const interviews = s.interviews.map((interview) => {
        if (interview.id !== id) return interview;
        label = `${interview.candidate} · ${interview.job}`;
        return { ...interview, status: "Cancelled" };
      });

      const activity = [
        {
          id: Date.now() + Math.random(),
          type: "interview",
          text: `Interview cancelled: ${label}.`,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50);

      return { ...s, interviews, activity };
    });
  };

  const rescheduleInterview = (id, changes) => {
    setState((s) => {
      let label = "";

      const interviews = s.interviews.map((interview) => {
        if (interview.id !== id) return interview;
        label = `${interview.candidate} · ${interview.job}`;
        return { ...interview, ...changes, status: "Scheduled" };
      });

      const activity = [
        {
          id: Date.now() + Math.random(),
          type: "interview",
          text: `Interview rescheduled: ${label}.`,
          time: new Date().toISOString(),
        },
        ...(s.activity || []),
      ].slice(0, 50);

      return { ...s, interviews, activity };
    });
  };

  const stats = useMemo(() => {
    const activeJobs = state.jobs.filter(
      (job) => job.status === "Active"
    );

    const hired = state.candidates.filter(
      (candidate) => candidate.status === "Hired"
    );

    const upcomingInterviews = state.interviews.filter(
      (interview) =>
        interview.status === "Scheduled" ||
        interview.status === "Pending"
    );

    const totalApplicants = state.jobs.reduce(
      (sum, job) => sum + Number(job.applicants || 0),
      0
    );

    const totalViews = state.jobs.reduce(
      (sum, job) => sum + Number(job.views || 0),
      0
    );

    return {
      totalJobs: state.jobs.length,
      activeJobs: activeJobs.length,
      totalApplicants,
      totalViews,
      totalCandidates: state.candidates.length,
      hired: hired.length,
      upcomingInterviews: upcomingInterviews.length,
      offers: state.candidates.filter(
        (candidate) => candidate.status === "Offer"
      ).length,
      shortlisted: state.candidates.filter(
        (candidate) => candidate.shortlisted
      ).length,
      rejected: state.candidates.filter(
        (candidate) => candidate.status === "Rejected"
      ).length,
      newApplicants: state.candidates.filter(
        (candidate) => candidate.status === "Applied"
      ).length,
    };
  }, [state]);

  const value = useMemo(
    () => ({
      jobs: state.jobs,
      candidates: state.candidates,
      interviews: state.interviews,
      messages: state.messages,
      notifications: state.notifications || [],
      activity: state.activity || [],
      hiringAlerts: state.hiringAlerts || [],
      settings: state.settings,
      stats,

      addJob,
      updateJob,
      deleteJob,
      duplicateJob,
      toggleJobStatus,
      setJobStatus,

      addCandidate,
      updateCandidate,
      updateCandidateStatus,
      deleteCandidate,
      toggleShortlist,
      rejectCandidate,
      incrementJobApplicants,
      addCandidateNote,
      updateCandidateNote,
      deleteCandidateNote,

      addInterview,
      updateInterview,
      deleteInterview,
      scheduleInterviewForCandidate,
      cancelInterview,
      rescheduleInterview,

      sendMessage,
      markMessageRead,
      receiveCandidateMessage,

      logActivity,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,

      updateSettings,
      resetRecruiterData,

      addHiringAlert,
      updateHiringAlert,
      deleteHiringAlert,
      toggleHiringAlert,
    }),
    // Handler functions are re-created each render (they close over `state`
    // via setState updaters / direct references) but are not part of the
    // public contract that changes independently of `state`/`stats`, so we
    // intentionally key the memo on the data itself to keep the context
    // value reference stable across unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, stats]
  );

  return (
    <RecruiterDataContext.Provider value={value}>
      {children}
    </RecruiterDataContext.Provider>
  );
}

export function useRecruiterData() {
  const context = useContext(RecruiterDataContext);

  if (!context) {
    throw new Error(
      "useRecruiterData must be used inside RecruiterDataProvider"
    );
  }

  return context;
}