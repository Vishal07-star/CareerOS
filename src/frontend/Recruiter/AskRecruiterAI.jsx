import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Users,
  BriefcaseBusiness,
  FileText,
  MessageSquareText,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";

const quickPrompts = [
  {
    icon: Users,
    title: "Find top candidates",
    prompt:
      "Which candidates should I prioritize for interviews?",
  },
  {
    icon: BriefcaseBusiness,
    title: "Analyze my jobs",
    prompt:
      "Which job has the strongest recruitment performance?",
  },
  {
    icon: FileText,
    title: "Interview questions",
    prompt:
      "Give me interview questions for a frontend engineer.",
  },
  {
    icon: MessageSquareText,
    title: "Write candidate message",
    prompt:
      "Write a professional interview invitation message.",
  },
];

export default function AskRecruiterAI() {
  const {
    candidates,
    jobs,
    stats,
  } = useRecruiterData();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi! I'm your Recruiter AI assistant. I can help analyze candidates, jobs, pipeline performance and create recruiting content.",
    },
  ]);

  const [input, setInput] = useState("");

  const topCandidates = useMemo(() => {
    return [...candidates]
      .filter((candidate) => candidate.status !== "Rejected")
      .sort((a, b) => {
        const aScore =
          a.rating * 2 + (a.experience || 0);
        const bScore =
          b.rating * 2 + (b.experience || 0);

        return bScore - aScore;
      })
      .slice(0, 3);
  }, [candidates]);

  const generateResponse = (question) => {
    const q = question.toLowerCase();

    if (
      q.includes("top candidate") ||
      q.includes("prioritize")
    ) {
      return `Based on rating, experience and current pipeline stage, I would prioritize ${topCandidates
        .map((candidate) => candidate.name)
        .join(
          ", "
        )}. These candidates currently have the strongest combined profile signals.`;
    }

    if (q.includes("job") || q.includes("performance")) {
      const bestJob = [...jobs].sort(
        (a, b) =>
          b.applicants / Math.max(b.views, 1) -
          a.applicants / Math.max(a.views, 1)
      )[0];

      return `Your strongest conversion currently appears to be "${bestJob?.title}". It has ${bestJob?.applicants || 0} applicants from ${bestJob?.views || 0} views. You currently have ${stats.activeJobs} active jobs.`;
    }

    if (
      q.includes("interview question") ||
      q.includes("frontend")
    ) {
      return `For a frontend engineer, consider asking: 1) How would you design a scalable React application? 2) How do you optimize rendering performance? 3) Explain a difficult frontend bug you solved. 4) How do you approach accessibility? 5) How would you structure state management for a large application?`;
    }

    if (
      q.includes("message") ||
      q.includes("invitation")
    ) {
      return `Candidate message:\n\nHi [Candidate Name],\n\nThank you for your interest in the [Job Title] position. We'd like to invite you to the next stage of our interview process. Please let us know your availability and we'll arrange a convenient time.\n\nBest,\nHR Team`;
    }

    if (
      q.includes("summary") ||
      q.includes("dashboard")
    ) {
      return `Recruitment summary: you currently have ${stats.activeJobs} active jobs, ${stats.totalApplicants} applicants, ${stats.upcomingInterviews} upcoming interviews and ${stats.hired} hires. I recommend focusing on candidates currently in Screening and Interview stages.`;
    }

    return `I can help with candidate ranking, job performance, interview questions, candidate messages and recruitment analytics. Try asking me about your top candidates or hiring funnel.`;
  };

  const submit = (question = input) => {
    if (!question.trim()) return;

    const response = generateResponse(question);

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text: question,
      },
      {
        role: "assistant",
        text: response,
      },
    ]);

    setInput("");
  };

  return (
    <div className="page-container ai-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">AI Recruiting Assistant</p>
          <h1>
            <Sparkles size={28} />
            Ask Recruiter AI
          </h1>
          <p className="page-subtitle">
            Analyze your recruiting data and generate hiring
            content.
          </p>
        </div>
      </div>

      <div className="ai-layout">
        <section className="ai-chat panel">
          <div className="ai-chat-header">
            <div className="ai-bot-avatar">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>Recruiter AI</strong>
              <span>Recruitment assistant</span>
            </div>

            <span className="ai-online">
              <i />
              Ready
            </span>
          </div>

          <div className="ai-messages">
            {messages.map((message, index) => (
              <div
                className={`ai-message ${
                  message.role === "user" ? "user" : ""
                }`}
                key={index}
              >
                <div className="message-icon">
                  {message.role === "user" ? (
                    <User size={15} />
                  ) : (
                    <Bot size={15} />
                  )}
                </div>

                <div className="message-content">
                  {message.text.split("\n").map((line, i) => (
                    <p key={i}>{line || "\u00a0"}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <form
            className="ai-composer"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about candidates, jobs or interviews..."
            />

            <button type="submit">
              <Send size={17} />
            </button>
          </form>
        </section>

        <aside className="ai-sidebar">
          <div className="panel">
            <h3>Try asking</h3>

            <div className="quick-prompts">
              {quickPrompts.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() => submit(item.prompt)}
                  >
                    <Icon size={17} />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel ai-data-card">
            <div className="ai-data-icon">
              <Sparkles size={18} />
            </div>

            <h3>AI data context</h3>

            <p>
              The assistant can analyze your current recruiter
              dashboard data stored in this application.
            </p>

            <div className="ai-context-stats">
              <div>
                <strong>{stats.activeJobs}</strong>
                <span>Active jobs</span>
              </div>

              <div>
                <strong>{candidates.length}</strong>
                <span>Candidates</span>
              </div>

              <div>
                <strong>{stats.totalApplicants}</strong>
                <span>Applicants</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}