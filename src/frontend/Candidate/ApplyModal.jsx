import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { UploadCloud, FileText, X, Check, CheckCircle2 } from "lucide-react";

const STEPS = ["Personal", "Professional", "Documents", "Questions", "Review"];

export default function ApplyModal({ job, onClose, onSubmitted }) {
  const { profile, resumes, uploadResume, submitApplication } = useCandidateData();
  const { showToast } = useCandidateToast();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const [personal, setPersonal] = useState({
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  });

  const [professional, setProfessional] = useState({
    currentTitle: profile.currentPosition,
    yearsExperience: profile.yearsExperience,
    skills: profile.skills.join(", "),
    education: profile.education[0] ? `${profile.education[0].degree}, ${profile.education[0].institution}` : "",
    currentCompany: profile.currentCompany,
    portfolioUrl: profile.links.portfolio,
    linkedinUrl: profile.links.linkedin,
    githubUrl: profile.links.github,
  });

  const [selectedResumeId, setSelectedResumeId] = useState(resumes.find((r) => r.isPrimary)?.id || resumes[0]?.id || null);
  const [coverLetterName, setCoverLetterName] = useState("");

  const [answers, setAnswers] = useState({
    motivation: "",
    noticePeriod: "Immediate",
    authorized: "Yes",
    workMode: [],
  });

  function validateStep(current) {
    const e = {};
    if (current === 0) {
      if (!personal.fullName.trim()) e.fullName = "Full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) e.email = "Enter a valid email address.";
      if (!personal.phone.trim()) e.phone = "Phone number is required.";
      if (!personal.location.trim()) e.location = "Location is required.";
    }
    if (current === 1) {
      if (!professional.currentTitle.trim()) e.currentTitle = "Current job title is required.";
      if (!professional.yearsExperience.toString().trim()) e.yearsExperience = "Years of experience is required.";
    }
    if (current === 2) {
      if (!selectedResumeId) e.resume = "Please select or upload a resume.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function jumpTo(i) {
    setStep(i);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const record = await uploadResume(file);
    setSelectedResumeId(record.id);
    setUploading(false);
    showToast("Resume uploaded.", "success");
    setErrors((cur) => ({ ...cur, resume: undefined }));
  }

  function toggleWorkMode(mode) {
    setAnswers((cur) => ({
      ...cur,
      workMode: cur.workMode.includes(mode) ? cur.workMode.filter((m) => m !== mode) : [...cur.workMode, mode],
    }));
  }

  function handleSubmit() {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      showToast("Please complete all required fields before submitting.", "error");
      return;
    }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    const application = submitApplication(job.id, {
      personal, professional,
      resumeName: resume?.name,
      coverLetterName,
      answers,
    });
    setSubmitted(application);
    showToast(`Applied to ${job.title} at ${job.company}!`, "success");
    onSubmitted?.(application);
  }

  if (submitted) {
    return (
      <Modal onClose={onClose} width={480}>
        <div className="co-success-state">
          <div className="co-success-icon"><CheckCircle2 size={34} /></div>
          <h2>Application Submitted!</h2>
          <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been sent. You can track its progress from My Applications.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="outline-button" onClick={onClose}>Browse More Jobs</button>
            <button className="primary-button" onClick={onClose}>View Application</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Apply — ${job.title}`}
      subtitle={job.company}
      onClose={onClose}
      width={620}
      footer={
        <>
          {step > 0 && <button className="outline-button" onClick={goBack}>Back</button>}
          <div style={{ flex: 1 }} />
          <button className="outline-button" onClick={onClose}>Cancel</button>
          {step < STEPS.length - 1 && <button className="primary-button" onClick={goNext}>Continue</button>}
          {step === STEPS.length - 1 && <button className="primary-button" onClick={handleSubmit}>Submit Application</button>}
        </>
      }
    >
      <div className="co-stepper">
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "contents" }}>
            <div className={`co-stepper-item ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="co-stepper-dot">{i < step ? <Check size={14} /> : i + 1}</div>
              <span>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`co-stepper-line ${i < step ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div className={`co-field ${errors.fullName ? "has-error" : ""}`}>
            <label>Full Name <span className="required">*</span></label>
            <input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
            {errors.fullName && <span className="co-field-error">{errors.fullName}</span>}
          </div>
          <div className="co-field-row">
            <div className={`co-field ${errors.email ? "has-error" : ""}`}>
              <label>Email <span className="required">*</span></label>
              <input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
              {errors.email && <span className="co-field-error">{errors.email}</span>}
            </div>
            <div className={`co-field ${errors.phone ? "has-error" : ""}`}>
              <label>Phone <span className="required">*</span></label>
              <input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
              {errors.phone && <span className="co-field-error">{errors.phone}</span>}
            </div>
          </div>
          <div className={`co-field ${errors.location ? "has-error" : ""}`}>
            <label>Location <span className="required">*</span></label>
            <input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
            {errors.location && <span className="co-field-error">{errors.location}</span>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="co-field-row">
            <div className={`co-field ${errors.currentTitle ? "has-error" : ""}`}>
              <label>Current Job Title <span className="required">*</span></label>
              <input value={professional.currentTitle} onChange={(e) => setProfessional({ ...professional, currentTitle: e.target.value })} />
              {errors.currentTitle && <span className="co-field-error">{errors.currentTitle}</span>}
            </div>
            <div className={`co-field ${errors.yearsExperience ? "has-error" : ""}`}>
              <label>Years of Experience <span className="required">*</span></label>
              <input value={professional.yearsExperience} onChange={(e) => setProfessional({ ...professional, yearsExperience: e.target.value })} />
              {errors.yearsExperience && <span className="co-field-error">{errors.yearsExperience}</span>}
            </div>
          </div>
          <div className="co-field">
            <label>Current Company</label>
            <input value={professional.currentCompany} onChange={(e) => setProfessional({ ...professional, currentCompany: e.target.value })} />
          </div>
          <div className="co-field">
            <label>Skills</label>
            <input value={professional.skills} onChange={(e) => setProfessional({ ...professional, skills: e.target.value })} />
          </div>
          <div className="co-field">
            <label>Education</label>
            <input value={professional.education} onChange={(e) => setProfessional({ ...professional, education: e.target.value })} />
          </div>
          <div className="co-field-row">
            <div className="co-field">
              <label>Portfolio URL</label>
              <input value={professional.portfolioUrl} onChange={(e) => setProfessional({ ...professional, portfolioUrl: e.target.value })} />
            </div>
            <div className="co-field">
              <label>LinkedIn URL</label>
              <input value={professional.linkedinUrl} onChange={(e) => setProfessional({ ...professional, linkedinUrl: e.target.value })} />
            </div>
          </div>
          <div className="co-field">
            <label>GitHub URL</label>
            <input value={professional.githubUrl} onChange={(e) => setProfessional({ ...professional, githubUrl: e.target.value })} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="co-field">
            <label>Resume <span className="required">*</span></label>
            {resumes.map((r) => (
              <label key={r.id} className="co-radio-option" style={{ marginBottom: 8 }}>
                <input type="radio" name="resume" checked={selectedResumeId === r.id} onChange={() => setSelectedResumeId(r.id)} />
                <FileText size={15} style={{ color: "var(--co-violet-700)" }} />
                {r.name} <span style={{ color: "var(--co-ink-faint)", marginLeft: "auto" }}>{r.size}</span>
              </label>
            ))}
            <div className="co-upload-zone" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={22} />
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>{uploading ? "Uploading…" : "Upload a different resume"}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5 }}>PDF, DOC or DOCX up to 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileSelect} />
            {errors.resume && <span className="co-field-error">{errors.resume}</span>}
          </div>

          <div className="co-field">
            <label>Cover Letter (optional)</label>
            {coverLetterName ? (
              <div className="co-file-row">
                <span className="co-file-icon"><FileText size={16} /></span>
                <div className="co-file-info"><strong>{coverLetterName}</strong><span>Attached</span></div>
                <div className="co-file-actions">
                  <button onClick={() => setCoverLetterName("")}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="co-upload-zone" onClick={() => coverInputRef.current?.click()}>
                <UploadCloud size={22} />
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>Upload cover letter</p>
              </div>
            )}
            <input ref={coverInputRef} type="file" hidden onChange={(e) => e.target.files?.[0] && setCoverLetterName(e.target.files[0].name)} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="co-field">
            <label>Why do you want to join this role?</label>
            <textarea value={answers.motivation} onChange={(e) => setAnswers({ ...answers, motivation: e.target.value })} placeholder="Share a few sentences…" />
          </div>
          <div className="co-field">
            <label>Notice Period</label>
            <select value={answers.noticePeriod} onChange={(e) => setAnswers({ ...answers, noticePeriod: e.target.value })}>
              <option>Immediate</option>
              <option>2 weeks</option>
              <option>1 month</option>
              <option>2+ months</option>
            </select>
          </div>
          <div className="co-field">
            <label>Are you authorized to work in this location?</label>
            <div className="co-radio-group" style={{ flexDirection: "row" }}>
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="co-radio-option" style={{ flex: 1 }}>
                  <input type="radio" name="authorized" checked={answers.authorized === opt} onChange={() => setAnswers({ ...answers, authorized: opt })} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="co-field">
            <label>Preferred work mode</label>
            <div className="co-checkbox-group" style={{ flexDirection: "row" }}>
              {["Remote", "Hybrid", "On-site"].map((mode) => (
                <label key={mode} className="co-checkbox-option" style={{ flex: 1 }}>
                  <input type="checkbox" checked={answers.workMode.includes(mode)} onChange={() => toggleWorkMode(mode)} />
                  {mode}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="co-review-block">
            <div className="co-review-block-head"><strong>Personal Information</strong><button onClick={() => jumpTo(0)}>Edit</button></div>
            <div className="co-review-grid">
              <div>Full Name<strong>{personal.fullName}</strong></div>
              <div>Email<strong>{personal.email}</strong></div>
              <div>Phone<strong>{personal.phone}</strong></div>
              <div>Location<strong>{personal.location}</strong></div>
            </div>
          </div>
          <div className="co-review-block">
            <div className="co-review-block-head"><strong>Professional Information</strong><button onClick={() => jumpTo(1)}>Edit</button></div>
            <div className="co-review-grid">
              <div>Current Title<strong>{professional.currentTitle}</strong></div>
              <div>Experience<strong>{professional.yearsExperience} yrs</strong></div>
              <div>Company<strong>{professional.currentCompany || "—"}</strong></div>
              <div>Skills<strong>{professional.skills || "—"}</strong></div>
            </div>
          </div>
          <div className="co-review-block">
            <div className="co-review-block-head"><strong>Documents</strong><button onClick={() => jumpTo(2)}>Edit</button></div>
            <div className="co-review-grid">
              <div>Resume<strong>{resumes.find((r) => r.id === selectedResumeId)?.name || "—"}</strong></div>
              <div>Cover Letter<strong>{coverLetterName || "Not attached"}</strong></div>
            </div>
          </div>
          <div className="co-review-block">
            <div className="co-review-block-head"><strong>Additional Questions</strong><button onClick={() => jumpTo(3)}>Edit</button></div>
            <div className="co-review-grid">
              <div>Notice Period<strong>{answers.noticePeriod}</strong></div>
              <div>Authorized<strong>{answers.authorized}</strong></div>
              <div>Work Mode<strong>{answers.workMode.join(", ") || "—"}</strong></div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
