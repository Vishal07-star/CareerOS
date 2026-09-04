import React, { useState } from "react";
import { Plus, Pencil, Trash2, BellRing, X } from "lucide-react";

import { useRecruiterData } from "./RecruiterDataContext";
import { useToast } from "./ToastContext";
import ConfirmDialog from "./ConfirmDialog";

const ALERT_TYPES = [
  "New candidates",
  "Applications exceed",
  "Job deadline approaching",
  "Candidate waiting for review",
];

const NEEDS_THRESHOLD = new Set([
  "Applications exceed",
  "Job deadline approaching",
  "Candidate waiting for review",
]);

function describeAlert(alert) {
  switch (alert.type) {
    case "New candidates":
      return `Notify me when new candidates apply to ${alert.job === "All jobs" ? "any job" : alert.job}.`;
    case "Applications exceed":
      return `Notify me when ${alert.job === "All jobs" ? "any job" : alert.job} passes ${alert.threshold || 0} applications.`;
    case "Job deadline approaching":
      return `Notify me ${alert.threshold || 0} day${alert.threshold === 1 ? "" : "s"} before ${alert.job === "All jobs" ? "a job's" : `"${alert.job}"'s`} deadline.`;
    case "Candidate waiting for review":
      return `Notify me when a candidate has waited ${alert.threshold || 0}+ days without review.`;
    default:
      return "";
  }
}

function AlertModal({ initial, jobs, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || {
      type: "New candidates",
      job: "All jobs",
      threshold: 50,
    }
  );

  const change = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{initial ? "Edit Hiring Alert" : "Create Hiring Alert"}</h2>
            <p>Get notified automatically when this condition is met.</p>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Alert type
            <select value={form.type} onChange={(e) => change("type", e.target.value)}>
              {ALERT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Job
            <select value={form.job} onChange={(e) => change("job", e.target.value)}>
              <option>All jobs</option>
              {jobs.map((job) => (
                <option key={job.id}>{job.title}</option>
              ))}
            </select>
          </label>

          {NEEDS_THRESHOLD.has(form.type) && (
            <label>
              {form.type === "Applications exceed" ? "Applicant threshold" : "Days"}
              <input
                type="number"
                min="0"
                value={form.threshold}
                onChange={(e) => change("threshold", Number(e.target.value))}
              />
            </label>
          )}
        </div>

        <p className="muted-text">{describeAlert(form)}</p>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Save Alert
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HiringAlerts() {
  const {
    hiringAlerts,
    jobs,
    addHiringAlert,
    updateHiringAlert,
    deleteHiringAlert,
    toggleHiringAlert,
  } = useRecruiterData();

  const { showToast } = useToast();
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Stay ahead of hiring</p>
          <h1>Hiring Alerts</h1>
          <p className="page-subtitle">
            Get notified automatically when a hiring condition needs your attention.
          </p>
        </div>

        <button className="primary-button" onClick={() => setModal("new")}>
          <Plus size={17} />
          Create Alert
        </button>
      </div>

      {hiringAlerts.length === 0 ? (
        <div className="empty-state">
          <BellRing size={32} />
          <h3>No hiring alerts yet</h3>
          <p>Create an alert to get notified about hiring activity automatically.</p>
          <button className="primary-button" onClick={() => setModal("new")}>
            Create Alert
          </button>
        </div>
      ) : (
        <div className="panel">
          <div className="alert-list">
            {hiringAlerts.map((alert) => (
              <div className="alert-row" key={alert.id}>
                <div className="alert-row-icon">
                  <BellRing size={17} />
                </div>

                <div className="alert-row-main">
                  <strong>{alert.type}</strong>
                  <span>{describeAlert(alert)}</span>
                </div>

                <label className="toggle-switch-wrap">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={() => toggleHiringAlert(alert.id)}
                  />
                  <span className="toggle-switch" />
                </label>

                <div className="table-actions">
                  <button
                    className="row-action"
                    onClick={() => setModal({ initial: alert })}
                    aria-label="Edit alert"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="row-action danger-action"
                    onClick={() => setConfirmDelete(alert)}
                    aria-label="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <AlertModal
          initial={modal === "new" ? null : modal.initial}
          jobs={jobs}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") {
              addHiringAlert(data);
              showToast("Hiring alert created.", "success");
            } else {
              updateHiringAlert(modal.initial.id, data);
              showToast("Hiring alert updated.", "success");
            }
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this alert?"
          message={`The "${confirmDelete.type}" alert will be removed.`}
          confirmLabel="Delete alert"
          tone="danger"
          onConfirm={() => {
            deleteHiringAlert(confirmDelete.id);
            showToast("Alert deleted.", "success");
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
