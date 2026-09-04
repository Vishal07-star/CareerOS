import { useState } from "react";
import { X } from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  appliedFor: "",
  department: "",
  experience: "",
  skills: "",
};

export default function AddCandidateModal({ onClose }) {
  const {
    jobs,
    addCandidate,
    incrementJobApplicants,
    logActivity,
    addNotification,
  } = useRecruiterData();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email.";
    }
    if (!form.appliedFor.trim()) next.appliedFor = "Choose a role.";

    if (form.phone.trim() && !/^[\d\s()+-]{7,}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }

    if (form.experience && (Number(form.experience) < 0 || Number.isNaN(Number(form.experience)))) {
      next.experience = "Enter a valid number of years.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isValid =
    form.name.trim() && form.email.trim() && form.appliedFor.trim();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    const matchingJob = jobs.find((job) => job.title === form.appliedFor);

    addCandidate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim() || "Remote",
      appliedFor: form.appliedFor,
      department: matchingJob?.department || "General",
      experience: Number(form.experience) || 0,
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    });

    if (matchingJob) {
      incrementJobApplicants(matchingJob.id);
    }

    logActivity(`${form.name.trim()} was added as a new candidate.`, "candidate");
    addNotification({
      type: "candidate",
      title: "New candidate added",
      message: `${form.name.trim()} was added for ${form.appliedFor}.`,
    });

    showToast(`${form.name.trim()} added to your candidates.`, "success");
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Add candidate</h2>
            <p>Manually add a candidate to your talent pool.</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label>
              Full name
              <input
                type="text"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. Jordan Lee"
              />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="jordan.lee@email.com"
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label>
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && <small className="field-error">{errors.phone}</small>}
            </label>

            <label>
              Location
              <input
                type="text"
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="City, State or Remote"
              />
            </label>

            <label>
              Applying for
              <select
                value={form.appliedFor}
                onChange={(event) => setField("appliedFor", event.target.value)}
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.title}>
                    {job.title}
                  </option>
                ))}
              </select>
              {errors.appliedFor && (
                <small className="field-error">{errors.appliedFor}</small>
              )}
            </label>

            <label>
              Years of experience
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={(event) => setField("experience", event.target.value)}
                placeholder="0"
              />
              {errors.experience && (
                <small className="field-error">{errors.experience}</small>
              )}
            </label>
          </div>

          <label>
            Skills (comma separated)
            <input
              type="text"
              value={form.skills}
              onChange={(event) => setField("skills", event.target.value)}
              placeholder="React, Figma, SQL"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={!isValid || submitting}
            >
              {submitting ? "Adding…" : "Add candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
