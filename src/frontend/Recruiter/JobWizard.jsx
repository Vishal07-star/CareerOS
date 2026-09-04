import React, { useMemo, useState } from "react";
import {
  X,
  Check,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react";

import "./JobWizard.css";

const STEPS = [
  "Basic Info",
  "Compensation",
  "Description",
  "Application",
  "Screening",
  "Preview",
];

const QUESTION_TYPES = [
  "Text",
  "Textarea",
  "Select",
  "Multi-select",
  "Checkbox",
  "Radio",
  "Yes/No",
];

function emptyForm(job) {
  return {
    title: job?.title || "",
    department: job?.department || "Engineering",
    location: job?.location || "Remote",
    remote: job?.remote || "On-site",
    type: job?.type || "Full-time",
    experienceLevel: job?.experienceLevel || "Mid",

    salaryMin: job?.salaryMin || "",
    salaryMax: job?.salaryMax || "",
    currency: job?.currency || "USD",
    salaryPeriod: job?.salaryPeriod || "Year",
    benefits: job?.benefits || [],

    description: job?.description || "",
    responsibilities: job?.responsibilities || "",
    requirements: job?.requirements || "",
    preferredQualifications: job?.preferredQualifications || "",
    skills: job?.skills?.join(", ") || "",

    deadline: job?.deadline || "",
    resumeRequired: job?.resumeRequired ?? true,
    coverLetterRequired: job?.coverLetterRequired ?? false,
    portfolioRequired: job?.portfolioRequired ?? false,

    screeningQuestions: job?.screeningQuestions || [],

    status: job?.status || "Draft",
  };
}

export default function JobWizard({ job, onClose, onSave, initialStep = 0 }) {
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState(emptyForm(job));
  const [benefitDraft, setBenefitDraft] = useState("");
  const [errors, setErrors] = useState({});

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = (index) => {
    const next = {};

    if (index === 0) {
      if (!form.title.trim()) next.title = "Job title is required.";
      if (!form.location.trim()) next.location = "Location is required.";
    }

    if (index === 1) {
      if (form.salaryMin && Number(form.salaryMin) < 0) {
        next.salaryMin = "Salary can't be negative.";
      }
      if (form.salaryMax && Number(form.salaryMax) < 0) {
        next.salaryMax = "Salary can't be negative.";
      }
      if (
        !next.salaryMax &&
        form.salaryMin &&
        form.salaryMax &&
        Number(form.salaryMin) > Number(form.salaryMax)
      ) {
        next.salaryMax = "Max salary should be greater than min salary.";
      }
    }

    if (index === 2) {
      if (!form.description.trim()) {
        next.description = "Job description is required.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  const goToStep = (index) => {
    if (index <= step) setStep(index);
  };

  const addBenefit = () => {
    const value = benefitDraft.trim();
    if (!value) return;
    change("benefits", [...form.benefits, value]);
    setBenefitDraft("");
  };

  const removeBenefit = (index) => {
    change(
      "benefits",
      form.benefits.filter((_, i) => i !== index)
    );
  };

  const addQuestion = () => {
    change("screeningQuestions", [
      ...form.screeningQuestions,
      {
        id: Date.now() + Math.random(),
        prompt: "",
        type: "Text",
        required: false,
        options: "",
      },
    ]);
  };

  const updateQuestion = (id, changes) => {
    change(
      "screeningQuestions",
      form.screeningQuestions.map((q) =>
        q.id === id ? { ...q, ...changes } : q
      )
    );
  };

  const removeQuestion = (id) => {
    change(
      "screeningQuestions",
      form.screeningQuestions.filter((q) => q.id !== id)
    );
  };

  const moveQuestion = (id, direction) => {
    const list = [...form.screeningQuestions];
    const index = list.findIndex((q) => q.id === id);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    change("screeningQuestions", list);
  };

  const buildPayload = (status) => ({
    ...form,
    status,
    skills: form.skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    posted:
      status === "Active" ? job?.posted || "Today" : job?.posted || "Not published",
    daysLeft: status === "Active" ? job?.daysLeft || 30 : job?.daysLeft || 0,
  });

  const saveDraft = () => {
    onSave(buildPayload("Draft"));
  };

  const publish = () => {
    const stepZeroValid = validateStep(0);
    if (!stepZeroValid) {
      setStep(0);
      return;
    }

    const stepOneValid = validateStep(1);
    if (!stepOneValid) {
      setStep(1);
      return;
    }

    const stepTwoValid = validateStep(2);
    if (!stepTwoValid) {
      setStep(2);
      return;
    }

    onSave(buildPayload("Active"));
  };

  const salaryLabel = useMemo(() => {
    if (!form.salaryMin && !form.salaryMax) return "Not specified";
    const symbol = form.currency === "USD" ? "$" : form.currency + " ";
    return `${symbol}${form.salaryMin || "—"} - ${symbol}${
      form.salaryMax || "—"
    } / ${form.salaryPeriod.toLowerCase()}`;
  }, [form.salaryMin, form.salaryMax, form.currency, form.salaryPeriod]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-card job-wizard"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={job ? "Edit job" : "Create job"}
      >
        <div className="modal-header">
          <div>
            <h2>{job ? "Edit Job" : "Create Job"}</h2>
            <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <div className="wizard-steps" role="tablist">
          {STEPS.map((label, index) => (
            <button
              type="button"
              key={label}
              role="tab"
              aria-selected={index === step}
              className={`wizard-step ${index === step ? "active" : ""} ${
                index < step ? "done" : ""
              }`}
              onClick={() => goToStep(index)}
            >
              <span className="wizard-step-dot">
                {index < step ? <Check size={12} /> : index + 1}
              </span>
              <span className="wizard-step-label">{label}</span>
            </button>
          ))}
        </div>

        <div className="wizard-body">
          {step === 0 && (
            <div className="form-grid">
              <label>
                Job title
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => change("title", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </label>

              <label>
                Department
                <select
                  value={form.department}
                  onChange={(e) => change("department", e.target.value)}
                >
                  {["Engineering", "Design", "Marketing", "Product", "Sales", "HR"].map(
                    (d) => (
                      <option key={d}>{d}</option>
                    )
                  )}
                </select>
              </label>

              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) => change("location", e.target.value)}
                  placeholder="Remote / New York, NY"
                />
                {errors.location && (
                  <span className="field-error">{errors.location}</span>
                )}
              </label>

              <label>
                Remote preference
                <select
                  value={form.remote}
                  onChange={(e) => change("remote", e.target.value)}
                >
                  <option>On-site</option>
                  <option>Hybrid</option>
                  <option>Remote</option>
                </select>
              </label>

              <label>
                Employment type
                <select
                  value={form.type}
                  onChange={(e) => change("type", e.target.value)}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>

              <label>
                Experience level
                <select
                  value={form.experienceLevel}
                  onChange={(e) => change("experienceLevel", e.target.value)}
                >
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                  <option>Lead</option>
                  <option>Executive</option>
                </select>
              </label>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="form-grid">
                <label>
                  Minimum salary
                  <input
                    type="number"
                    min="0"
                    value={form.salaryMin}
                    onChange={(e) => change("salaryMin", e.target.value)}
                    placeholder="90000"
                  />
                  {errors.salaryMin && (
                    <span className="field-error">{errors.salaryMin}</span>
                  )}
                </label>

                <label>
                  Maximum salary
                  <input
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={(e) => change("salaryMax", e.target.value)}
                    placeholder="120000"
                  />
                  {errors.salaryMax && (
                    <span className="field-error">{errors.salaryMax}</span>
                  )}
                </label>

                <label>
                  Currency
                  <select
                    value={form.currency}
                    onChange={(e) => change("currency", e.target.value)}
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>INR</option>
                    <option>CAD</option>
                  </select>
                </label>

                <label>
                  Salary period
                  <select
                    value={form.salaryPeriod}
                    onChange={(e) => change("salaryPeriod", e.target.value)}
                  >
                    <option>Year</option>
                    <option>Month</option>
                    <option>Hour</option>
                  </select>
                </label>
              </div>

              <label>
                Benefits
                <div className="tag-input-row">
                  <input
                    value={benefitDraft}
                    onChange={(e) => setBenefitDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    placeholder="e.g. Health insurance — press Enter to add"
                  />
                  <button type="button" className="secondary-button" onClick={addBenefit}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </label>

              {form.benefits.length > 0 && (
                <div className="chip-row">
                  {form.benefits.map((benefit, index) => (
                    <span className="chip" key={benefit + index}>
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        aria-label={`Remove ${benefit}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <label>
                Job description
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(e) => change("description", e.target.value)}
                  placeholder="Describe the role, team and mission..."
                />
                {errors.description && (
                  <span className="field-error">{errors.description}</span>
                )}
              </label>

              <label>
                Responsibilities
                <textarea
                  rows="4"
                  value={form.responsibilities}
                  onChange={(e) => change("responsibilities", e.target.value)}
                  placeholder="One per line..."
                />
              </label>

              <label>
                Requirements
                <textarea
                  rows="4"
                  value={form.requirements}
                  onChange={(e) => change("requirements", e.target.value)}
                  placeholder="One per line..."
                />
              </label>

              <label>
                Preferred qualifications
                <textarea
                  rows="3"
                  value={form.preferredQualifications}
                  onChange={(e) =>
                    change("preferredQualifications", e.target.value)
                  }
                  placeholder="Nice-to-haves..."
                />
              </label>

              <label>
                Skills
                <input
                  value={form.skills}
                  onChange={(e) => change("skills", e.target.value)}
                  placeholder="React, TypeScript, CSS"
                />
              </label>
            </>
          )}

          {step === 3 && (
            <div className="form-grid">
              <label>
                Application deadline
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => change("deadline", e.target.value)}
                />
              </label>

              <div className="checkbox-stack">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.resumeRequired}
                    onChange={(e) => change("resumeRequired", e.target.checked)}
                  />
                  Resume required
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.coverLetterRequired}
                    onChange={(e) =>
                      change("coverLetterRequired", e.target.checked)
                    }
                  />
                  Cover letter required
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.portfolioRequired}
                    onChange={(e) => change("portfolioRequired", e.target.checked)}
                  />
                  Portfolio required
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="screening-builder">
              {form.screeningQuestions.length === 0 && (
                <div className="empty-state small">
                  <p>No screening questions yet. Add one to filter applicants.</p>
                </div>
              )}

              {form.screeningQuestions.map((q, index) => (
                <div className="screening-question" key={q.id}>
                  <div className="screening-question-head">
                    <GripVertical size={15} className="muted-icon" />
                    <span className="muted-text">Question {index + 1}</span>

                    <div className="screening-question-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => moveQuestion(q.id, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => moveQuestion(q.id, 1)}
                        disabled={index === form.screeningQuestions.length - 1}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => removeQuestion(q.id)}
                        aria-label="Delete question"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <input
                    value={q.prompt}
                    onChange={(e) =>
                      updateQuestion(q.id, { prompt: e.target.value })
                    }
                    placeholder="Question text"
                  />

                  <div className="form-grid">
                    <label>
                      Type
                      <select
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(q.id, { type: e.target.value })
                        }
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>

                    <label className="checkbox-row inline-checkbox">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(q.id, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                  </div>

                  {(q.type === "Select" ||
                    q.type === "Multi-select" ||
                    q.type === "Radio" ||
                    q.type === "Checkbox") && (
                    <input
                      value={q.options}
                      onChange={(e) =>
                        updateQuestion(q.id, { options: e.target.value })
                      }
                      placeholder="Comma-separated options"
                    />
                  )}
                </div>
              ))}

              <button type="button" className="secondary-button" onClick={addQuestion}>
                <Plus size={15} /> Add question
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="job-preview">
              <div className="job-preview-header">
                <h3>{form.title || "Untitled role"}</h3>
                <span className="status-badge yellow">Preview</span>
              </div>

              <div className="job-preview-meta">
                <span><Briefcase size={14} /> {form.department}</span>
                <span><MapPin size={14} /> {form.location} · {form.remote}</span>
                <span><Clock size={14} /> {form.type} · {form.experienceLevel}</span>
                <span><DollarSign size={14} /> {salaryLabel}</span>
              </div>

              {form.benefits.length > 0 && (
                <div className="chip-row">
                  {form.benefits.map((b) => (
                    <span className="chip static" key={b}>{b}</span>
                  ))}
                </div>
              )}

              <p className="job-preview-section-title">Description</p>
              <p className="block-text">{form.description || "—"}</p>

              {form.responsibilities && (
                <>
                  <p className="job-preview-section-title">Responsibilities</p>
                  <p className="block-text">{form.responsibilities}</p>
                </>
              )}

              {form.requirements && (
                <>
                  <p className="job-preview-section-title">Requirements</p>
                  <p className="block-text">{form.requirements}</p>
                </>
              )}

              {form.screeningQuestions.length > 0 && (
                <>
                  <p className="job-preview-section-title">
                    Screening questions ({form.screeningQuestions.length})
                  </p>
                  <ul className="preview-question-list">
                    {form.screeningQuestions.map((q) => (
                      <li key={q.id}>
                        {q.prompt || "Untitled question"}{" "}
                        {q.required && <span className="muted-text">· required</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="job-preview-section-title">Application settings</p>
              <p className="muted-text">
                Deadline: {form.deadline || "No deadline set"} · Resume{" "}
                {form.resumeRequired ? "required" : "optional"} · Cover letter{" "}
                {form.coverLetterRequired ? "required" : "optional"} · Portfolio{" "}
                {form.portfolioRequired ? "required" : "optional"}
              </p>
            </div>
          )}
        </div>

        <div className="modal-actions wizard-actions">
          <div className="wizard-actions-left">
            {step > 0 && (
              <button type="button" className="secondary-button" onClick={goBack}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>

          <div className="wizard-actions-right">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button type="button" className="secondary-button" onClick={saveDraft}>
              Save Draft
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" className="primary-button" onClick={goNext}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={publish}>
                Publish Job
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
