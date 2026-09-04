import { useMemo, useState } from "react";
import { ChevronRight, Search, Briefcase } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import ApplicationDetailModal from "./ApplicationDetailModal";

const STATUS_CLASS = {
  Applied: "co-status-applied",
  "Under Review": "co-status-underreview",
  Shortlisted: "co-status-shortlisted",
  Interview: "co-status-interview",
  Offer: "co-status-offer",
  Hired: "co-status-hired",
  Rejected: "co-status-rejected",
  Withdrawn: "co-status-withdrawn",
};

const NEXT_ACTION = {
  Applied: "Awaiting review",
  "Under Review": "Awaiting response",
  Shortlisted: "Prepare for interview",
  Interview: "Attend interview",
  Offer: "Respond to offer",
  Hired: "Onboarding",
  Rejected: "—",
  Withdrawn: "—",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
];

export default function Applications() {
  const { applications, getJob } = useCandidateData();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const enriched = useMemo(
    () => applications.map((a) => ({ ...a, job: getJob(a.jobId) })).filter((a) => a.job),
    [applications, getJob]
  );

  const filtered = useMemo(() => {
    return enriched.filter((a) => {
      if (query && !`${a.job.title} ${a.job.company}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "active") return !["Rejected", "Withdrawn", "Hired"].includes(a.status);
      if (filter === "interview") return a.status === "Interview";
      if (filter === "offer") return a.status === "Offer" || a.status === "Hired";
      if (filter === "rejected") return a.status === "Rejected";
      if (filter === "withdrawn") return a.status === "Withdrawn";
      return true;
    });
  }, [enriched, filter, query]);

  const counts = useMemo(() => ({
    all: enriched.length,
    active: enriched.filter((a) => !["Rejected", "Withdrawn", "Hired"].includes(a.status)).length,
    interview: enriched.filter((a) => a.status === "Interview").length,
    offer: enriched.filter((a) => a.status === "Offer" || a.status === "Hired").length,
    rejected: enriched.filter((a) => a.status === "Rejected").length,
    withdrawn: enriched.filter((a) => a.status === "Withdrawn").length,
  }), [enriched]);

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">TRACK YOUR PROGRESS</p>
          <h1>My Applications</h1>
          <p>Keep track of every role you've applied to and where it stands.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
        <div className="co-tabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={`co-tab ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label} <span className="co-tab-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="co-search-field" style={{ maxWidth: 260 }}>
          <Search size={15} />
          <input placeholder="Search applications" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="co-table-card">
        <div className="co-table-head">
          <span>Job</span><span>Applied</span><span>Status</span><span>Last Updated</span><span>Next Action</span><span></span>
        </div>

        {filtered.length === 0 && (
          <div className="co-empty-state" style={{ padding: "48px 20px" }}>
            <div className="co-empty-icon"><Briefcase size={22} /></div>
            <h3>No applications found</h3>
            <p>Try a different filter, or head to Find Jobs to apply.</p>
          </div>
        )}

        {filtered.map((a) => (
          <div className="co-table-row" key={a.id} onClick={() => setSelected(a)}>
            <div className="co-table-job">
              <div className="application-logo">{a.job.companyInitials}</div>
              <div><strong>{a.job.title}</strong><span>{a.job.company}</span></div>
            </div>
            <div className="co-table-cell">{a.appliedDate}</div>
            <div><span className={`co-status-pill ${STATUS_CLASS[a.status]}`}>{a.status}</span></div>
            <div className="co-table-cell">{a.lastUpdated}</div>
            <div className="co-table-cell">{NEXT_ACTION[a.status]}</div>
            <ChevronRight size={16} color="var(--co-ink-faint)" />
          </div>
        ))}
      </div>

      <div className="co-app-cards">
        {filtered.map((a) => (
          <div className="co-app-mini-card" key={a.id} onClick={() => setSelected(a)}>
            <div className="co-app-mini-top">
              <div>
                <strong>{a.job.title}</strong>
                <span>{a.job.company}</span>
              </div>
              <span className={`co-status-pill ${STATUS_CLASS[a.status]}`}>{a.status}</span>
            </div>
            <div className="co-app-mini-meta">
              <span>Applied {a.appliedDate}</span>
              <span>{NEXT_ACTION[a.status]}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && <ApplicationDetailModal application={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
