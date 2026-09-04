import React, { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Save,
  RotateCcw,
  ArrowRight,
  Moon,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";

export default function Settings() {
  const {
    settings,
    updateSettings,
    resetRecruiterData,
  } = useRecruiterData();
  const { showToast } = useToast();
  const { theme, onToggleTheme } = useOutletContext() || {};

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.recruiterName.trim()) next.recruiterName = "Account name is required.";
    if (!form.recruiterEmail.trim()) {
      next.recruiterEmail = "Account email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.recruiterEmail)) {
      next.recruiterEmail = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isValid = form.recruiterName?.trim() && form.recruiterEmail?.trim();

  const save = () => {
    if (!validate()) {
      showToast("Fix the highlighted fields before saving.", "error");
      return;
    }

    updateSettings(form);
    setSaved(true);
    showToast("Settings saved successfully.", "success");

    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Settings</h1>
          <p className="page-subtitle">
            Manage your recruiter profile, company and
            notifications.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={save}
          disabled={!isValid}
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="success-alert">
          Settings saved successfully.
        </div>
      )}

      <div className="settings-layout">
        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <User size={18} />
            </div>

            <div>
              <h2>Recruiter Profile</h2>
              <p>Your name, title, contact info and bio.</p>
            </div>
          </div>

          <Link to="/recruiter/profile" className="settings-link-out">
            Manage recruiter profile <ArrowRight size={15} />
          </Link>
        </section>

        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Building2 size={18} />
            </div>

            <div>
              <h2>Company</h2>
              <p>Company details, benefits and links shown to candidates.</p>
            </div>
          </div>

          <Link to="/recruiter/company-profile" className="settings-link-out">
            Manage company profile <ArrowRight size={15} />
          </Link>
        </section>

        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <User size={18} />
            </div>

            <div>
              <h2>Account</h2>
              <p>Basic account credentials used for sign-in.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Account name
              <input
                value={form.recruiterName}
                onChange={(e) =>
                  update("recruiterName", e.target.value)
                }
              />
              {errors.recruiterName && (
                <span className="field-error">{errors.recruiterName}</span>
              )}
            </label>

            <label>
              Account email
              <input
                type="email"
                value={form.recruiterEmail}
                onChange={(e) =>
                  update("recruiterEmail", e.target.value)
                }
              />
              {errors.recruiterEmail && (
                <span className="field-error">{errors.recruiterEmail}</span>
              )}
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Moon size={18} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>Switch between light and dark theme across the recruiter dashboard.</p>
            </div>
          </div>

          {onToggleTheme && (
            <Toggle
              label="Dark mode"
              description="Applies across both the recruiter and candidate dashboards."
              checked={theme === "dark"}
              onChange={onToggleTheme}
            />
          )}
        </section>

        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Bell size={18} />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>Choose which recruiter notifications you receive.</p>
            </div>
          </div>

          <Toggle
            label="Email notifications"
            description="Receive important recruiter updates."
            checked={form.emailNotifications}
            onChange={(value) =>
              update("emailNotifications", value)
            }
          />

          <Toggle
            label="Interview reminders"
            description="Get reminders before scheduled interviews."
            checked={form.interviewReminders}
            onChange={(value) =>
              update("interviewReminders", value)
            }
          />

          <Toggle
            label="Application alerts"
            description="Notify me when new applications arrive."
            checked={form.applicationAlerts}
            onChange={(value) =>
              update("applicationAlerts", value)
            }
          />

          <Toggle
            label="Weekly reports"
            description="Receive a weekly recruitment performance report."
            checked={form.weeklyReports}
            onChange={(value) =>
              update("weeklyReports", value)
            }
          />
        </section>

        <section className="settings-card danger-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Shield size={18} />
            </div>

            <div>
              <h2>Demo Data</h2>
              <p>
                Reset all recruiter data back to the original demo
                dataset.
              </p>
            </div>
          </div>

          <button
            className="danger-button"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw size={16} />
            Reset Demo Data
          </button>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset all recruiter data?"
          message="This will reset jobs, candidates, interviews, messages and settings back to the original demo dataset. This cannot be undone."
          confirmLabel="Reset data"
          tone="danger"
          onConfirm={() => {
            resetRecruiterData();
            setConfirmReset(false);
            showToast("Recruiter data reset.", "success");
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="toggle-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span className="toggle-switch" />
    </label>
  );
}