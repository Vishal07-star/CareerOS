import React, { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";

export default function Messages() {
  const {
    messages,
    sendMessage,
    markMessageRead,
  } = useRecruiterData();
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState(
    messages[0]?.id
  );
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");

  const filtered = messages.filter((message) =>
    `${message.candidate} ${message.lastMessage}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selected =
    messages.find((message) => message.id === selectedId) ||
    filtered[0];

  const submit = (event) => {
    event.preventDefault();

    if (!selected || !text.trim()) return;

    sendMessage(selected.id, text);
    setText("");
  };

  return (
    <div className="page-container messages-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Communication</p>
          <h1>Messages</h1>
          <p className="page-subtitle">
            Communicate with candidates from one place.
          </p>
        </div>
      </div>

      <div className="messages-layout panel">
        <aside className="conversation-list">
          <div className="conversation-search search-field">
            <Search size={16} />
            <input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.map((conversation) => (
            <button
              className={`conversation-item ${
                selected?.id === conversation.id
                  ? "selected"
                  : ""
              }`}
              key={conversation.id}
              onClick={() => {
                setSelectedId(conversation.id);
                markMessageRead(conversation.id);
              }}
            >
              <div className="candidate-avatar">
                {conversation.avatar}
              </div>

              <div className="conversation-content">
                <strong>{conversation.candidate}</strong>
                <span>{conversation.lastMessage}</span>
              </div>

              <div className="conversation-time">
                <small>{conversation.time}</small>
                {conversation.unread && (
                  <span className="unread-dot" aria-label="Unread messages" />
                )}
              </div>
            </button>
          ))}
        </aside>

        <section className="chat-window">
          {selected ? (
            <>
              <header className="chat-header">
                <div className="person-cell">
                  <div className="candidate-avatar">
                    {selected.avatar}
                  </div>

                  <div>
                    <strong>{selected.candidate}</strong>
                    <span>{selected.email}</span>
                  </div>
                </div>

                <button
                  className="icon-button"
                  aria-label="More options"
                  onClick={() =>
                    window.open(`mailto:${selected.email}`, "_blank")
                  }
                  title="Email candidate directly"
                >
                  <MoreVertical size={19} />
                </button>
              </header>

              <div className="chat-messages">
                {selected.messages.map((message, index) => (
                  <div
                    className={`chat-bubble-row ${
                      message.from === "recruiter"
                        ? "mine"
                        : ""
                    }`}
                    key={index}
                  >
                    <div className="chat-bubble">
                      <p>{message.text}</p>
                      <small>{message.time}</small>
                    </div>
                  </div>
                ))}
              </div>

              <form className="message-composer" onSubmit={submit}>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Attach file"
                  onClick={() =>
                    showToast("Attachments aren't supported yet.", "info")
                  }
                >
                  <Paperclip size={18} />
                </button>

                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message..."
                  aria-label="Message text"
                />

                <button
                  className="send-button"
                  type="submit"
                  disabled={!text.trim()}
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
}