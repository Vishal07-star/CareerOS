import { useEffect } from "react";

import { useRecruiterData } from "../Recruiter/RecruiterDataContext";
import { useCandidateData } from "./CandidateDataContext";

const RECRUITER_JOB_ID_OFFSET = 9000000;

const STATUS_MAP = {
  Applied: "Applied",
  Screening: "Under Review",
  Interview: "Interview",
  Offer: "Offer",
  Hired: "Hired",
  Rejected: "Rejected",
};

function splitLines(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function initialsFor(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Renders nothing. Lives inside the Candidate shell (where both
 * RecruiterDataProvider — mounted at the app root — and
 * CandidateDataProvider are simultaneously available) and keeps the two
 * sides of the platform in sync in real time:
 *
 *   Recruiter publishes a job        -> Candidate can discover & apply
 *   Candidate applies to that job    -> Recruiter sees a new applicant
 *   Recruiter moves/shortlists/rejects the applicant
 *                                     -> Candidate's application status updates
 *   Recruiter schedules/reschedules/cancels an interview
 *                                     -> Candidate sees it on their side
 *   Recruiter <-> Candidate messages -> mirrored on both sides
 */
export default function PlatformBridge() {
  const recruiter = useRecruiterData();
  const candidate = useCandidateData();

  /* 1. Recruiter's published jobs become discoverable to the candidate */
  useEffect(() => {
    const companyName = recruiter.settings?.companyName || "Hiring Company";

    const mapped = recruiter.jobs
      .filter((job) => job.status === "Active")
      .map((job) => ({
        id: RECRUITER_JOB_ID_OFFSET + job.id,
        recruiterJobId: job.id,
        source: "recruiter",
        title: job.title,
        company: companyName,
        companyInitials: initialsFor(companyName),
        location: job.location || "Remote",
        locationType: job.remote || "On-site",
        type: job.type || "Full-time",
        experienceLevel: job.experienceLevel || "Mid",
        department: job.department,
        salaryMin: 0,
        salaryMax: 999,
        salaryLabel:
          job.salaryMin || job.salaryMax
            ? `${job.currency || "USD"} ${job.salaryMin || "—"} - ${
                job.salaryMax || "—"
              } / ${(job.salaryPeriod || "Year").toLowerCase()}`
            : "Not specified",
        postedDaysAgo: 0,
        deadlineDays: job.deadline
          ? Math.max(
              0,
              Math.round((new Date(job.deadline).getTime() - Date.now()) / 86400000)
            )
          : 30,
        skills: job.skills || [],
        applicants: job.applicants || 0,
        description: job.description || "",
        responsibilities: splitLines(job.responsibilities),
        requirements: splitLines(job.requirements),
        benefits: job.benefits || [],
        screeningQuestions: job.screeningQuestions || [],
        companyInfo: `${companyName} is hiring on CareerOS.`,
      }));

    candidate.syncJobsFromRecruiter(mapped);
    // candidate deliberately omitted: syncJobsFromRecruiter is stable (useCallback([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiter.jobs, recruiter.settings]);

  /* 2. New candidate applications to a recruiter-sourced job create a real applicant */
  useEffect(() => {
    candidate.applications.forEach((app) => {
      if (app.status === "Withdrawn") return;

      const job = candidate.getJob(app.jobId);
      if (!job || job.source !== "recruiter") return;

      const alreadyPushed = recruiter.candidates.some(
        (c) => c.sourceApplicationId === app.id
      );
      if (alreadyPushed) return;

      const fullName = `${candidate.profile.firstName || ""} ${
        candidate.profile.lastName || ""
      }`.trim() || "Candidate";

      // Include the candidate's primary resume (session-only — dataUrl is
      // never persisted to localStorage to avoid QuotaExceededError, same
      // rule as the candidate side).
      const primaryResume = candidate.resumes.find((r) => r.isPrimary);

      recruiter.addCandidate({
        name: fullName,
        email: candidate.profile.email,
        phone: candidate.profile.phone,
        location: candidate.profile.location,
        appliedFor: job.title,
        department: job.department,
        appliedDate: app.appliedDate,
        status: "Applied",
        rating: 0,
        skills: candidate.profile.skills || [],
        experience: Number(candidate.profile.yearsExperience) || 0,
        notes: "",
        sourceApplicationId: app.id,
        sourceJobId: job.recruiterJobId,
        // Resume metadata — resumeDataUrl is session-only
        resumeName: primaryResume?.name || null,
        resumeDataUrl: primaryResume?.dataUrl || null,
        resumeUploadedDate: primaryResume?.uploadedDate || null,
      });

      recruiter.incrementJobApplicants(job.recruiterJobId);

      recruiter.logActivity(
        `${fullName} applied for ${job.title}.`,
        "candidate"
      );

      recruiter.addNotification({
        type: "candidate",
        title: "New application received",
        message: `${fullName} applied for ${job.title}.`,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.applications, recruiter.candidates]);

  /* 3. Recruiter status / shortlist / rejection changes flow back to the candidate */
  useEffect(() => {
    recruiter.candidates.forEach((rc) => {
      if (!rc.sourceApplicationId) return;

      const app = candidate.applications.find((a) => a.id === rc.sourceApplicationId);
      if (!app || app.status === "Withdrawn") return;

      const mapped =
        rc.shortlisted && rc.status === "Applied"
          ? "Shortlisted"
          : STATUS_MAP[rc.status] || rc.status;

      if (mapped !== app.status) {
        candidate.receiveApplicationSync(app.id, mapped);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiter.candidates, candidate.applications]);

  /* 4. Recruiter interviews (scheduled / rescheduled / cancelled) sync to the candidate */
  useEffect(() => {
    recruiter.interviews.forEach((ri) => {
      // Match by sourceApplicationId first (set by CandidateDrawer schedule form).
      // Fall back to name matching for interviews scheduled via the main InterviewModal
      // which does not have access to the sourceApplicationId.
      let rc = ri.sourceApplicationId
        ? recruiter.candidates.find((c) => c.sourceApplicationId === ri.sourceApplicationId)
        : null;

      if (!rc) {
        // Name-match fallback: only use candidates that were created via the bridge
        // (have sourceApplicationId) to avoid false-positive matches on seed data.
        rc = recruiter.candidates.find(
          (c) => c.sourceApplicationId && c.name === ri.candidate
        );
      }

      if (!rc) return;

      const app = candidate.applications.find((a) => a.id === rc.sourceApplicationId);
      if (!app) return;

      candidate.receiveInterviewSync(app.id, app.jobId, ri);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiter.interviews, recruiter.candidates]);

  /* 5. Recruiter -> Candidate messages */
  useEffect(() => {
    const companyName = recruiter.settings?.companyName || "Hiring Company";
    const recruiterName = recruiter.settings?.recruiterName || "Recruiter";

    recruiter.messages.forEach((conv) => {
      const rc = recruiter.candidates.find(
        (c) => c.sourceApplicationId && c.name === conv.candidate
      );
      if (!rc) return;

      const incomingMessages = conv.messages.filter((m) => m.from === "recruiter");
      if (incomingMessages.length === 0) return;

      candidate.receiveMessagesSync({
        sourceConversationId: conv.id,
        company: companyName,
        recruiterName,
        initials: initialsFor(recruiterName),
        incomingMessages,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiter.messages, recruiter.candidates, recruiter.settings]);

  /* 6. Candidate -> Recruiter messages (replies) */
  useEffect(() => {
    candidate.conversations.forEach((conv) => {
      if (!conv.sourceConversationId) return;

      const myMessages = conv.thread.filter((m) => m.from === "me");
      const delivered = conv.deliveredToRecruiterCount || 0;
      const fresh = myMessages.slice(delivered);
      if (fresh.length === 0) return;

      fresh.forEach((m) => {
        recruiter.receiveCandidateMessage(
          `${candidate.profile.firstName || ""} ${candidate.profile.lastName || ""}`.trim() ||
            "Candidate",
          candidate.profile.email,
          m.text,
          conv.sourceConversationId
        );
      });

      candidate.markMessagesDeliveredToRecruiter(conv.id, myMessages.length);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.conversations]);

  /* 7. Candidate reschedule request → recruiter interview updated */
  useEffect(() => {
    candidate.interviews.forEach((ci) => {
      if (!ci.rescheduleRequest) return;

      // Find the recruiter candidate record that owns this interview
      const rc = recruiter.candidates.find(
        (c) => c.sourceApplicationId === ci.applicationId
      );
      if (!rc) return;

      // Find the matching recruiter interview by sourceApplicationId or candidate name
      const ri = recruiter.interviews.find(
        (i) =>
          (i.sourceApplicationId && i.sourceApplicationId === ci.applicationId) ||
          i.candidate === rc.name
      );
      if (!ri) return;

      const { date, time } = ci.rescheduleRequest;

      // Push the new date/time to the recruiter's interview record
      recruiter.rescheduleInterview(ri.id, { date, time });

      recruiter.logActivity(
        `${rc.name} requested a reschedule for ${ri.job || "interview"} to ${date} at ${time}.`,
        "interview"
      );

      recruiter.addNotification({
        type: "interview",
        title: "Reschedule request",
        message: `${rc.name} requested to reschedule their ${ri.job || "interview"} to ${date} at ${time}.`,
      });

      // Clear the flag so this effect doesn't re-fire
      candidate.clearRescheduleRequest(ci.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.interviews]);

  return null;
}
