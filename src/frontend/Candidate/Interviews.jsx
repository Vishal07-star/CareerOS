import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Clock, Video, MapPin, ExternalLink, CalendarPlus, RotateCcw, XCircle, Eye } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { Modal, ConfirmDialog } from "./Modal";

const STATUS_CLASS = { Scheduled: "co-status-scheduled", Completed: "co-status-completed", Cancelled: "co-status-cancelled" };

function monthShort(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}
function dayOfMonth(dateStr) {
  return new Date(dateStr + "T00:00:00").getDate();
}

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function Interviews() {
  const { interviews, getJob, rescheduleInterview, cancelInterview } = useCandidateData();
  const { showToast } = useCandidateToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState("upcoming");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const enriched = useMemo(
    () => interviews.map((i) => ({ ...i, job: getJob(i.jobId) })).filter((i) => i.job).sort((a, b) => a.date.localeCompare(b.date)),
    [interviews, getJob]
  );

  // Deep-link support: /candidate/interviews?open=<id>
  // Opens that interview's detail modal directly, adjusting the active
  // filter tab first so the card is visible. All state mutations happen
  // in one synchronous block to avoid a cascade-re-run where a mid-effect
  // setFilter would invalidate enriched, re-trigger the effect, and find
  // the ?open param already gone.
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId) return;

    const match = enriched.find((i) => String(i.id) === String(openId));
    if (!match) return;

    // Adjust filter tab so the target card is visible
    if (match.status === "Scheduled") setFilter("upcoming");
    else if (match.status === "Cancelled") setFilter("all");
    else if (match.status === "Completed") setFilter("completed");

    // Open the detail modal
    setDetailTarget(match);

    // Clean the URL — replace:true so Back doesn't re-open the modal
    setSearchParams((params) => {
      params.delete("open");
      return params;
    }, { replace: true });
  // enriched is memoised from interviews+getJob. filter is intentionally
  // omitted: we write filter here, we don't need to re-run because of it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, enriched]);

  const filtered = enriched.filter((i) => {
    if (filter === "upcoming") return i.status === "Scheduled";
    if (filter === "completed") return i.status === "Completed";
    if (filter === "cancelled") return i.status === "Cancelled";
    return true;
  });

  const handleAddToCalendar = (interview) => {
    showToast(`"${interview.job.title} interview" added to your calendar.`, "success");
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">STAY PREPARED</p>
          <h1>Interviews</h1>
          <p>Track upcoming interviews and manage your schedule.</p>
        </div>
      </div>

      <div className="co-tabs">
        <button className={`co-tab ${filter === "upcoming" ? "active" : ""}`} onClick={() => setFilter("upcoming")}>
          Upcoming <span className="co-tab-count">{enriched.filter((i) => i.status === "Scheduled").length}</span>
        </button>
        <button className={`co-tab ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Completed</button>
        <button className={`co-tab ${filter === "cancelled" ? "active" : ""}`} onClick={() => setFilter("cancelled")}>Cancelled</button>
        <button className={`co-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
      </div>

      <div className="co-interview-list" style={{ marginTop: 18 }}>
        {filtered.length === 0 && (
          <div className="co-empty-state">
            <div className="co-empty-icon"><Calendar size={22} /></div>
            <h3>No interviews here</h3>
            <p>When an interview is scheduled, it will show up in this list.</p>
          </div>
        )}

        {filtered.map((interview) => (
          <div className="co-interview-card" key={interview.id}>
            <div className="co-interview-date-block">
              <strong>{dayOfMonth(interview.date)}</strong>
              <span>{monthShort(interview.date)}</span>
            </div>

            <div className="co-interview-info">
              <h3>{interview.job.title}</h3>
              <p>{interview.job.company} · with {interview.interviewer}</p>
              <div className="co-interview-meta">
                <span><Clock size={12} /> {interview.time}</span>
                <span>{interview.type === "Video Call" ? <Video size={12} /> : <MapPin size={12} />} {interview.type}</span>
                <span className={`co-status-pill ${STATUS_CLASS[interview.status]}`}>{interview.status}</span>
              </div>
            </div>

            <div className="co-interview-actions">
              <button onClick={() => setDetailTarget(interview)}><Eye size={13} /><span>Details</span></button>
              {interview.status === "Scheduled" && (() => {
                const loc = interview.location || "";
                const isUrl = loc.startsWith("http://") || loc.startsWith("https://") || loc.startsWith("meet.") || loc.startsWith("zoom.");
                return isUrl ? (
                  <a
                    className="co-join-btn"
                    href={loc.startsWith("http") ? loc : `https://${loc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Join interview"
                  >
                    <ExternalLink size={13} /><span>Join</span>
                  </a>
                ) : interview.type === "Video Call" ? (
                  <button className="co-join-btn" onClick={() => showToast("Meeting link not yet shared by the recruiter.", "info")}>
                    <ExternalLink size={13} /><span>Join</span>
                  </button>
                ) : null;
              })()}
              {interview.status === "Scheduled" && (
                <>
                  <button onClick={() => handleAddToCalendar(interview)}><CalendarPlus size={13} /><span>Add to Calendar</span></button>
                  <button onClick={() => setRescheduleTarget(interview)}><RotateCcw size={13} /><span>Reschedule</span></button>
                  <button className="co-cancel-btn" onClick={() => setCancelTarget(interview)}><XCircle size={13} /><span>Cancel</span></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailTarget && (
        <Modal title={detailTarget.job.title} subtitle={`${detailTarget.job.company} interview details`} onClose={() => setDetailTarget(null)} width={480}>
          <div className="co-review-grid" style={{ marginBottom: 10 }}>
            <div>Interviewer<strong>{detailTarget.interviewer}</strong></div>
            <div>Type<strong>{detailTarget.type}</strong></div>
            <div>Date<strong>{detailTarget.date}</strong></div>
            <div>Time<strong>{detailTarget.time}</strong></div>
            <div>Status<strong>{detailTarget.status}</strong></div>
            <div>
              {detailTarget.type === "Video Call" ? "Meeting Link" : "Location"}
              <strong>
                {(() => {
                  const loc = detailTarget.location || "";
                  const isUrl = loc.startsWith("http://") || loc.startsWith("https://") || loc.startsWith("meet.") || loc.startsWith("zoom.");
                  return isUrl ? (
                    <a href={loc.startsWith("http") ? loc : `https://${loc}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--co-violet-600)" }}>
                      {loc} <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                    </a>
                  ) : loc || "—";
                })()}
              </strong>
            </div>
          </div>
        </Modal>
      )}

      {rescheduleTarget && (
        <RescheduleModal
          interview={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={(date, time) => {
            rescheduleInterview(rescheduleTarget.id, date, time);
            showToast("Interview rescheduled.", "success");
            setRescheduleTarget(null);
          }}
        />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this interview?"
          message={`This will cancel your ${cancelTarget.job.title} interview with ${cancelTarget.interviewer}. You can't undo this.`}
          confirmLabel="Cancel Interview"
          tone="danger"
          onCancel={() => setCancelTarget(null)}
          onConfirm={() => {
            cancelInterview(cancelTarget.id);
            showToast("Interview cancelled.", "info");
            setCancelTarget(null);
          }}
        />
      )}
    </section>
  );
}

function RescheduleModal({ interview, onClose, onConfirm }) {
  const [date, setDate] = useState(interview.date);
  const [time, setTime] = useState(interview.time);

  return (
    <Modal
      title="Reschedule Interview"
      subtitle={`${interview.job.title} · ${interview.job.company}`}
      onClose={onClose}
      width={480}
      footer={
        <>
          <button className="outline-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onConfirm(date, time)} disabled={!date || !time}>Confirm</button>
        </>
      }
    >
      <div className="co-field">
        <label>Select Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
      </div>
      <div className="co-field">
        <label>Select Available Time</label>
        <div className="co-time-slots">
          {SLOTS.map((slot) => (
            <div key={slot} className={`co-time-slot ${time === slot ? "selected" : ""}`} onClick={() => setTime(slot)}>
              {slot}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
