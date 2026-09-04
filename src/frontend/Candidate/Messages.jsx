import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";

export default function Messages() {
  const { conversations, sendMessage, timeAgo } = useCandidateData();
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [draft, setDraft] = useState("");
  const bodyRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [active?.thread?.length, activeId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    sendMessage(activeId, draft.trim());
    setDraft("");
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">STAY IN TOUCH</p>
          <h1>Messages</h1>
          <p>Chat with recruiters and companies about your applications.</p>
        </div>
      </div>

      <div className="co-messages-layout">
        <div className="co-conv-list">
          {conversations.map((c) => {
            const last = c.thread[c.thread.length - 1];
            const unread = last && last.from === "them";
            return (
              <div key={c.id} className={`co-conv-item ${activeId === c.id ? "active" : ""}`} onClick={() => setActiveId(c.id)}>
                <div className="co-conv-avatar">{c.initials}</div>
                <div className="co-conv-info">
                  <div className="co-conv-info-top">
                    <strong>{c.company}</strong>
                    {last && <span>{timeAgo(last.timestamp)}</span>}
                  </div>
                  <p>{last ? last.text : "No messages yet"}</p>
                </div>
                {unread && <span className="co-conv-unread-dot" />}
              </div>
            );
          })}
        </div>

        <div className="co-thread-panel">
          {active ? (
            <>
              <div className="co-thread-head">
                <div className="co-conv-avatar">{active.initials}</div>
                <div>
                  <strong>{active.recruiterName}</strong>
                  <span>{active.company}</span>
                </div>
              </div>
              <div className="co-thread-body" ref={bodyRef}>
                {active.thread.map((m) => (
                  <div key={m.id} className={`co-msg-bubble ${m.from === "me" ? "co-msg-me" : "co-msg-them"}`}>
                    {m.text}
                    <span className="co-msg-time">{new Date(m.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
              <form className="co-thread-input" onSubmit={handleSend}>
                <input placeholder="Write a message…" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button type="submit" aria-label="Send message"><Send size={16} /></button>
              </form>
            </>
          ) : (
            <div className="co-thread-empty"><MessageSquare size={18} style={{ marginRight: 8 }} /> Select a conversation</div>
          )}
        </div>
      </div>
    </section>
  );
}
