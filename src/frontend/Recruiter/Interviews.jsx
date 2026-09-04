import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  CalendarDays,
  Clock,
  Video,
  Trash2,
  CheckCircle2,
  X,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  UserX,
  RotateCcw,
  Ban,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import "./InterviewCalendar.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, count) {
  const d = new Date(date);
  d.setDate(d.getDate() + count);
  return d;
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function buildMonthGrid(anchor) {
  const firstOfMonth = startOfMonth(anchor);
  const gridStart = startOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function buildWeek(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function downloadICS(interview) {
  const start = interview.date.replace(/-/g, "") + "T" + interview.time.replace(":", "") + "00";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${interview.type} — ${interview.candidate}`,
    `DTSTART:${start}`,
    `DESCRIPTION:Interview for ${interview.job} with ${interview.interviewer}.`,
    interview.meetingLink ? `LOCATION:${interview.meetingLink}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${interview.candidate.replace(/\s+/g, "-")}-interview.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

const STATUS_TONE = {
  Scheduled: "blue",
  Pending: "yellow",
  Completed: "green",
  Cancelled: "red",
  "No-show": "red",
};

export default function Interviews({ createMode = false }) {
  const {
    interviews,
    candidates,
    addInterview,
    updateInterview,
    deleteInterview,
    rescheduleInterview,
    cancelInterview,
  } = useRecruiterData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState("list");
  const [calendarView, setCalendarView] = useState("Month");
  const [anchor, setAnchor] = useState(new Date());

  const [showForm, setShowForm] = useState(createMode);
  const [details, setDetails] = useState(null);
  const [reschedule, setReschedule] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const today = toISODate(new Date());

  const sorted = [...interviews].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  const interviewsByDate = useMemo(() => {
    const map = {};
    interviews.forEach((interview) => {
      if (!map[interview.date]) map[interview.date] = [];
      map[interview.date].push(interview);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [interviews]);

  const goPrev = () => {
    if (calendarView === "Month") setAnchor((a) => addMonths(a, -1));
    else if (calendarView === "Week") setAnchor((a) => addDays(a, -7));
    else setAnchor((a) => addDays(a, -1));
  };

  const goNext = () => {
    if (calendarView === "Month") setAnchor((a) => addMonths(a, 1));
    else if (calendarView === "Week") setAnchor((a) => addDays(a, 7));
    else setAnchor((a) => addDays(a, 1));
  };

  const goToday = () => setAnchor(new Date());

  const rangeLabel = useMemo(() => {
    if (calendarView === "Month") {
      return anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (calendarView === "Week") {
      const week = buildWeek(anchor);
      const start = week[0];
      const end = week[6];
      const sameMonth = start.getMonth() === end.getMonth();
      return sameMonth
        ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}`
        : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
    }
    return anchor.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [calendarView, anchor]);

  const monthGrid = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const weekDays = useMemo(() => buildWeek(anchor), [anchor]);

  const monthAgenda = useMemo(() => {
    return sorted.filter((i) => {
      const d = new Date(i.date + "T00:00:00");
      return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear();
    });
  }, [sorted, anchor]);

  const openDay = (date) => {
    setAnchor(date);
    setCalendarView("Day");
  };

  const openDetails = (interview) => setDetails(interview);

  const startReschedule = (interview) => {
    setReschedule({ date: interview.date, time: interview.time });
    setDetails(interview);
  };

  const saveReschedule = () => {
    if (!details || !reschedule) return;
    rescheduleInterview(details.id, reschedule);
    showToast("Interview rescheduled.", "success");
    setReschedule(null);
    setDetails(null);
  };

  const handleCancelInterview = () => {
    if (!confirmCancel) return;
    cancelInterview(confirmCancel.id);
    showToast("Interview cancelled.", "success");
    setConfirmCancel(null);
    setDetails(null);
  };

  const handleDeleteInterview = () => {
    if (!confirmDelete) return;
    deleteInterview(confirmDelete.id);
    showToast("Interview deleted.", "success");
    setConfirmDelete(null);
    setDetails(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Scheduling</p>
          <h1>Interviews</h1>
          <p className="page-subtitle">
            Manage interviews, interviewers and meeting links.
          </p>
        </div>

        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={17} />
          Schedule Interview
        </button>
      </div>

      <div className="interview-summary-grid">
        <Summary label="Scheduled" value={interviews.filter((x) => x.status === "Scheduled").length} />
        <Summary label="Pending" value={interviews.filter((x) => x.status === "Pending").length} />
        <Summary label="Completed" value={interviews.filter((x) => x.status === "Completed").length} />
        <Summary label="Today" value={interviews.filter((x) => x.date === today).length} />
      </div>

      <div className="view-toggle-row">
        <div className="segmented-control">
          <button
            className={mode === "list" ? "active" : ""}
            onClick={() => setMode("list")}
          >
            <List size={14} /> List
          </button>
          <button
            className={mode === "calendar" ? "active" : ""}
            onClick={() => setMode("calendar")}
          >
            <CalendarIcon size={14} /> Calendar
          </button>
        </div>

        {mode === "calendar" && (
          <div className="segmented-control">
            {["Day", "Week", "Month"].map((v) => (
              <button
                key={v}
                className={calendarView === v ? "active" : ""}
                onClick={() => setCalendarView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "list" ? (
        <div className="panel">
          <div className="interview-table">
            {sorted.length === 0 && (
              <div className="empty-state">
                <h3>No interviews scheduled</h3>
                <p>Schedule your first interview to see it here.</p>
              </div>
            )}

            {sorted.map((interview) => (
              <div
                className="interview-card"
                key={interview.id}
                onClick={() => openDetails(interview)}
              >
                <div className="interview-date">
                  <CalendarDays size={20} />
                  <strong>{interview.date}</strong>
                  <span>{interview.time}</span>
                </div>

                <div className="interview-person">
                  <div className="candidate-avatar">
                    {interview.candidate.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                  </div>

                  <div>
                    <strong>{interview.candidate}</strong>
                    <span>{interview.job}</span>
                  </div>
                </div>

                <div className="interview-type">
                  <strong>{interview.type}</strong>
                  <span>
                    <Clock size={13} />
                    {interview.duration}
                  </span>
                </div>

                <div>
                  <span className="muted-text">Interviewer</span>
                  <strong className="block-text">{interview.interviewer}</strong>
                </div>

                <span className={`status-badge ${STATUS_TONE[interview.status] || "blue"}`}>
                  {interview.status}
                </span>

                <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                  {interview.meetingLink && (
                    <a
                      className="row-action"
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video size={16} />
                    </a>
                  )}

                  {interview.status !== "Completed" && interview.status !== "Cancelled" && (
                    <button
                      className="row-action"
                      onClick={() => updateInterview(interview.id, { status: "Completed" })}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}

                  <button
                    className="row-action danger-action"
                    onClick={() => setConfirmDelete(interview)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="panel calendar-panel">
          <div className="calendar-nav">
            <div className="calendar-nav-controls">
              <button className="icon-button" onClick={goPrev} aria-label="Previous">
                <ChevronLeft size={18} />
              </button>
              <button className="secondary-button calendar-today-btn" onClick={goToday}>
                Today
              </button>
              <button className="icon-button" onClick={goNext} aria-label="Next">
                <ChevronRight size={18} />
              </button>
            </div>

            <h2 className="calendar-range-label">{rangeLabel}</h2>
          </div>

          {calendarView === "Month" && (
            <>
              <div className="calendar-month-grid">
                <div className="calendar-weekday-row">
                  {WEEKDAY_LABELS.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="calendar-month-cells">
                  {monthGrid.map((date) => {
                    const dateStr = toISODate(date);
                    const dayInterviews = interviewsByDate[dateStr] || [];
                    const inMonth = date.getMonth() === anchor.getMonth();
                    const isToday = dateStr === today;

                    return (
                      <div
                        key={dateStr}
                        className={`calendar-cell ${inMonth ? "" : "outside"} ${isToday ? "today" : ""}`}
                        onClick={() => openDay(date)}
                      >
                        <span className="calendar-cell-date">{date.getDate()}</span>

                        <div className="calendar-cell-pills">
                          {dayInterviews.slice(0, 2).map((interview) => (
                            <button
                              key={interview.id}
                              className={`calendar-pill tone-${STATUS_TONE[interview.status] || "blue"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetails(interview);
                              }}
                            >
                              {interview.time} {interview.candidate.split(" ")[0]}
                            </button>
                          ))}

                          {dayInterviews.length > 2 && (
                            <span className="calendar-more">+{dayInterviews.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="calendar-agenda">
                {monthAgenda.length === 0 && (
                  <p className="muted-text">No interviews this month.</p>
                )}

                {monthAgenda.map((interview) => (
                  <AgendaRow key={interview.id} interview={interview} onOpen={openDetails} />
                ))}
              </div>
            </>
          )}

          {calendarView === "Week" && (
            <div className="calendar-week-grid">
              {weekDays.map((date) => {
                const dateStr = toISODate(date);
                const dayInterviews = interviewsByDate[dateStr] || [];
                const isToday = dateStr === today;

                return (
                  <div className={`calendar-week-column ${isToday ? "today" : ""}`} key={dateStr}>
                    <div className="calendar-week-column-head">
                      <span>{WEEKDAY_LABELS[date.getDay()]}</span>
                      <strong>{date.getDate()}</strong>
                    </div>

                    <div className="calendar-week-column-body">
                      {dayInterviews.length === 0 && (
                        <p className="muted-text calendar-week-empty">No interviews</p>
                      )}

                      {dayInterviews.map((interview) => (
                        <button
                          key={interview.id}
                          className={`calendar-pill block tone-${STATUS_TONE[interview.status] || "blue"}`}
                          onClick={() => openDetails(interview)}
                        >
                          <strong>{interview.time}</strong>
                          <span>{interview.candidate}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {calendarView === "Day" && (
            <div className="calendar-agenda calendar-day-agenda">
              {(interviewsByDate[toISODate(anchor)] || []).length === 0 && (
                <div className="empty-state small">
                  <h3>No interviews on this day</h3>
                  <p>Schedule one to see it here.</p>
                </div>
              )}

              {(interviewsByDate[toISODate(anchor)] || []).map((interview) => (
                <AgendaRow key={interview.id} interview={interview} onOpen={openDetails} />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <InterviewModal
          candidates={candidates}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            addInterview(data);
            showToast("Interview scheduled.", "success");
            setShowForm(false);
          }}
        />
      )}

      {details && !reschedule && (
        <div className="modal-backdrop" onMouseDown={() => setDetails(null)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{details.candidate}</h2>
                <p>{details.job}</p>
              </div>

              <button className="icon-button" onClick={() => setDetails(null)} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            <div className="candidate-details">
              <div>
                <span>Date</span>
                <strong>{details.date}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{details.time}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{details.type}</strong>
              </div>
              <div>
                <span>Interviewer</span>
                <strong>{details.interviewer}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{details.duration}</strong>
              </div>
              <div>
                <span>Status</span>
                <span className={`status-badge ${STATUS_TONE[details.status] || "blue"}`}>
                  {details.status}
                </span>
              </div>
            </div>

            {details.notes && (
              <p className="block-text" style={{ marginTop: 4 }}>{details.notes}</p>
            )}

            <div className="modal-actions interview-detail-actions">
              {details.meetingLink && details.status !== "Cancelled" && (
                <a
                  className="secondary-button"
                  href={details.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Video size={15} /> Join Meeting
                </a>
              )}

              <button className="secondary-button" onClick={() => downloadICS(details)}>
                <Download size={15} /> Add to Calendar
              </button>

              <button
                className="secondary-button"
                onClick={() => navigate("/recruiter/messages")}
              >
                <MessageSquare size={15} /> Message Candidate
              </button>

              {details.status !== "Completed" && details.status !== "Cancelled" && (
                <button className="secondary-button" onClick={() => startReschedule(details)}>
                  <RotateCcw size={15} /> Reschedule
                </button>
              )}

              {details.status !== "Cancelled" && (
                <button
                  className="secondary-button"
                  onClick={() => setConfirmCancel(details)}
                >
                  <Ban size={15} /> Cancel Interview
                </button>
              )}

              {details.status !== "Completed" && details.status !== "Cancelled" && (
                <button
                  className="secondary-button"
                  onClick={() => updateInterview(details.id, { status: "No-show" })}
                >
                  <UserX size={15} /> Mark No-show
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {details && reschedule && (
        <div className="modal-backdrop" onMouseDown={() => setReschedule(null)}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Reschedule Interview</h2>
                <p>{details.candidate} — {details.job}</p>
              </div>

              <button className="icon-button" onClick={() => setReschedule(null)} aria-label="Close">
                <X size={19} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                New date
                <input
                  type="date"
                  value={reschedule.date}
                  onChange={(e) => setReschedule((r) => ({ ...r, date: e.target.value }))}
                />
              </label>

              <label>
                New time
                <input
                  type="time"
                  value={reschedule.time}
                  onChange={(e) => setReschedule((r) => ({ ...r, time: e.target.value }))}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setReschedule(null)}>
                Cancel
              </button>
              <button className="primary-button" onClick={saveReschedule}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <ConfirmDialog
          title="Cancel this interview?"
          message={`The interview with ${confirmCancel.candidate} will be marked as cancelled. The candidate should be notified separately.`}
          confirmLabel="Cancel interview"
          tone="danger"
          onConfirm={handleCancelInterview}
          onCancel={() => setConfirmCancel(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this interview?"
          message={`This will permanently remove the interview with ${confirmDelete.candidate}.`}
          confirmLabel="Delete interview"
          tone="danger"
          onConfirm={handleDeleteInterview}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function AgendaRow({ interview, onOpen }) {
  return (
    <button className="agenda-row" onClick={() => onOpen(interview)}>
      <div className="agenda-row-time">
        <strong>{interview.time}</strong>
        <span>{interview.date}</span>
      </div>

      <div className="candidate-avatar">
        {interview.candidate.split(" ").map((x) => x[0]).join("").slice(0, 2)}
      </div>

      <div className="agenda-row-main">
        <strong>{interview.candidate}</strong>
        <span>{interview.job} · {interview.type}</span>
      </div>

      <span className={`status-badge ${STATUS_TONE[interview.status] || "blue"}`}>
        {interview.status}
      </span>
    </button>
  );
}

function Summary({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

function InterviewModal({ candidates, onClose, onSave }) {
  const [form, setForm] = useState({
    candidate: candidates[0]?.name || "",
    email: candidates[0]?.email || "",
    job: candidates[0]?.appliedFor || "",
    department: candidates[0]?.department || "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    duration: "45 min",
    interviewer: "HR Manager",
    type: "Technical Interview",
    meetingLink: "",
    notes: "",
    status: "Scheduled",
  });

  const update = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const selectCandidate = (name) => {
    const candidate = candidates.find((item) => item.name === name);
    if (!candidate) return;

    setForm((old) => ({
      ...old,
      candidate: candidate.name,
      email: candidate.email,
      job: candidate.appliedFor,
      department: candidate.department,
    }));
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Schedule Interview</h2>
            <p>Set up a candidate interview.</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <div className="form-grid">
            <label>
              Candidate
              <select value={form.candidate} onChange={(e) => selectCandidate(e.target.value)}>
                {candidates.map((candidate) => (
                  <option key={candidate.id}>{candidate.name}</option>
                ))}
              </select>
            </label>

            <label>
              Interview type
              <select value={form.type} onChange={(e) => update("type", e.target.value)}>
                <option>Technical Interview</option>
                <option>Portfolio Review</option>
                <option>Hiring Manager</option>
                <option>Final Interview</option>
                <option>Screening Call</option>
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </label>

            <label>
              Time
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </label>

            <label>
              Duration
              <select value={form.duration} onChange={(e) => update("duration", e.target.value)}>
                <option>30 min</option>
                <option>45 min</option>
                <option>60 min</option>
                <option>90 min</option>
              </select>
            </label>

            <label>
              Interviewer
              <input
                value={form.interviewer}
                onChange={(e) => update("interviewer", e.target.value)}
              />
            </label>
          </div>

          <label>
            Meeting link
            <input
              value={form.meetingLink}
              onChange={(e) => update("meetingLink", e.target.value)}
              placeholder="https://meet.example.com/..."
            />
          </label>

          <label>
            Notes
            <textarea rows="4" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
