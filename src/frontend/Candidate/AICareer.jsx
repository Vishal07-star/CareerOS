import { useState } from "react";
import { Bot, Sparkles, Send, User, Briefcase, FileUser, Target } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";

const QUICK_PROMPTS = [
  { icon: FileUser, title: "Improve my profile", prompt: "How can I improve my profile?" },
  { icon: Briefcase, title: "Which jobs fit me?", prompt: "Which saved or applied jobs fit me best?" },
  { icon: Target, title: "Interview tips", prompt: "Give me tips for my next interview." },
];

export default function AICareer() {
  const { stats, profile, applications, savedJobIds, interviews } = useCandidateData();

  const tips = [
    `You're ${stats.profileCompletion}% done with your profile — finishing it usually boosts recruiter views.`,
    profile.skills.length < 6 ? "Add 2-3 more in-demand skills to widen your job matches." : "Your skill set looks strong for your target roles.",
    stats.savedJobs > 0 ? `You have ${stats.savedJobs} saved job${stats.savedJobs > 1 ? "s" : ""} — consider applying before the deadlines pass.` : "Save jobs you're interested in so I can help you prioritize applications.",
  ];

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI Career assistant. Ask me about your profile, applications, or how to prepare for an upcoming interview.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const generateResponse = (question) => {
    const q = question.toLowerCase();

    if (q.includes("profile") || q.includes("improve")) {
      if (profile.skills.length < 6) {
        return `Your profile is ${stats.profileCompletion}% complete. Adding a few more skills (you currently list ${profile.skills.length}) is the fastest way to widen your job matches.`;
      }
      return `Your profile is ${stats.profileCompletion}% complete and your skill list looks solid. Consider adding a portfolio link or a short summary if you haven't already.`;
    }

    if (q.includes("job") || q.includes("fit") || q.includes("match")) {
      if (savedJobIds.length === 0 && applications.length === 0) {
        return "You haven't saved or applied to any jobs yet. Head to Find Jobs and save a few roles — I can help you compare them once you do.";
      }
      return `You have ${savedJobIds.length} saved job${savedJobIds.length === 1 ? "" : "s"} and ${applications.length} application${applications.length === 1 ? "" : "s"} in progress. Focus your prep time on the ones closest to a decision — check My Applications for the current stage of each.`;
    }

    if (q.includes("interview") || q.includes("prepare") || q.includes("tips")) {
      const upcoming = interviews.find((i) => i.status === "Scheduled");
      if (upcoming) {
        return `Your next interview is a ${upcoming.type} on ${upcoming.date} at ${upcoming.time}. Review the job description again, prepare 2-3 questions to ask, and practice explaining your most relevant project out loud.`;
      }
      return "You don't have an interview scheduled yet. A good way to prepare in the meantime is to practice explaining one project end-to-end, including the impact it had.";
    }

    return "I can help with your profile strength, job matches, and interview prep. Try asking me about one of those.";
  };

  const submit = (question = input) => {
    if (!question.trim() || thinking) return;

    setMessages((old) => [...old, { role: "user", text: question }]);
    setInput("");
    setThinking(true);

    // Simulated thinking delay for a realistic loading state — this stays
    // entirely local/frontend, no network call is made.
    setTimeout(() => {
      setMessages((old) => [...old, { role: "assistant", text: generateResponse(question) }]);
      setThinking(false);
    }, 500);
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">AI CAREER ASSISTANT</p>
          <h1>AI Career</h1>
          <p>Personalized, lightweight guidance based on your current profile and activity.</p>
        </div>
      </div>

      <div className="co-section-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span className="co-file-icon" style={{ width: 44, height: 44 }}><Bot size={20} /></span>
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Today's suggestions</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--co-ink-soft)", fontSize: 13.5, lineHeight: 1.9 }}>
            {tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </div>

      <div className="co-section-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--co-line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="co-file-icon" style={{ width: 32, height: 32 }}><Sparkles size={16} /></span>
          <strong style={{ fontSize: 13.5 }}>Ask AI Career</strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 20px", maxHeight: 320, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`co-msg-bubble ${m.role === "user" ? "co-msg-me" : "co-msg-them"}`}
              style={{ display: "flex", gap: 6, alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}
            >
              {m.role !== "user" && <Bot size={13} style={{ flexShrink: 0, marginTop: 2 }} />}
              <span>{m.text}</span>
              {m.role === "user" && <User size={13} style={{ flexShrink: 0, marginTop: 2 }} />}
            </div>
          ))}
          {thinking && (
            <div className="co-msg-bubble co-msg-them" style={{ alignSelf: "flex-start", opacity: 0.7 }}>
              Thinking…
            </div>
          )}
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          <div className="quick-prompts" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.title}
                className="outline-button"
                style={{ fontSize: 12 }}
                onClick={() => submit(item.prompt)}
                disabled={thinking}
              >
                <item.icon size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
                {item.title}
              </button>
            ))}
          </div>

          <form
            className="co-thread-input"
            style={{ padding: 0, borderTop: "none" }}
            onSubmit={(e) => { e.preventDefault(); submit(); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your profile, jobs, or interviews…"
              aria-label="Ask AI Career"
            />
            <button type="submit" disabled={thinking || !input.trim()} aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="co-empty-state">
        <div className="co-empty-icon"><Sparkles size={22} /></div>
        <h3>More AI features coming soon</h3>
        <p>Resume tailoring, mock interviews, and personalized coaching are on the way.</p>
      </div>
    </section>
  );
}
