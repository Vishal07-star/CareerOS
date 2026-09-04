import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, IndianRupee, Bookmark, Briefcase } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import JobDetailsModal from "./JobDetailsModal";
import ApplyModal from "./ApplyModal";
import { computeMatch, formatSalary, formatPosted } from "./jobUtils";

const PAGE_SIZE = 6;

export default function JobsBoard() {
  const { jobs, profile, isJobSaved, toggleSaveJob, hasApplied, savedJobIds } = useCandidateData();
  const { showToast } = useCandidateToast();
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState("browse");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [department, setDepartment] = useState("");
  const [posted, setPosted] = useState("");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState("relevance");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [activeJob, setActiveJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);

  const companies = useMemo(() => [...new Set(jobs.map((j) => j.company))], [jobs]);
  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department))], [jobs]);

  const filtered = useMemo(() => {
    let list = jobs.filter((job) => {
      const source = tab === "saved" ? savedJobIds.includes(job.id) : true;
      if (!source) return false;
      if (query && !(`${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()))) return false;
      if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (locationType && job.locationType !== locationType) return false;
      if (jobType && job.type !== jobType) return false;
      if (experience && job.experienceLevel !== experience) return false;
      if (department && job.department !== department) return false;
      if (company && job.company !== company) return false;
      if (posted && job.postedDaysAgo > Number(posted)) return false;
      if (salary) {
        const [min, max] = salary.split("-").map(Number);
        if (job.salaryMax < min || job.salaryMin > max) return false;
      }
      return true;
    });

    if (sort === "latest") list = [...list].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    else if (sort === "salary") list = [...list].sort((a, b) => b.salaryMax - a.salaryMax);
    else list = [...list].sort((a, b) => computeMatch(b, profile) - computeMatch(a, profile));

    return list;
  }, [jobs, tab, savedJobIds, query, location, locationType, jobType, experience, department, company, posted, salary, sort, profile]);

  const visible = filtered.slice(0, visibleCount);

  const clearFilters = () => {
    setQuery(""); setLocation(""); setLocationType(""); setJobType("");
    setExperience(""); setSalary(""); setDepartment(""); setPosted(""); setCompany("");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">JOB DISCOVERY</p>
          <h1>Find Your Next Role</h1>
          <p>Search, filter, and apply to roles matched to your profile.</p>
        </div>
      </div>

      <div className="co-tabs">
        <button className={`co-tab ${tab === "browse" ? "active" : ""}`} onClick={() => { setTab("browse"); setVisibleCount(PAGE_SIZE); }}>
          Browse Jobs <span className="co-tab-count">{jobs.length}</span>
        </button>
        <button className={`co-tab ${tab === "saved" ? "active" : ""}`} onClick={() => { setTab("saved"); setVisibleCount(PAGE_SIZE); }}>
          <Bookmark size={13} /> Saved Jobs <span className="co-tab-count">{savedJobIds.length}</span>
        </button>
      </div>

      <div className="co-filter-panel">
        <div className="co-search-field">
          <Search size={15} />
          <input placeholder="Job title, company, or skill" value={query} onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }} />
        </div>
        <input className="co-filter-select" style={{ flex: 1, minWidth: 140 }} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <select className="co-filter-select" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
          <option value="">Remote / Hybrid / On-site</option>
          <option>Remote</option><option>Hybrid</option><option>On-site</option>
        </select>
        <select className="co-filter-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="">Job Type</option>
          <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
        </select>
        <select className="co-filter-select" value={experience} onChange={(e) => setExperience(e.target.value)}>
          <option value="">Experience Level</option>
          <option>Entry</option><option>Mid</option><option>Senior</option><option>Lead</option>
        </select>
        <select className="co-filter-select" value={salary} onChange={(e) => setSalary(e.target.value)}>
          <option value="">Salary Range</option>
          <option value="0-8">Up to 8 LPA</option>
          <option value="8-15">8–15 LPA</option>
          <option value="15-25">15–25 LPA</option>
          <option value="25-100">25+ LPA</option>
        </select>
        <select className="co-filter-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Department</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="co-filter-select" value={posted} onChange={(e) => setPosted(e.target.value)}>
          <option value="">Date Posted</option>
          <option value="1">Last 24 hours</option>
          <option value="7">Past week</option>
          <option value="30">Past month</option>
        </select>
        <select className="co-filter-select" value={company} onChange={(e) => setCompany(e.target.value)}>
          <option value="">Company</option>
          {companies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="co-clear-filters" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="co-results-bar">
        <span className="co-results-count"><strong>{filtered.length}</strong> job{filtered.length !== 1 ? "s" : ""} found</span>
        <select className="co-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="relevance">Sort: Relevance</option>
          <option value="latest">Sort: Latest</option>
          <option value="salary">Sort: Salary</option>
        </select>
      </div>

      <div className="co-jobs-grid">
        {visible.length === 0 && (
          <div className="co-empty-state">
            <div className="co-empty-icon"><Briefcase size={24} /></div>
            <h3>{tab === "saved" ? "No saved jobs yet" : "No jobs match your filters"}</h3>
            <p>{tab === "saved" ? "Save jobs you like and they'll show up here." : "Try adjusting or clearing your filters."}</p>
            {tab === "browse" && <button className="outline-button" onClick={clearFilters}>Clear Filters</button>}
          </div>
        )}

        {visible.map((job) => {
          const saved = isJobSaved(job.id);
          const applied = hasApplied(job.id);
          const match = computeMatch(job, profile);
          return (
            <div key={job.id} className="co-job-card" onClick={() => setActiveJob(job)}>
              <div className="co-job-card-top">
                <div className="company-logo">{job.companyInitials}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="co-match-badge">{match}% Match</span>
                  <button
                    className={`co-job-save ${saved ? "saved" : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); showToast(saved ? "Removed from saved jobs." : "Job saved.", "success"); }}
                    aria-label="Save job"
                  >
                    <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              <h3>{job.title}</h3>
              <p className="co-job-company">{job.company}</p>
              <div className="co-job-meta">
                <span><MapPin size={11} /> {job.location}</span>
                <span>{job.locationType}</span>
                <span>{job.type}</span>
                <span>{job.experienceLevel}</span>
              </div>
              <div className="co-job-skills">{job.skills.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
              <div className="co-job-bottom">
                <span className="co-job-salary"><IndianRupee size={13} />{formatSalary(job)}</span>
                <span className="co-job-posted">{formatPosted(job.postedDaysAgo)}</span>
              </div>
              <div className="co-job-actions">
                {applied ? (
                  <span className="co-job-applied-pill">Applied ✓</span>
                ) : (
                  <button className="apply-button" onClick={(e) => { e.stopPropagation(); setApplyJob(job); }}>Apply Now</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <button className="outline-button co-load-more" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
          Load More Jobs
        </button>
      )}

      {activeJob && (
        <JobDetailsModal
          job={activeJob}
          onClose={() => setActiveJob(null)}
          onApply={(job) => { setActiveJob(null); setApplyJob(job); }}
        />
      )}

      {applyJob && (
        <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
      )}
    </section>
  );
}
