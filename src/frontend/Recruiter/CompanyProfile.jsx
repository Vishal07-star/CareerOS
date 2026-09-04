import React, { useMemo, useState } from "react";
import {
  Save,
  X,
  Pencil,
  Globe,
  MapPin,
  Users,
  Link,
  Plus,
} from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import "./ProfilePages.css";

function initialsFor(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const FIELDS = [
  "companyName",
  "companyIndustry",
  "companySize",
  "companyWebsite",
  "companyLocation",
  "companyDescription",
  "companyLinkedin",
];

export default function CompanyProfile() {
  const { settings, updateSettings } = useRecruiterData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => pick(settings));
  const [benefitDraft, setBenefitDraft] = useState("");
  const [errors, setErrors] = useState({});

  const completion = useMemo(() => {
    const checks = [
      !!settings.companyName,
      !!settings.companyIndustry,
      !!settings.companySize,
      !!settings.companyWebsite,
      !!settings.companyLocation,
      settings.companyDescription?.length > 20,
      !!settings.companyLinkedin,
      settings.companyBenefits?.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [settings]);

  const change = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const startEdit = () => {
    setForm(pick(settings));
    setErrors({});
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!form.companyName.trim()) next.companyName = "Company name is required.";

    if (
      form.companyWebsite.trim() &&
      !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([/?#].*)?$/i.test(form.companyWebsite.trim())
    ) {
      next.companyWebsite = "Enter a valid website (e.g. www.company.com).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    updateSettings(form);
    setEditing(false);
    showToast("Company profile updated.", "success");
  };

  const addBenefit = () => {
    const value = benefitDraft.trim();
    if (!value) return;
    updateSettings({ companyBenefits: [...(settings.companyBenefits || []), value] });
    setBenefitDraft("");
  };

  const removeBenefit = (index) => {
    updateSettings({
      companyBenefits: settings.companyBenefits.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Employer brand</p>
          <h1>Company Profile</h1>
          <p className="page-subtitle">
            Shown to candidates on every job posting and message.
          </p>
        </div>

        {!editing && (
          <button className="primary-button" onClick={startEdit}>
            <Pencil size={16} />
            Edit Company Profile
          </button>
        )}
      </div>

      <div className="profile-completion">
        <div className="profile-completion-bar">
          <div style={{ width: `${completion}%` }} />
        </div>
        <span>{completion}% complete</span>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar-large square">
            {initialsFor(settings.companyName)}
          </div>

          <div>
            <h2>{settings.companyName}</h2>
            <p>{settings.companyIndustry}</p>

            <div className="profile-meta-row">
              {settings.companySize && (
                <span><Users size={13} /> {settings.companySize}</span>
              )}
              {settings.companyLocation && (
                <span><MapPin size={13} /> {settings.companyLocation}</span>
              )}
              {settings.companyWebsite && (
                <span><Globe size={13} /> {settings.companyWebsite}</span>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="profile-section">
              <h3>About</h3>
              <p className="block-text">
                {settings.companyDescription || "No company description added yet."}
              </p>
            </div>

            {settings.companyLinkedin && (
              <div className="profile-section">
                <h3>Links</h3>
                <a
                  className="profile-link"
                  href={`https://${settings.companyLinkedin.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Link size={14} /> {settings.companyLinkedin}
                </a>
              </div>
            )}

            <div className="profile-section">
              <h3>Benefits</h3>

              <div className="chip-row">
                {(settings.companyBenefits || []).map((benefit, index) => (
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

                {(settings.companyBenefits || []).length === 0 && (
                  <p className="muted-text">No benefits added yet.</p>
                )}
              </div>

              <div className="tag-input-row" style={{ marginTop: 10 }}>
                <input
                  value={benefitDraft}
                  onChange={(e) => setBenefitDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  placeholder="e.g. Unlimited PTO — press Enter to add"
                />
                <button type="button" className="secondary-button" onClick={addBenefit}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="profile-edit-form">
            <div className="form-grid">
              <label>
                Company name
                <input
                  value={form.companyName}
                  onChange={(e) => change("companyName", e.target.value)}
                />
                {errors.companyName && (
                  <span className="field-error">{errors.companyName}</span>
                )}
              </label>

              <label>
                Industry
                <input
                  value={form.companyIndustry}
                  onChange={(e) => change("companyIndustry", e.target.value)}
                />
              </label>

              <label>
                Company size
                <select
                  value={form.companySize}
                  onChange={(e) => change("companySize", e.target.value)}
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-500 employees</option>
                  <option>500+ employees</option>
                </select>
              </label>

              <label>
                Website
                <input
                  value={form.companyWebsite}
                  onChange={(e) => change("companyWebsite", e.target.value)}
                  placeholder="www.company.com"
                />
                {errors.companyWebsite && (
                  <span className="field-error">{errors.companyWebsite}</span>
                )}
              </label>

              <label>
                Location
                <input
                  value={form.companyLocation}
                  onChange={(e) => change("companyLocation", e.target.value)}
                />
              </label>

              <label>
                LinkedIn
                <input
                  value={form.companyLinkedin}
                  onChange={(e) => change("companyLinkedin", e.target.value)}
                  placeholder="linkedin.com/company/name"
                />
              </label>
            </div>

            <label>
              Company description
              <textarea
                rows="4"
                value={form.companyDescription}
                onChange={(e) => change("companyDescription", e.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button className="secondary-button" onClick={cancel}>
                <X size={16} /> Cancel
              </button>
              <button className="primary-button" onClick={save}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pick(settings) {
  const result = {};
  FIELDS.forEach((key) => {
    result[key] = settings[key] || "";
  });
  return result;
}
