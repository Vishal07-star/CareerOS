import { useState } from "react";
import { Plus, Pencil, Trash2, BellRing } from "lucide-react";
import { useCandidateData } from "./CandidateDataContext";
import { useCandidateToast } from "./CandidateToastContext";
import { Modal, ConfirmDialog } from "./Modal";

function AlertModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { keyword: "", location: "", jobType: "Any", salaryRange: "", frequency: "Daily" });
  const valid = form.keyword.trim();

  return (
    <Modal
      title={initial ? "Edit Job Alert" : "Create Job Alert"}
      onClose={onClose}
      width={480}
      footer={<>
        <button className="outline-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>Save Alert</button>
      </>}
    >
      <div className="co-field"><label>Keyword <span className="required">*</span></label><input placeholder="e.g. Frontend Developer" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} /></div>
      <div className="co-field-row">
        <div className="co-field"><label>Location</label><input placeholder="e.g. Chennai" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div className="co-field">
          <label>Job Type</label>
          <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
            <option>Any</option><option>Remote</option><option>Hybrid</option><option>On-site</option>
          </select>
        </div>
      </div>
      <div className="co-field-row">
        <div className="co-field"><label>Salary Range</label><input placeholder="e.g. 8-15 LPA" value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} /></div>
        <div className="co-field">
          <label>Frequency</label>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option>Instant</option><option>Daily</option><option>Weekly</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default function Alerts() {
  const { alerts, addAlert, updateAlert, deleteAlert, toggleAlert } = useCandidateData();
  const { showToast } = useCandidateToast();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <section className="overview-section">
      <div className="co-page-head">
        <div>
          <p className="co-eyebrow">NEVER MISS A ROLE</p>
          <h1>Job Alerts</h1>
          <p>Get notified automatically when new roles match your criteria.</p>
        </div>
        <button className="primary-button" onClick={() => setModal("new")}><Plus size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Create Alert</button>
      </div>

      {alerts.length === 0 && (
        <div className="co-empty-state">
          <div className="co-empty-icon"><BellRing size={22} /></div>
          <h3>No job alerts yet</h3>
          <p>Create an alert to get notified when matching roles are posted.</p>
          <button className="primary-button" onClick={() => setModal("new")}>Create Alert</button>
        </div>
      )}

      {alerts.map((alert) => (
        <div className="co-alert-card" key={alert.id}>
          <div className="co-alert-main">
            <strong>{alert.keyword}{alert.location ? ` — ${alert.location}` : ""}{alert.jobType && alert.jobType !== "Any" ? ` — ${alert.jobType}` : ""}</strong>
            <span>{alert.salaryRange ? `${alert.salaryRange} · ` : ""}{alert.frequency} alerts</span>
          </div>
          <div className="co-alert-actions">
            <label className="co-switch">
              <input type="checkbox" checked={alert.enabled} onChange={() => toggleAlert(alert.id)} />
              <span className="co-switch-track" />
            </label>
            <button className="co-icon-button" onClick={() => setModal({ initial: alert })} aria-label="Edit alert"><Pencil size={14} /></button>
            <button className="co-icon-button" onClick={() => setDeleteTarget(alert)} aria-label="Delete alert"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      {modal && (
        <AlertModal
          initial={modal === "new" ? null : modal.initial}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") addAlert(data); else updateAlert(modal.initial.id, data);
            showToast(modal === "new" ? "Job alert created." : "Job alert updated.", "success");
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this alert?"
          message={`The alert for "${deleteTarget.keyword}" will be removed.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteAlert(deleteTarget.id); showToast("Alert deleted.", "info"); setDeleteTarget(null); }}
        />
      )}
    </section>
  );
}
