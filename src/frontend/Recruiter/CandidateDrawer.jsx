import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarClock,
  Star,
  FileText,
  Bookmark,
  BookmarkCheck,
  UserX,
  ArrowRight,
  Send,
  Lock,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import { useRecruiterData, PIPELINE_STAGES } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";

const statusClass = {
  Applied: "blue",
  Screening: "yellow",
  Interview: "purple",
  Offer: "green",
  Hired: "green",
  Rejected: "red",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CandidateDrawer({ candidate, onClose }) {
  const {
    updateCandidate,
    updateCandidateStatus,
    toggleShortlist,
    rejectCandidate,
    scheduleInterviewForCandidate,
    logActivity,
    addNotification,
    addCandidateNote,
    updateCandidateNote,
    deleteCandidateNote,
  } = useRecruiterData();

  const { showToast } = useToast();

  const [noteDraft, setNoteDraft] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [confirmDeleteNote, setConfirmDeleteNote] = useState(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "Technical Interview",
    interviewer: "",
    meetingLink: "",
  });

  if (!candidate) return null;

  const stageIndex = PIPELINE_STAGES.indexOf(candidate.status);
  const isRejected = candidate.status === "Rejected";

  const saveNote = () => {
    if (!noteDraft.trim()) return;
    addCandidateNote(candidate.id, noteDraft);
    setNoteDraft("");
    showToast("Note added.", "success");
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingDraft(note.content);
  };

  const saveEditNote = (noteId) => {
    if (!editingDraft.trim()) return;
    updateCandidateNote(candidate.id, noteId, editingDraft.trim());
    setEditingNoteId(null);
    setEditingDraft("");
    showToast("Note updated.", "success");
  };

  const confirmDeleteNoteAction = () => {
    if (!confirmDeleteNote) return;
    deleteCandidateNote(candidate.id, confirmDeleteNote);
    setConfirmDeleteNote(null);
    showToast("Note deleted.", "success");
  };

  const advanceStage = () => {
    if (stageIndex < 0 || stageIndex >= PIPELINE_STAGES.length - 1) return;

    const next = PIPELINE_STAGES[stageIndex + 1];
    updateCandidateStatus(candidate.id, next);
    logActivity(`${candidate.name} moved to ${next}.`, "candidate");
    addNotification({
      type: "candidate",
      title: "Stage updated",
      message: `${candidate.name} moved to ${next}.`,
    });
    showToast(`Moved ${candidate.name} to ${next}.`, "success");
  };

  const changeStage = (value) => {
    if (value === candidate.status) return;

    updateCandidateStatus(candidate.id, value);
    logActivity(`${candidate.name} moved to ${value}.`, "candidate");
    addNotification({
      type: "candidate",
      title: "Stage updated",
      message: `${candidate.name} moved to ${value}.`,
    });
    showToast(`Moved ${candidate.name} to ${value}.`, "success");
  };

  const handleReject = () => {
    rejectCandidate(candidate.id);
    showToast(`${candidate.name} was rejected.`, "info");
    setConfirmReject(false);
    onClose();
  };

  const handleShortlist = () => {
    toggleShortlist(candidate.id);
    showToast(
      candidate.shortlisted
        ? `Removed ${candidate.name} from shortlist.`
        : `${candidate.name} added to shortlist.`,
      "success"
    );
  };

  const submitSchedule = (event) => {
    event.preventDefault();

    if (!scheduleForm.date || !scheduleForm.time) {
      showToast("Pick a date and time for the interview.", "error");
      return;
    }

    scheduleInterviewForCandidate(candidate.name, {
      candidate: candidate.name,
      email: candidate.email,
      job: candidate.appliedFor,
      department: candidate.department,
      date: scheduleForm.date,
      time: scheduleForm.time,
      duration: "45 min",
      interviewer: scheduleForm.interviewer || "Unassigned",
      type: scheduleForm.type,
      meetingLink: scheduleForm.meetingLink.trim(),
      notes: "",
      // sourceApplicationId lets PlatformBridge Effect 4 match by ID
      // instead of falling back to the error-prone name match.
      sourceApplicationId: candidate.sourceApplicationId || null,
    });

    logActivity(
      `Interview scheduled with ${candidate.name} for ${candidate.appliedFor}.`,
      "interview"
    );
    addNotification({
      type: "interview",
      title: "Interview scheduled",
      message: `${scheduleForm.type} with ${candidate.name} on ${scheduleForm.date}.`,
    });

    showToast(`Interview scheduled with ${candidate.name}.`, "success");
    setShowSchedule(false);
    setScheduleForm({
      date: "",
      time: "",
      type: "Technical Interview",
      interviewer: "",
      meetingLink: "",
    });
  };

  return (
    <div className="modal-backdrop drawer-backdrop" onClick={onClose}>
      <aside
        className="candidate-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`${candidate.name} candidate profile`}
      >
        <div className="drawer-header">
          <div className="person-cell">
            <div className="candidate-avatar large">
              {initials(candidate.name)}
            </div>

            <div>
              <h2>{candidate.name}</h2>
              <p>{candidate.appliedFor}</p>
            </div>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close candidate profile"
          >
            <X size={19} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-status-row">
            <span className={`status-badge ${statusClass[candidate.status] || "blue"}`}>
              {candidate.status}
            </span>

            {candidate.shortlisted && (
              <span className="status-badge purple">
                <BookmarkCheck size={12} /> Shortlisted
              </span>
            )}

            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={star <= candidate.rating ? "star active" : "star"}
                  onClick={() =>
                    updateCandidate(candidate.id, { rating: star })
                  }
                  aria-label={`Rate ${star} star`}
                >
                  <Star size={14} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>

          {!isRejected && (
            <div className="stage-tracker">
              {PIPELINE_STAGES.map((stage, index) => (
                <div
                  key={stage}
                  className={`stage-tracker-step ${
                    index <= stageIndex ? "done" : ""
                  } ${index === stageIndex ? "current" : ""}`}
                >
                  <span className="stage-dot" />
                  <span className="stage-label">{stage}</span>
                </div>
              ))}
            </div>
          )}

          <div className="candidate-details">
            <div>
              <span>
                <Mail size={13} /> Email
              </span>
              <strong>{candidate.email}</strong>
            </div>

            <div>
              <span>
                <Phone size={13} /> Phone
              </span>
              <strong>{candidate.phone || "—"}</strong>
            </div>

            <div>
              <span>
                <MapPin size={13} /> Location
              </span>
              <strong>{candidate.location}</strong>
            </div>

            <div>
              <span>
                <Briefcase size={13} /> Experience
              </span>
              <strong>{candidate.experience || 0} years</strong>
            </div>

            <div>
              <span>
                <CalendarClock size={13} /> Applied
              </span>
              <strong>{candidate.appliedDate}</strong>
            </div>

            <div>
              <span>
                <FileText size={13} /> Resume
              </span>
              {candidate.resumeDataUrl ? (
                <a
                  className="text-button"
                  href={candidate.resumeDataUrl}
                  download={candidate.resumeName || "resume"}
                  aria-label={`Download ${candidate.resumeName || "resume"}`}
                >
                  {candidate.resumeName || "Download resume"}
                </a>
              ) : candidate.resumeName ? (
                <span className="muted-text" style={{ fontSize: 12 }}>
                  {candidate.resumeName} &mdash; session only, re-upload to access
                </span>
              ) : (
                <span className="muted-text" style={{ fontSize: 12 }}>Not provided</span>
              )}
            </div>
          </div>

          {candidate.skills?.length > 0 && (
            <div className="skill-list">
              {candidate.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          )}

          <div className="notes-section">
            <div className="notes-section-heading">
              <Lock size={13} />
              <span>Private recruiter note — not visible to candidate.</span>
            </div>

            <div className="note-list">
              {(candidate.notesList || []).length === 0 && (
                <p className="muted-text">No notes yet. Add one below.</p>
              )}

              {(candidate.notesList || []).map((note) => (
                <div className="note-item" key={note.id}>
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        rows="3"
                        value={editingDraft}
                        onChange={(e) => setEditingDraft(e.target.value)}
                        autoFocus
                      />
                      <div className="note-item-actions">
                        <button
                          className="text-button"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => saveEditNote(note.id)}
                        >
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{note.content}</p>
                      <div className="note-item-meta">
                        <span>
                          {note.author} ·{" "}
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {note.editedDate && " (edited)"}
                        </span>

                        <div className="note-item-actions">
                          <button
                            className="icon-button"
                            onClick={() => startEditNote(note)}
                            aria-label="Edit note"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="icon-button danger"
                            onClick={() => setConfirmDeleteNote(note.id)}
                            aria-label="Delete note"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <label className="drawer-notes">
              Add a note
              <textarea
                rows="3"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Add private notes about this candidate…"
              />
            </label>

            <button className="secondary-button drawer-save" onClick={saveNote}>
              <Plus size={15} />
              Add note
            </button>
          </div>

          {showSchedule && (
            <form className="drawer-schedule-form" onSubmit={submitSchedule}>
              <h3>Schedule interview</h3>

              <div className="form-grid">
                <label>
                  Date
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(event) =>
                      setScheduleForm((f) => ({
                        ...f,
                        date: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Time
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(event) =>
                      setScheduleForm((f) => ({
                        ...f,
                        time: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Interview type
                  <select
                    value={scheduleForm.type}
                    onChange={(event) =>
                      setScheduleForm((f) => ({
                        ...f,
                        type: event.target.value,
                      }))
                    }
                  >
                    <option>Technical Interview</option>
                    <option>Portfolio Review</option>
                    <option>Hiring Manager</option>
                    <option>Final Interview</option>
                  </select>
                </label>

                <label>
                  Interviewer
                  <input
                    type="text"
                    placeholder="e.g. Sarah Wilson"
                    value={scheduleForm.interviewer}
                    onChange={(event) =>
                      setScheduleForm((f) => ({
                        ...f,
                        interviewer: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Meeting link
                <input
                  type="url"
                  placeholder="https://meet.example.com/..."
                  value={scheduleForm.meetingLink}
                  onChange={(event) =>
                    setScheduleForm((f) => ({
                      ...f,
                      meetingLink: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowSchedule(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  <Send size={15} />
                  Confirm interview
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="drawer-footer">
          <button className="secondary-button" onClick={handleShortlist}>
            {candidate.shortlisted ? (
              <>
                <BookmarkCheck size={16} /> Shortlisted
              </>
            ) : (
              <>
                <Bookmark size={16} /> Shortlist
              </>
            )}
          </button>

          {!isRejected && (
            <button
              className="secondary-button"
              onClick={() => setShowSchedule((v) => !v)}
            >
              <CalendarClock size={16} />
              Schedule interview
            </button>
          )}

          {!isRejected && stageIndex >= 0 && stageIndex < PIPELINE_STAGES.length - 1 && (
            <button className="primary-button" onClick={advanceStage}>
              Advance to {PIPELINE_STAGES[stageIndex + 1]}
              <ArrowRight size={15} />
            </button>
          )}

          {!isRejected && (
            <button
              className="danger-button"
              onClick={() => setConfirmReject(true)}
            >
              <UserX size={16} />
              Reject
            </button>
          )}

          {!isRejected && (
            <select
              className="inline-select stage-select"
              value={candidate.status}
              onChange={(event) => changeStage(event.target.value)}
              aria-label="Move to stage"
            >
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          )}
        </div>
      </aside>

      {confirmReject && (
        <ConfirmDialog
          title="Reject this candidate?"
          message={`${candidate.name} will be moved to Rejected and removed from any shortlist. This can be undone later from the Candidates page.`}
          confirmLabel="Reject candidate"
          onConfirm={handleReject}
          onCancel={() => setConfirmReject(false)}
        />
      )}

      {confirmDeleteNote && (
        <ConfirmDialog
          title="Delete this note?"
          message="This private recruiter note will be permanently deleted. This can't be undone."
          confirmLabel="Delete note"
          tone="danger"
          onConfirm={confirmDeleteNoteAction}
          onCancel={() => setConfirmDeleteNote(null)}
        />
      )}
    </div>
  );
}
