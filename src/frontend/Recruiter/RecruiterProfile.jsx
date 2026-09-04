import React, { useState } from "react";
import { Save, X, Pencil, Mail, Phone, MapPin, Link } from "lucide-react";

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

export default function RecruiterProfile() {
  const { settings, updateSettings } = useRecruiterData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    recruiterName: settings.recruiterName,
    recruiterJobTitle: settings.recruiterJobTitle,
    recruiterEmail: settings.recruiterEmail,
    recruiterPhone: settings.recruiterPhone,
    recruiterLocation: settings.recruiterLocation,
    recruiterBio: settings.recruiterBio,
    recruiterLinkedin: settings.recruiterLinkedin,
  });
  const [errors, setErrors] = useState({});

  const change = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const startEdit = () => {
    setForm({
      recruiterName: settings.recruiterName,
      recruiterJobTitle: settings.recruiterJobTitle,
      recruiterEmail: settings.recruiterEmail,
      recruiterPhone: settings.recruiterPhone,
      recruiterLocation: settings.recruiterLocation,
      recruiterBio: settings.recruiterBio,
      recruiterLinkedin: settings.recruiterLinkedin,
    });
    setErrors({});
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setErrors({});
  };

  const validate = () => {
    const next = {};
    if (!form.recruiterName.trim()) next.recruiterName = "Full name is required.";

    if (!form.recruiterEmail.trim()) {
      next.recruiterEmail = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.recruiterEmail)) {
      next.recruiterEmail = "Enter a valid email address.";
    }

    if (form.recruiterPhone && !/^[\d\s()+-]{7,}$/.test(form.recruiterPhone)) {
      next.recruiterPhone = "Enter a valid phone number.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    updateSettings(form);
    setEditing(false);
    showToast("Profile updated.", "success");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Recruiter Profile</h1>
          <p className="page-subtitle">
            This is how you appear to candidates you message and interview.
          </p>
        </div>

        {!editing && (
          <button className="primary-button" onClick={startEdit}>
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar-large">
            {initialsFor(settings.recruiterName)}
          </div>

          <div>
            <h2>{settings.recruiterName}</h2>
            <p>{settings.recruiterJobTitle}</p>

            <div className="profile-meta-row">
              <span><Mail size={13} /> {settings.recruiterEmail}</span>
              {settings.recruiterPhone && (
                <span><Phone size={13} /> {settings.recruiterPhone}</span>
              )}
              {settings.recruiterLocation && (
                <span><MapPin size={13} /> {settings.recruiterLocation}</span>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="profile-section">
              <h3>About</h3>
              <p className="block-text">
                {settings.recruiterBio || "No bio added yet."}
              </p>
            </div>

            {settings.recruiterLinkedin && (
              <div className="profile-section">
                <h3>Links</h3>
                <a
                  className="profile-link"
                  href={`https://${settings.recruiterLinkedin.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Link size={14} /> {settings.recruiterLinkedin}
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="profile-edit-form">
            <div className="form-grid">
              <label>
                Full name
                <input
                  value={form.recruiterName}
                  onChange={(e) => change("recruiterName", e.target.value)}
                />
                {errors.recruiterName && (
                  <span className="field-error">{errors.recruiterName}</span>
                )}
              </label>

              <label>
                Job title
                <input
                  value={form.recruiterJobTitle}
                  onChange={(e) => change("recruiterJobTitle", e.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.recruiterEmail}
                  onChange={(e) => change("recruiterEmail", e.target.value)}
                />
                {errors.recruiterEmail && (
                  <span className="field-error">{errors.recruiterEmail}</span>
                )}
              </label>

              <label>
                Phone
                <input
                  value={form.recruiterPhone}
                  onChange={(e) => change("recruiterPhone", e.target.value)}
                />
                {errors.recruiterPhone && (
                  <span className="field-error">{errors.recruiterPhone}</span>
                )}
              </label>

              <label>
                Location
                <input
                  value={form.recruiterLocation}
                  onChange={(e) => change("recruiterLocation", e.target.value)}
                />
              </label>

              <label>
                LinkedIn
                <input
                  value={form.recruiterLinkedin}
                  onChange={(e) => change("recruiterLinkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </label>
            </div>

            <label>
              Bio
              <textarea
                rows="4"
                value={form.recruiterBio}
                onChange={(e) => change("recruiterBio", e.target.value)}
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
